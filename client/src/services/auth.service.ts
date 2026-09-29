import api from './api';
import { LoginDTO, RegisterDTO, AuthResponse } from '../types/api';

export const authService = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData: RegisterDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },
};
