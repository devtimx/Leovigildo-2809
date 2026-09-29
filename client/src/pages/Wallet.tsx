import React, { useEffect, useState, FormEvent } from 'react';
import { Navbar } from '../components/organisms/Navbar';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { useWallet } from '../hooks/useWallet';
import { walletService } from '../services/wallet.service';
import { DepositReceipt } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';

export const Wallet: React.FC = () => {
  const { walletData, fetchWallet, loading } = useWallet();

  const [form, setForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    fullName: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<DepositReceipt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setReceipt(null);
    setSubmitting(true);
    try {
      const response = await walletService.deposit({ ...form, amount: Number(form.amount) });
      setReceipt(response.receipt);
      setForm({ cardNumber: '', expiryDate: '', cvv: '', fullName: '', amount: '' });
      await fetchWallet();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo procesar la transacción.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="p-8 flex-grow max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Billetera</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Saldo Actual">
            <div className="flex flex-col items-center justify-center h-40">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Saldo Disponible
              </span>
              <span className="text-4xl font-extrabold text-green-600 mt-2">
                {loading ? '...' : `$${walletData.balance?.toFixed(2) ?? '0.00'}`}
              </span>
              <span className="text-xs text-gray-400 mt-2">
                Ganadas: {walletData.betsWon ?? 0} · Perdidas: {walletData.betsLost ?? 0}
              </span>
            </div>
          </Card>

          <Card title="Recargar con SnailPay" className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {receipt && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                <p className="font-semibold">{receipt.status === 'APPROVED' ? '¡Transacción aprobada!' : receipt.status}</p>
                <p>Referencia: {receipt.reference}</p>
                <p>Autorización: {receipt.authorization_code || 'N/A'}</p>
                <p>Fecha: {new Date(receipt.date_created).toLocaleString()}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titular de la tarjeta"
                value={form.fullName}
                onChange={handleChange('fullName')}
                placeholder="Cosme Fulanito"
                required
              />
              <Input
                label="Número de tarjeta"
                value={form.cardNumber}
                onChange={handleChange('cardNumber')}
                placeholder="1234123412341234"
                required
              />
              <Input
                label="Vencimiento"
                value={form.expiryDate}
                onChange={handleChange('expiryDate')}
                placeholder="12/26"
                required
              />
              <Input
                label="CVV"
                value={form.cvv}
                onChange={handleChange('cvv')}
                placeholder="543"
                required
              />
              <Input
                label="Monto a recargar"
                type="number"
                min={1}
                step="0.01"
                value={form.amount}
                onChange={handleChange('amount')}
                placeholder="150"
                required
              />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Procesando...' : 'Recargar saldo'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};
