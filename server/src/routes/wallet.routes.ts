import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.midleware.js';
import walletController from '../controllers/wallet.controller.js';

const router = Router();

// GET /api/wallet/balance - Obtener balance y estadísticas
router.get('/balance', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await walletController.getBalance(req, res, next);
});

// POST /api/wallet/deposit - Realizar recarga con SnailPay
router.post('/deposit', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await walletController.deposit(req, res, next);
});

export default router;
