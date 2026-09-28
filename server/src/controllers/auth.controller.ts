import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service.js';
import blacklistService from '../services/blacklist.service.js';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        return;
      }

      const result = await authService.register({ name, email, password });
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'EL_USUARIO_YA_EXISTE') {
        res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        return;
      }
      next(error); // Envía el error al middleware global de app.ts
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'El correo y la contraseña son requeridos.' });
        return;
      }

      const result = await authService.login({ email, password });
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'CREDENCIALES_INVALIDAS') {
        res.status(401).json({ message: 'Credenciales incorrectas.' });
        return;
      }
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        // AGREGAR TOKEN A LA LISTA NEGRA EN EL BACKEND
        blacklistService.add(token);
      }
      
      // El cliente (Frontend) se encargará de borrar el token de su localStorage.
      res.status(200).json({
        message: 'Sesión cerrada exitosamente. El token ha sido revocado en el cliente.'
      });
    } catch (error) {
      next(error);
    }

  }
}

export default new AuthController();
