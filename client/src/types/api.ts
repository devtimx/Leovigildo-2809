// Modelos de Autenticación
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

// Modelos de Billetera
export interface Wallet {
  userId: string;
  balance: number;
  betsWon: number;
  betsLost: number;
  updatedAt: string;
}

export type WalletBalanceResponse = Wallet;

export interface DepositDTO {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  fullName: string;
  amount: number;
}

export interface DepositReceipt {
  id: string;
  status: 'APPROVED' | 'REJECTED' | 'ERROR';
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
}

export interface DepositResponse {
  message: string;
  newBalance: number;
  receipt: DepositReceipt;
}

// Modelos de Carreras
export type RaceStatus = 'SCHEDULED' | 'RUNNING' | 'FINISHED';

export interface Competitor {
  id: string;
  name: string;
  number: number;
}

export interface RaceResult {
  competitorId: string;
  competitorName: string;
  competitorNumber: number;
  position: number;
}

export interface Race {
  id: string;
  raceNumber: number;
  status: RaceStatus;
  scheduledTime: string;
  results: RaceResult[];
  updatedAt: string;
  competitors: Competitor[];
}

// Modelos de Apuestas
export type BetStatus = 'PENDING' | 'WON' | 'LOST';

export interface Bet {
  id: string;
  userId: string;
  raceId: string;
  raceNumber: number;
  competitorId: string;
  competitorName: string;
  competitorNumber: number;
  amount: number;
  status: BetStatus;
  payout: number;
  createdAt: string;
}

export interface BetDTO {
  raceId: string;
  raceNumber: number;
  competitorId: string;
  competitorName: string;
  competitorNumber: number;
  amount: number;
}

// Estadística derivada en el cliente para el Dashboard
export interface SnailStat {
  id: string;
  name: string;
  wins: number;
}
