import { describe, test, expect, vi } from 'vitest';
import snailPayService from './snailpay.service.js';
import { PaymentRequest } from '../types/index.js';

describe('SnailPayService - Simulador de Pasarela de Pagos', () => {
  const baseRequest: PaymentRequest = {
    cardNumber: '1234123412341234',
    expiryDate: '12/26',
    cvv: '543',
    fullName: 'Juan Pérez',
    amount: 100,
    payerId: 'user-uuid-123',
    payerEmail: 'juan@example.com'
  };

  test('2.3.1 Debe procesar un cobro exitoso con los datos correctos de la tarjeta', async () => {
    const response = await snailPayService.processPayment(baseRequest, false);

    expect(response.status).toBe('APPROVED');
    expect(response.status_detail).toContain('approved');
    expect(response.authorization_code).not.toBeNull();
    expect(response.payer_id).toBe(baseRequest.payerId);
    expect(response.payer_email).toBe(baseRequest.payerEmail);
  });

  test('2.3.2 Debe rechazar la transacción por fondos insuficientes ante tarjetas simuladas específicas', async () => {
    const insufficientFundsRequest = { ...baseRequest, cardNumber: '4321111111111111' };
    const response = await snailPayService.processPayment(insufficientFundsRequest, false);

    expect(response.status).toBe('REJECTED');
    expect(response.status_detail).toContain('Insufficient funds');
    expect(response.authorization_code).toBeNull();
  });

  test('2.3.2 Debe rechazar la transacción si el monto es menor o igual a cero', async () => {
    const invalidAmountRequest = { ...baseRequest, amount: 0 };
    const response = await snailPayService.processPayment(invalidAmountRequest, false);

    expect(response.status).toBe('REJECTED');
    expect(response.status_detail).toContain('Invalid amount');
  });

  test('2.3.3 Debe lanzar un Error del Sistema si la bandera global de error está activa', async () => {
    // Simulamos la caída del sistema inyectando true en el segundo parámetro
    const response = await snailPayService.processPayment(baseRequest, true);

    expect(response.status).toBe('ERROR');
    expect(response.status_detail).toContain('Internal Server Error');
    expect(response.authorization_code).toBeNull();
  });
});
