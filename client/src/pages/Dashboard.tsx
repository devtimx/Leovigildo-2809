import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/organisms/Navbar';
import { Card } from '../components/molecules/Card';
import { BetsDonutChart } from '../components/molecules/BetsDonutChart';
import { SnailBarChart } from '../components/molecules/SnailBarChart';
import { useWallet } from '../hooks/useWallet';
import { raceService } from '../services/race.service';
import { SnailStat } from '../types/api';

const RACES_PER_DAY = 6;
const SNAILS_PER_DAY = 6;

export const Dashboard: React.FC = () => {
  const { walletData, fetchWallet, loading } = useWallet();
  const [snailStats, setSnailStats] = useState<SnailStat[]>([]);
  const [racesRun, setRacesRun] = useState(0);

  useEffect(() => {
    fetchWallet();

    // Victorias del día simulado: se derivan de los resultados del simulador
    // (6 carreras diarias, 6 caracoles; cada carrera terminada reparte 1 victoria)
    const loadStats = async () => {
      try {
        const races = await raceService.getAllRaces();

        const winsBySnail = new Map<string, number>();
        races.forEach((race) => {
          if (race.status === 'FINISHED' && race.results.length > 0) {
            const winner = race.results.find((r) => r.position === 1) ?? race.results[0];
            winsBySnail.set(
              winner.competitorId,
              (winsBySnail.get(winner.competitorId) || 0) + 1
            );
          }
        });

        const competitors = races[0]?.competitors || [];
        setSnailStats(
          competitors.map((c) => ({
            id: c.id,
            name: c.name,
            wins: winsBySnail.get(c.id) || 0,
          }))
        );
        setRacesRun(races.filter((r) => r.status === 'FINISHED').length);
      } catch (error) {
        console.error('Error al calcular estadísticas del día:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [fetchWallet]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="p-8 flex-grow max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel Principal</h2>

        {loading ? (
          <p className="text-gray-500">Cargando métricas...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Balance Actual">
              <div className="flex flex-col items-center justify-center h-48">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Saldo Disponible
                </span>
                <span className="text-4xl font-extrabold text-green-600 mt-2">
                  ${walletData.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </Card>

            <Card title="Apuestas Ganadas / Perdidas">
              <BetsDonutChart won={walletData.betsWon} lost={walletData.betsLost} />
            </Card>

            <Card title="Victorias del Día (Simulación)">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {snailStats.length || SNAILS_PER_DAY} caracoles
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  {racesRun}/{RACES_PER_DAY} carreras
                </span>
              </div>
              <SnailBarChart stats={snailStats} />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
