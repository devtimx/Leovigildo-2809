import { describe, test, expect, vi, beforeEach } from 'vitest';
import authService from './auth.service.js';
import userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';

describe('AuthService - Autenticación y Registro', () => {
  const mockRegisterData = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    vi.restoreAllMocks(); // Limpia los espías y mocks entre pruebas
  });

  // --- PRUEBAS DE REGISTRO ---
  describe('register()', () => {
    test('Debe registrar un nuevo usuario exitosamente y retornar sus datos junto a un JWT único', async () => {
      // 1. Simular que el correo NO existe en la base de datos local
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      // 2. Simular la creación exitosa del usuario en el repositorio
      vi.spyOn(userRepository, 'create').mockResolvedValue({
        id: 'user-uuid-xyz',
        name: mockRegisterData.name,
        email: mockRegisterData.email,
        createdAt: new Date().toISOString()
      });

      const result = await authService.register(mockRegisterData);

      // Aserciones
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockRegisterData.email);
      expect(userRepository.create).toHaveBeenCalled();
      expect(result.user.id).toBe('user-uuid-xyz');
      expect(result.token).toBeDefined(); // Verifica que se generó el JWT
      expect(typeof result.token).toBe('string');
    });

    test('Debe fallar con error EL_USUARIO_YA_EXISTE si el email ya se encuentra en uso', async () => {
      // Simular que el usuario ya existe
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
        id: 'existing-id',
        name: 'Usuario Existente',
        email: mockRegisterData.email,
        password: '$2b$10$hashedpassword...',
        createdAt: new Date().toISOString()
      });

      // No debería llamarse al método create
      const createSpy = vi.spyOn(userRepository, 'create');

      await expect(authService.register(mockRegisterData))
        .rejects
        .toThrow('EL_USUARIO_YA_EXISTE');

      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  // --- PRUEBAS DE LOGIN ---
  describe('login()', () => {
    test('Debe autenticar correctamente si las credenciales coinciden con el hash de la contraseña', async () => {
      const plainPassword = 'mySecretPassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Simular que el usuario existe y tiene una contraseña hasheada
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
        id: 'user-uuid-123',
        name: 'Luis López',
        email: 'luis@example.com',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      });

      const result = await authService.login({
        email: 'luis@example.com',
        password: plainPassword
      });

      expect(result.user.email).toBe('luis@example.com');
      expect(result.token).toBeDefined();
      // Garantizar que la contraseña nunca se filtre en el objeto del usuario retornado
      expect((result.user as any).password).toBeUndefined();
    });

    test('Debe fallar con error CREDENCIALES_INVALIDAS si el usuario no existe', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login({ email: 'no-existe@example.com', password: '123' }))
        .rejects
        .toThrow('CREDENCIALES_INVALIDAS');
    });

    test('Debe fallar con error CREDENCIALES_INVALIDAS si la contraseña en texto plano no coincide con el hash', async () => {
      const realPasswordHash = await bcrypt.hash('password_correcto', 10);

      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
        id: 'user-uuid-123',
        name: 'Luis López',
        email: 'luis@example.com',
        password: realPasswordHash,
        createdAt: new Date().toISOString()
      });

      // Intentamos loguear con una contraseña errónea
      await expect(authService.login({ email: 'luis@example.com', password: 'password_incorrecto' }))
        .rejects
        .toThrow('CREDENCIALES_INVALIDAS');
    });
  });
});
