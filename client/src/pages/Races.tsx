import React, { useCallback, useEffect, useState, FormEvent } from 'react';
import { Navbar } from '../components/organisms/Navbar';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { useWallet } from '../hooks/useWallet';
import { raceService } from '../services/race.service';
import { betService } from '../services/bet.service';
import { Race } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';

const statusStyles: Record<Race['status'], string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  RUNNING: 'bg-amber-100 text-amber-700 animate-pulse',
  FINISHED: 'bg-green-100 text-green-700',
};

const statusLabels: Record<Race['status'], string> = {
  SCHEDULED: 'Programada',
  RUNNING: 'En curso',
  FINISHED: 'Finalizada',
};

export const Races: React.FC = () => {
  const { fetchWallet } = useWallet();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { type: 'ok' | 'error'; text: string }>>({});
  const [placing, setPlacing] = useState<string | null>(null);

  const loadRaces = useCallback(async () => {
    try {
      const data = await raceService.getAllRaces();
      setRaces(data);
    } catch (error) {
      console.error('Error al obtener carreras:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRaces();
    const interval = setInterval(loadRaces, 5000);
    return () => clearInterval(interval);
  }, [loadRaces]);

  const handleBet = async (e: FormEvent, race: Race) => {
    e.preventDefault();
    const raceId = race.id;
    const competitorId = selected[raceId];
    const amount = Number(amounts[raceId] || 0);

    const competitor = race.competitors?.find((c) => c.id === competitorId);
    if (!competitor) {
      setFeedback((f) => ({
        ...f,
        [raceId]: { type: 'error', text: 'Selecciona un competidor.' },
      }));
      return;
    }

    setPlacing(raceId);
    setFeedback((f) => ({ ...f, [raceId]: { type: 'ok', text: 'Registrando apuesta...' } }));

    try {
      await betService.createBet({
        raceId,
        raceNumber: race.raceNumber,
        competitorId: competitor.id,
        competitorName: competitor.name,
        competitorNumber: competitor.number,
        amount,
      });
      setFeedback((f) => ({
        ...f,
        [raceId]: {
          type: 'ok',
          text: `¡Apuesta de $${amount.toFixed(2)} registrada en ${competitor.name}!`,
        },
      }));
      setAmounts((a) => ({ ...a, [raceId]: '' }));
      await fetchWallet();
      await loadRaces();
    } catch (error) {
      setFeedback((f) => ({
        ...f,
        [raceId]: {
          type: 'error',
          text: getApiErrorMessage(error, 'No se pudo registrar la apuesta.'),
        },
      }));
    } finally {
      setPlacing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="p-8 flex-grow max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Carreras</h2>
          <span className="text-sm text-gray-500">Se actualiza cada 5 segundos</span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando carreras...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {races.map((race) => {
              const fb = feedback[race.id];
              const winner = race.status === 'FINISHED' ? race.results[0] : null;

              return (
                <Card
                  key={race.id}
                  title={`Carrera N° ${race.raceNumber}`}
                  className="flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[race.status]}`}
                    >
                      {statusLabels[race.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(race.scheduledTime).toLocaleTimeString()}
                    </span>
                  </div>

                  {race.status === 'FINISHED' && winner && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                      🏆 Ganador: <strong>{winner.competitorName}</strong> (N°{' '}
                      {winner.competitorNumber})
                    </div>
                  )}

                  {race.status === 'RUNNING' && (
                    <p className="mb-4 text-sm text-amber-600 font-medium">
                      La carrera está en curso, no se aceptan apuestas.
                    </p>
                  )}

                  {race.status === 'SCHEDULED' && (
                    <form onSubmit={(e) => handleBet(e, race)} className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        {(race.competitors || []).map((c) => {
                          const isSelected = selected[race.id] === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                setSelected((s) => ({ ...s, [race.id]: c.id }))
                              }
                              className={`px-2 py-2 rounded-lg text-sm border transition duration-200 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                                  : 'border-gray-200 hover:border-gray-400 text-gray-700'
                              }`}
                            >
                              N°{c.number} {c.name}
                            </button>
                          );
                        })}
                      </div>

                      <Input
                        label="Monto a apostar"
                        type="number"
                        min={1}
                        step="0.01"
                        value={amounts[race.id] || ''}
                        onChange={(e) =>
                          setAmounts((a) => ({ ...a, [race.id]: e.target.value }))
                        }
                        placeholder="50"
                        required
                      />

                      <Button type="submit" disabled={placing === race.id}>
                        {placing === race.id ? 'Apostando...' : 'Apostar'}
                      </Button>
                    </form>
                  )}

                  {fb && (
                    <p
                      className={`mt-3 text-sm ${
                        fb.type === 'ok' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {fb.text}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
