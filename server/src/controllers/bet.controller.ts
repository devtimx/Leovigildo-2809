import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.midleware.js';
import betService from '../services/bet.service.js';

class BetController {
  async createBet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { raceId, raceNumber, competitorId, competitorName, competitorNumber, amount } = req.body;

      const bet = await betService.placeBet(userId, {
        raceId,
        raceNumber: Number(raceNumber),
        competitorId,
        competitorName,
        competitorNumber: Number(competitorNumber),
        amount: Number(amount)
      });

      res.status(201).json({
        message: '¡Apuesta registrada exitosamente!',
        bet
      });
    } catch (error: any) {
      if (error.message === 'MONTO_INVALIDO') {
        res.status(400).json({ message: 'El monto de la apuesta debe ser mayor a cero.' });
        return;
      }
      if (error.message === 'CARRERA_NO_ENCONTRADA') {
        res.status(404).json({ message: 'La carrera especificada no existe.' });
        return;
      }
      if (error.message === 'CARRERA_YA_INICIADA_O_FINALIZADA') {
        res.status(400).json({ message: 'No se aceptan más apuestas para esta carrera. Ya inició o ha concluido.' });
        return;
      }
      if (error.message === 'SALDO_INSUFICIENTE') {
        res.status(400).json({ message: 'Fondos insuficientes en tu billetera. Por favor realiza una recarga.' });
        return;
      }
      next(error);
    }
  }

  async getMyBets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const bets = await betService.getUserBets(userId);
      res.status(200).json(bets);
    } catch (error) {
      next(error);
    }
  }
}

export default new BetController();
