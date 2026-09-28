export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export type UserCreationData = Omit<User, 'id' | 'createdAt'>;

export interface Wallet {
  userId: string;
  balance: number;
  betsWon: number;
  betsLost: number;
  updatedAt: string;
}

export interface PaymentRequest {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  fullName: string;
  amount: number;
  payerId: string;
  payerEmail: string;
}

export interface SnailPayResponse {
  id: string;
  status: 'APPROVED' | 'REJECTED' | 'ERROR';
  status_detail: string;
  cardNumber: string;
  cvv: string;
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
}

export interface Competitor {
  id: string;
  name: string;
  number: number;
}

export interface RaceResult {
  competitorId: string;
  competitorName: string;
  competitorNumber: number;
  position: number; // Del 1 al 6
}

export interface Race {
  id: string;
  raceNumber: number; // De la 1 a la 6
  status: 'SCHEDULED' | 'RUNNING' | 'FINISHED';
  scheduledTime: string;
  results: RaceResult[];
  updatedAt: string;
}

// --- APUESTAS ---
export interface Bet {
  id: string;
  userId: string;
  raceId: string;
  raceNumber: number;
  competitorId: string; // Id del competidor elegido
  competitorName: string;
  competitorNumber: number;
  amount: number;       // Monto apostado
  status: 'PENDING' | 'WON' | 'LOST';
  payout: number;       // Dinero devuelto si gana (0 si pierde o está pendiente)
  createdAt: string;
}

export type BetCreationData = Omit<Bet, 'id' | 'userId' | 'status' | 'payout' | 'createdAt'>;
