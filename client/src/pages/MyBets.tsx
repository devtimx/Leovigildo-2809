import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/organisms/Navbar';
import { Card } from '../components/molecules/Card';
import { betService } from '../services/bet.service';
import { Bet } from '../types/api';

const statusStyles: Record<Bet['status'], string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
};

const statusLabels: Record<Bet['status'], string> = {
  PENDING: 'Pendiente',
  WON: 'Ganada',
  LOST: 'Perdida',
};

export const MyBets: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBets = useCallback(async () => {
    try {
      const data = await betService.getMyBets();
      setBets(data);
    } catch (error) {
      console.error('Error al obtener apuestas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  const totalStaked = bets.reduce((sum, b) => sum + b.amount, 0);
  const totalWon = bets
    .filter((b) => b.status === 'WON')
    .reduce((sum, b) => sum + b.payout, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="p-8 flex-grow max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Apuestas</h2>
          <button
            onClick={loadBets}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card title="Total Apostado">
            <p className="text-3xl font-extrabold text-gray-800">
              ${totalStaked.toFixed(2)}
            </p>
          </Card>
          <Card title="Premios Ganados">
            <p className="text-3xl font-extrabold text-green-600">
              ${totalWon.toFixed(2)}
            </p>
          </Card>
          <Card title="Tickets">
            <p className="text-3xl font-extrabold text-indigo-600">{bets.length}</p>
          </Card>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando apuestas...</p>
        ) : bets.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-8">
              Aún no has registrado apuestas. ¡Ve a la pestaña Carreras!
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Carrera</th>
                  <th className="px-4 py-3">Competidor</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Premio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      N° {bet.raceNumber}
                    </td>
                    <td className="px-4 py-3">
                      N°{bet.competitorNumber} {bet.competitorName}
                    </td>
                    <td className="px-4 py-3">${bet.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {bet.payout > 0 ? `$${bet.payout.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[bet.status]}`}
                      >
                        {statusLabels[bet.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(bet.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
