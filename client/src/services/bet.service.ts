import api from './api';
import { Bet, BetDTO } from '../types/api';

export const betService = {
  createBet: async (betData: BetDTO): Promise<Bet> => {
    const response = await api.post<{ message: string; bet: Bet }>('/api/bets', betData);
    return response.data.bet;
  },
  getMyBets: async (): Promise<Bet[]> => {
    const response = await api.get<Bet[]>('/api/bets/my-bets');
    return response.data;
  },
};
