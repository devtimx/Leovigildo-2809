import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.midleware.js';
import betController from '../controllers/bet.controller.js';

const router = Router();

// POST /api/bets - Crear una nueva apuesta (Protegido)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await betController.createBet(req, res, next);
});

// GET /api/bets/my-bets - Obtener historial de apuestas del usuario (Protegido)
router.get('/my-bets', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await betController.getMyBets(req, res, next);
});

export default router;
