import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { WalletProvider } from '../context/WalletContext';
import { useWallet } from '../hooks/useWallet';
import { walletService } from '../services/wallet.service';
import { WalletBalanceResponse } from '../types/api';

vi.mock('../services/wallet.service', () => ({
  walletService: {
    getBalance: vi.fn(),
    deposit: vi.fn(),
  },
}));

const mockedWallet = vi.mocked(walletService);

const walletFromApi: WalletBalanceResponse = {
  userId: 'u1',
  balance: 250,
  betsWon: 3,
  betsLost: 2,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

let ctx: ReturnType<typeof useWallet>;

const Consumer: React.FC = () => {
  // oxlint-disable-next-line react/globals -- patrón de test: capturar el contexto para las aserciones
  ctx = useWallet();
  return <div data-testid="balance">{ctx.walletData.balance}</div>;
};

const renderProvider = () =>
  render(
    <WalletProvider>
      <Consumer />
    </WalletProvider>
  );

describe('WalletContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('inicia con la wallet en ceros antes de cargar', () => {
    renderProvider();

    expect(ctx.walletData.balance).toBe(0);
    expect(ctx.walletData.betsWon).toBe(0);
    expect(ctx.walletData.betsLost).toBe(0);
    expect(ctx.loading).toBe(false);
  });

  it('fetchWallet consulta el balance y actualiza el estado', async () => {
    mockedWallet.getBalance.mockResolvedValue(walletFromApi);
    renderProvider();

    await act(async () => {
      await ctx.fetchWallet();
    });

    expect(mockedWallet.getBalance).toHaveBeenCalledTimes(1);
    expect(ctx.walletData).toEqual(walletFromApi);
    expect(ctx.loading).toBe(false);
    expect(document.querySelector('[data-testid="balance"]')?.textContent).toBe('250');
  });

  it('mantiene el estado inicial y registra el error si la petición falla', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedWallet.getBalance.mockRejectedValue(new Error('401 Unauthorized'));
    renderProvider();

    await act(async () => {
      await ctx.fetchWallet();
    });

    expect(errorSpy).toHaveBeenCalled();
    expect(ctx.walletData.balance).toBe(0);
    expect(ctx.loading).toBe(false);
  });
});
