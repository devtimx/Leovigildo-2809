import { Router, Request, Response, NextFunction } from 'express';
import authController from '../controllers/auth.controller.js'; // Recuerda usar la extensión .js
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.midleware.js'; // Recuerda usar la extensión .js

const router = Router();

// Ruta: POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  await authController.register(req, res, next);
});

// Ruta: POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  await authController.login(req, res, next);
});

// Ruta: POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await authController.logout(req, res, next);
});

export default router;
