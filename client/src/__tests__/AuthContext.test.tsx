import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { AuthResponse } from '../types/api';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockedAuth = vi.mocked(authService);

const authResponse: AuthResponse = {
  user: { id: 'u1', name: 'Juan Pérez', email: 'juan@example.com', createdAt: '2026-01-01T00:00:00.000Z' },
  token: 'jwt-token-123',
};

let ctx: ReturnType<typeof useAuth>;

const Consumer: React.FC = () => {
  // oxlint-disable-next-line react/globals -- patrón de test: capturar el contexto para las aserciones
  ctx = useAuth();
  return <div data-testid="status">{ctx.user ? ctx.user.name : 'anon'}</div>;
};

const renderProvider = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('inicia como anónimo cuando no hay sesión guardada', async () => {
    renderProvider();

    await waitFor(() => expect(ctx.loading).toBe(false));
    expect(screen.getByTestId('status').textContent).toBe('anon');
    expect(ctx.user).toBeNull();
  });

  it('hidrata el usuario desde localStorage si existe token + user', async () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(authResponse.user));

    renderProvider();

    await waitFor(() => expect(ctx.loading).toBe(false));
    expect(screen.getByTestId('status').textContent).toBe('Juan Pérez');
    expect(ctx.user?.email).toBe('juan@example.com');
  });

  it('login llama al servicio y persiste token + user en localStorage', async () => {
    mockedAuth.login.mockResolvedValue(authResponse);
    renderProvider();
    await waitFor(() => expect(ctx.loading).toBe(false));

    await act(async () => {
      await ctx.login({ email: 'juan@example.com', password: 'secret123' });
    });

    expect(mockedAuth.login).toHaveBeenCalledWith({
      email: 'juan@example.com',
      password: 'secret123',
    });
    expect(localStorage.getItem('token')).toBe('jwt-token-123');
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(authResponse.user);
    expect(screen.getByTestId('status').textContent).toBe('Juan Pérez');
  });

  it('register también inicia la sesión con el token devuelto', async () => {
    mockedAuth.register.mockResolvedValue(authResponse);
    renderProvider();
    await waitFor(() => expect(ctx.loading).toBe(false));

    await act(async () => {
      await ctx.register({ name: 'Juan Pérez', email: 'juan@example.com', password: 'Secret123' });
    });

    expect(mockedAuth.register).toHaveBeenCalledWith({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'Secret123',
    });
    expect(localStorage.getItem('token')).toBe('jwt-token-123');
    expect(screen.getByTestId('status').textContent).toBe('Juan Pérez');
  });

  it('logout revoca el token en el servidor y limpia la sesión local', async () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    renderProvider();
    await waitFor(() => expect(ctx.loading).toBe(false));
    expect(screen.getByTestId('status').textContent).toBe('Juan Pérez');

    await act(async () => {
      await ctx.logout();
    });

    expect(mockedAuth.logout).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('status').textContent).toBe('anon');
  });

  it('limpia la sesión local aunque el logout falle en el servidor', async () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    mockedAuth.logout.mockRejectedValue(new Error('network error'));
    renderProvider();
    await waitFor(() => expect(ctx.loading).toBe(false));

    await act(async () => {
      await ctx.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(ctx.user).toBeNull();
  });

  it('useAuth fuera del provider lanza un error claro', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useAuth debe usarse dentro de un <AuthProvider>'
    );
  });
});
