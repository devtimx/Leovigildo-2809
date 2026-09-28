import betRepository from '../repositories/bet.repository.js';
import raceRepository from '../repositories/race.repository.js';
import walletRepository from '../repositories/wallet.repository.js';
import { Bet, BetCreationData } from '../types/index.js';

class BetService {
  async placeBet(userId: string, data: BetCreationData): Promise<Bet> {
    // 1. Validar que el monto sea un número positivo legítimo
    if (data.amount <= 0) {
      throw new Error('MONTO_INVALIDO');
    }

    // 2. Verificar existencia de la carrera y que siga abierta para apostar
    const race = await raceRepository.findById(data.raceId);
    if (!race) {
      throw new Error('CARRERA_NO_ENCONTRADA');
    }

    if (race.status !== 'SCHEDULED') {
      throw new Error('CARRERA_YA_INICIADA_O_FINALIZADA');
    }

    // 3. Verificar que el usuario tenga saldo suficiente
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet || wallet.balance < data.amount) {
      throw new Error('SALDO_INSUFICIENTE');
    }

    // 4. Descontar el dinero de la billetera (Usamos un monto negativo para restar)
    await walletRepository.addFunds(userId, -data.amount);

    // 5. Registrar la apuesta en el JSON
    const registeredBet = await betRepository.create(userId, data);

    return registeredBet;
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    return await betRepository.findByUserId(userId);
  }
}

export default new BetService();
