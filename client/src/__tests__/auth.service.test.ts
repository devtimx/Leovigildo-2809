import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import { authService } from '../services/auth.service';
import { AuthResponse } from '../types/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedPost = vi.mocked(api.post);

const authResponse: AuthResponse = {
  user: { id: 'u1', name: 'Juan', email: 'juan@example.com', createdAt: '2026-01-01T00:00:00.000Z' },
  token: 'jwt-token-123',
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login envía credenciales a POST /api/auth/login y retorna user + token', async () => {
    mockedPost.mockResolvedValue({ data: authResponse });

    const result = await authService.login({ email: 'juan@example.com', password: 'secret123' });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith('/api/auth/login', {
      email: 'juan@example.com',
      password: 'secret123',
    });
    expect(result).toEqual(authResponse);
    expect(result.token).toBe('jwt-token-123');
  });

  it('register envía datos a POST /api/auth/register y retorna user + token', async () => {
    mockedPost.mockResolvedValue({ data: authResponse });

    const result = await authService.register({
      name: 'Juan',
      email: 'juan@example.com',
      password: 'secret123',
    });

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/register', {
      name: 'Juan',
      email: 'juan@example.com',
      password: 'secret123',
    });
    expect(result.user.email).toBe('juan@example.com');
  });

  it('logout hace POST a /api/auth/logout (revoca el token en el servidor)', async () => {
    mockedPost.mockResolvedValue({ data: { message: 'Sesión cerrada' } });

    await authService.logout();

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/logout');
  });

  it('propaga el error cuando el backend rechaza las credenciales', async () => {
    mockedPost.mockRejectedValue(new Error('Credenciales incorrectas.'));

    await expect(
      authService.login({ email: 'juan@example.com', password: 'mala' })
    ).rejects.toThrow('Credenciales incorrectas.');
  });
});
