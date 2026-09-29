import { describe, test, expect, vi, beforeEach } from 'vitest';
import betService from './bet.service.js';
import raceRepository from '../repositories/race.repository.js';
import walletRepository from '../repositories/wallet.repository.js';
import betRepository from '../repositories/bet.repository.js';
import { BetCreationData } from '../types/index.js';

describe('BetService - Registro de Apuestas', () => {
  const mockBetData: BetCreationData = {
    raceId: 'race-uuid-999',
    raceNumber: 1,
    competitorId: 'c1',
    competitorName: 'Rayo Veloz',
    competitorNumber: 1,
    amount: 50
  };

  beforeEach(() => {
    vi.restoreAllMocks(); // Limpia los espías entre ejecuciones de pruebas
  });

  test('Debe registrar la apuesta con éxito si la carrera está SCHEDULED y el usuario tiene saldo', async () => {
    // Mocking Carrera existente y agendada
    vi.spyOn(raceRepository, 'findById').mockResolvedValue({
      id: 'race-uuid-999',
      raceNumber: 1,
      status: 'SCHEDULED',
      scheduledTime: new Date().toISOString(),
      results: [],
      updatedAt: new Date().toISOString()
    });

    // Mocking Wallet con saldo suficiente ($100 balance > $50 apuesta)
    vi.spyOn(walletRepository, 'findByUserId').mockResolvedValue({
      userId: 'user-uuid-111',
      balance: 100,
      betsWon: 0,
      betsLost: 0,
      updatedAt: new Date().toISOString()
    });

    // Mocking los métodos que escriben en disco para que no alteren los JSON locales
    vi.spyOn(walletRepository, 'addFunds').mockResolvedValue({} as any);
    vi.spyOn(betRepository, 'create').mockResolvedValue({
      id: 'bet-uuid-000',
      userId: 'user-uuid-111',
      ...mockBetData,
      status: 'PENDING',
      payout: 0,
      createdAt: new Date().toISOString()
    });

    const result = await betService.placeBet('user-uuid-111', mockBetData);

    expect(result.status).toBe('PENDING');
    expect(walletRepository.addFunds).toHaveBeenCalledWith('user-uuid-111', -50); // Validamos que restó el dinero
    expect(betRepository.create).toHaveBeenCalled();
  });

  test('Debe fallar con error SALDO_INSUFICIENTE si el monto de la apuesta supera el balance', async () => {
    vi.spyOn(raceRepository, 'findById').mockResolvedValue({ id: 'race-uuid-999', status: 'SCHEDULED' } as any);
    
    // El usuario solo tiene $20 e intenta apostar $50
    vi.spyOn(walletRepository, 'findByUserId').mockResolvedValue({ userId: 'user-uuid-111', balance: 20 } as any);

    await expect(betService.placeBet('user-uuid-111', mockBetData))
      .rejects
      .toThrow('SALDO_INSUFICIENTE');
  });

  test('Debe fallar si la carrera ya se encuentra iniciada (RUNNING) o terminada', async () => {
    // La carrera ya está corriendo, no se permiten más tickets
    vi.spyOn(raceRepository, 'findById').mockResolvedValue({ id: 'race-uuid-999', status: 'RUNNING' } as any);
    vi.spyOn(walletRepository, 'findByUserId').mockResolvedValue({ userId: 'user-uuid-111', balance: 500 } as any);

    await expect(betService.placeBet('user-uuid-111', mockBetData))
      .rejects
      .toThrow('CARRERA_YA_INICIADA_O_FINALIZADA');
  });
});
