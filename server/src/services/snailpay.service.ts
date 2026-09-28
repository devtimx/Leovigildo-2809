import { v4 as uuidv4 } from 'uuid';
import { PaymentRequest, SnailPayResponse } from '../types/index.js';

class SnailPayService {
  /**
   * Procesa un cobro simulado basándose en las reglas estrictas de la prueba.
   * @param simulateSystemError Si es verdadero, fuerza un Error de Sistema de la pasarela.
   */
  async processPayment(request: PaymentRequest, simulateSystemError: boolean = false): Promise<SnailPayResponse> {
    const transactionId = uuidv4();
    const timestamp = new Date().toISOString();
    const referenceCode = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2.3.3 Error del Sistema (SnailPay Caído)
    if (simulateSystemError) {
      return {
        id: transactionId,
        status: 'ERROR',
        status_detail: 'SnailPay Internal Server Error: Unable to connect to acquiring bank.',
        transaction_amount: request.amount,
        date_created: timestamp,
        authorization_code: null,
        reference: referenceCode,
        payer_id: request.payerId,
        payer_email: request.payerEmail
      };
    }

    // Validaciones básicas de negocio obligatorias
    if (!request.fullName || request.fullName.trim() === '' || request.amount <= 0) {
      return {
        id: transactionId,
        status: 'REJECTED',
        status_detail: 'TRANSACTION_DENIED: Invalid amount or cardholder name.',
        transaction_amount: request.amount,
        date_created: timestamp,
        authorization_code: null,
        reference: referenceCode,
        payer_id: request.payerId,
        payer_email: request.payerEmail
      };
    }

    // 2.3.1 Cobro Exitoso (Datos Estrictos)
    if (
      request.cardNumber === '1234123412341234' &&
      request.expiryDate === '12/26' &&
      request.cvv === '543'
    ) {
      return {
        id: transactionId,
        status: 'APPROVED',
        status_detail: 'Transaction approved successfully.',
        transaction_amount: request.amount,
        date_created: timestamp,
        authorization_code: `AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
        reference: referenceCode,
        payer_id: request.payerId,
        payer_email: request.payerEmail
      };
    }

    // 2.3.2 Errores de Transacción Personalizados (Simulaciones extras)
    if (request.cardNumber === '4 bits' || request.cardNumber.startsWith('4321')) {
      return {
        id: transactionId,
        status: 'REJECTED',
        status_detail: 'CARD_REJECTED: Insufficient funds in account.',
        transaction_amount: request.amount,
        date_created: timestamp,
        authorization_code: null,
        reference: referenceCode,
        payer_id: request.payerId,
        payer_email: request.payerEmail
      };
    }

    // Cualquier otra tarjeta no contemplada explícitamente se rechaza por datos incorrectos
    return {
      id: transactionId,
      status: 'REJECTED',
      status_detail: 'SUSPECTED_FRAUD: Incorrect card number, CVV or expired date.',
      transaction_amount: request.amount,
      date_created: timestamp,
      authorization_code: null,
      reference: referenceCode,
      payer_id: request.payerId,
      payer_email: request.payerEmail
    };
  }
}

export default new SnailPayService();
