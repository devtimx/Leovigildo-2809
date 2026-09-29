import api from './api';
import { Race } from '../types/api';

export const raceService = {
  getAllRaces: async (): Promise<Race[]> => {
    const response = await api.get<Race[]>('/api/races');
    return response.data;
  },
};
