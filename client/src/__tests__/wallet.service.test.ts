import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import { walletService } from '../services/wallet.service';
import { WalletBalanceResponse, DepositResponse } from '../types/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

const wallet: WalletBalanceResponse = {
  userId: 'u1',
  balance: 150,
  betsWon: 2,
  betsLost: 1,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const depositResponse: DepositResponse = {
  message: '¡Operación aprobada con éxito!',
  newBalance: 300,
  receipt: {
    id: 'r1',
    status: 'APPROVED',
    status_detail: 'Transaction approved successfully.',
    transaction_amount: 150,
    date_created: '2026-01-01T00:00:00.000Z',
    authorization_code: 'AUTH-1234',
    reference: 'REF-123456',
  },
};

const depositData = {
  cardNumber: '1234123412341234',
  expiryDate: '12/26',
  cvv: '543',
  fullName: 'Cosme Fulanito',
  amount: 150,
};

describe('walletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBalance consulta GET /api/wallet/balance y retorna la wallet', async () => {
    mockedGet.mockResolvedValue({ data: wallet });

    const result = await walletService.getBalance();

    expect(mockedGet).toHaveBeenCalledWith('/api/wallet/balance');
    expect(result).toEqual(wallet);
    expect(result.balance).toBe(150);
  });

  it('deposit envía el payload a POST /api/wallet/deposit', async () => {
    mockedPost.mockResolvedValue({ data: depositResponse });

    const result = await walletService.deposit(depositData);

    expect(mockedPost).toHaveBeenCalledWith('/api/wallet/deposit', depositData);
    expect(result.newBalance).toBe(300);
    expect(result.receipt.status).toBe('APPROVED');
  });

  it('deposit agrega ?force_error=true cuando se pide simular el error', async () => {
    mockedPost.mockResolvedValue({ data: depositResponse });

    await walletService.deposit(depositData, true);

    expect(mockedPost).toHaveBeenCalledWith('/api/wallet/deposit?force_error=true', depositData);
  });

  it('propaga el error cuando la transacción es rechazada', async () => {
    mockedPost.mockRejectedValue(new Error('No se pudo procesar la transacción.'));

    await expect(walletService.deposit(depositData)).rejects.toThrow(
      'No se pudo procesar la transacción.'
    );
  });
});
