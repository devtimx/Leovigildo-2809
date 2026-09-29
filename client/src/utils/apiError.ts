import { AxiosError } from 'axios';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    return String(error.response.data.message);
  }
  return fallback;
};
