import api from './api';
import { WalletBalanceResponse, DepositDTO, DepositResponse } from '../types/api';

export const walletService = {
  getBalance: async (): Promise<WalletBalanceResponse> => {
    const response = await api.get<WalletBalanceResponse>('/api/wallet/balance');
    return response.data;
  },
  deposit: async (
    depositData: DepositDTO,
    forceError: boolean = false
  ): Promise<DepositResponse> => {
    const response = await api.post<DepositResponse>(
      `/api/wallet/deposit${forceError ? '?force_error=true' : ''}`,
      depositData
    );
    return response.data;
  },
};
