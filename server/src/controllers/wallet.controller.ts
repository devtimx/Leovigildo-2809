import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.midleware.js';
import snailPayService from '../services/snailpay.service.js';
import walletRepository from '../repositories/wallet.repository.js';
import userRepository from '../repositories/user.repository.js';
import { ENV } from '../config/env.js';

class WalletController {
  async deposit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { cardNumber, expiryDate, cvv, fullName, amount } = req.body;

      // Obtener el correo del usuario autenticado para SnailPay
      const user = await userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado.' });
        return;
      }
      // La caída de SnailPay se activa con la variable de entorno FORCE_ERROR=true en .env;
      // el query param ?force_error=true queda como alternativa documentada en la API
      const forceSystemError = ENV.FORCE_ERROR || req.query.force_error === 'true';

      // 1. Invocar el simulador aislado de SnailPay
      const paymentResponse = await snailPayService.processPayment({
        cardNumber,
        expiryDate,
        cvv,
        fullName,
        amount: Number(amount),
        payerId: userId,
        payerEmail: user.email
      }, forceSystemError);

      // 2. Si es rechazado o hay error de sistema, devolvemos la respuesta detallada sin alterar saldos
      if (paymentResponse.status !== 'APPROVED') {
        res.status(400).json({
          message: 'No se pudo procesar la transacción.',
          errorDetails: paymentResponse.status_detail,
          receipt: paymentResponse
        });
        return;
      }

      // 3. Si es aprobado, impactar e incrementar los fondos de la billetera local
      const updatedWallet = await walletRepository.addFunds(userId, Number(amount));

      // 4. Retornar la respuesta exitosa junto al nuevo saldo actualizado
      res.status(200).json({
        message: '¡Operación aprobada con éxito!',
        newBalance: updatedWallet?.balance,
        receipt: paymentResponse
      });

    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const wallet = await walletRepository.findByUserId(userId);
      
      if (!wallet) {
        res.status(404).json({ message: 'Billetera no encontrada.' });
        return;
      }
      res.status(200).json(wallet);
    } catch (error) {
      next(error);
    }
  }
}

export default new WalletController();
