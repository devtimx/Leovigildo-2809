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
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
}