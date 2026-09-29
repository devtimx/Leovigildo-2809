import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { WalletBalanceResponse } from '../types/api';
import { walletService } from '../services/wallet.service';

interface WalletContextType {
  walletData: WalletBalanceResponse;
  loading: boolean;
  fetchWallet: () => Promise<void>;
}

const initialWalletState: WalletBalanceResponse = {
  userId: '',
  balance: 0,
  betsWon: 0,
  betsLost: 0,
  updatedAt: '',
};

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletBalanceResponse>(initialWalletState);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const data = await walletService.getBalance();
      setWalletData(data);
    } catch (error) {
      console.error('Error al obtener balance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <WalletContext.Provider value={{ walletData, loading, fetchWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
