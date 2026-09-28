import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

// Extendemos de forma segura la interfaz de Request de Express
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  id: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de acceso no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    req.userId = decoded.id; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token de acceso inválido o expirado.' });
  }
};
