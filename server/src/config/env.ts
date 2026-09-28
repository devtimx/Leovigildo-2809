import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '4000',
  JWT_SECRET: process.env.JWT_SECRET || 'TuPalabraSecretaSuperSeguraParaLosTokensDeApuestas123!',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FORCE_ERROR: process.env.FORCE_ERROR === 'true',
  RACE_INTERVAL_MS: Number(process.env.RACE_INTERVAL_MS) || 15000,
  DURATION_OF_RACE_MS: Number(process.env.DURATION_OF_RACE_MS) || 5000,
};
