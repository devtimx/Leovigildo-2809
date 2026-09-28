import { v4 as uuidv4 } from 'uuid';
import raceRepository from '../repositories/race.repository.js';
import betRepository from '../repositories/bet.repository.js';
import walletRepository from '../repositories/wallet.repository.js';
import { Race, Competitor, RaceResult } from '../types/index.js';

const RACE_INTERVAL_MS = Number(process.env.RACE_INTERVAL_MS) || 15000; 
const DURATION_OF_RACE_MS = Number(process.env.RACE_DURATION_MS) || 5000; 
const ODDS_MULTIPLIER = 3; // Cuánto paga la apuesta (Ej: Si apuesta 100, recibe 300)

const DEFAULT_COMPETITORS: Competitor[] = [
  { id: 'c1', name: 'Turbo', number: 1 },
  { id: 'c2', name: 'Chicotazo', number: 2 },
  { id: 'c3', name: 'Pólvora', number: 3 },
  { id: 'c4', name: 'Derrapón', number: 4 },
  { id: 'c5', name: 'Pepe Maniobra', number: 5 },
  { id: 'c6', name: 'Goyo Ganador', number: 6 }
];

class RaceSimulatorService {
  private isRunningSystem = false;

  async initializeDailyRaces(): Promise<void> {
    const existingRaces = await raceRepository.readAll();
    if (existingRaces.length > 0) {
      this.startSimulationLoop();
      return;
    }

    const initialRaces: Race[] = [];
    const now = Date.now();

    for (let i = 1; i <= 6; i++) {
      initialRaces.push({
        id: uuidv4(),
        raceNumber: i,
        status: 'SCHEDULED',
        scheduledTime: new Date(now + (i * RACE_INTERVAL_MS)).toISOString(),
        results: [],
        updatedAt: new Date().toISOString()
      });
    }

    await raceRepository.writeAll(initialRaces);
    this.startSimulationLoop();
  }

  private async startSimulationLoop(): Promise<void> {
    if (this.isRunningSystem) return;
    this.isRunningSystem = true;

    console.log(`Simulador de Carreras encendido. Intervalo: ${RACE_INTERVAL_MS / 1000}s`);

    const loop = async () => {
      const races = await raceRepository.readAll();
      const nextRace = races.find(r => r.status === 'SCHEDULED');

      if (nextRace) {
        const timeUntilRace = new Date(nextRace.scheduledTime).getTime() - Date.now();
        if (timeUntilRace <= 0) {
          await this.executeRace(nextRace);
        }
      }
      setTimeout(loop, 2000);
    };

    loop();
  }

  private async executeRace(race: Race): Promise<void> {
    console.log(`\n [CARRERA N° ${race.raceNumber}] ¡Ha comenzado la carrera!`);
    
    race.status = 'RUNNING';
    race.updatedAt = new Date().toISOString();
    await raceRepository.updateRace(race);

    setTimeout(async () => {
      // Algoritmo aleatorio para determinar las posiciones
      const shuffledCompetitors = [...DEFAULT_COMPETITORS].sort(() => Math.random() - 0.5);
      
      const results: RaceResult[] = shuffledCompetitors.map((competitor, index) => ({
        competitorId: competitor.id,
        competitorName: competitor.name,
        competitorNumber: competitor.number,
        position: index + 1
      }));

      race.status = 'FINISHED';
      race.results = results;
      race.updatedAt = new Date().toISOString();
      
      await raceRepository.updateRace(race);
      console.log(`[CARRERA N° ${race.raceNumber}] ¡Finalizada! El ganador es: ${results[0].competitorName}`);

      // APUESTAS: Disparar la resolución automática de tickets de forma asíncrona
      await this.resolveAssociatedBets(race.id, results[0].competitorId);

    }, DURATION_OF_RACE_MS);
  }

  /**
   * Lógica de negocio core para premiar/descontar apuestas de la carrera finalizada
   */
  private async resolveAssociatedBets(raceId: string, winningCompetitorId: string): Promise<void> {
    try {
      const allBets = await betRepository.readAll();
      // Filtramos únicamente las apuestas pendientes asociadas a ESTA carrera concreta
      const pendingBetsForRace = allBets.filter(b => b.raceId === raceId && b.status === 'PENDING');

      if (pendingBetsForRace.length === 0) {
        console.log(`No se registraron apuestas para la carrera finalizada.`);
        return;
      }

      console.log(`Procesando y resolviendo ${pendingBetsForRace.length} apuesta(s)...`);

      for (const bet of pendingBetsForRace) {
        const isWinner = bet.competitorId === winningCompetitorId;

        if (isWinner) {
          const payoutAmount = bet.amount * ODDS_MULTIPLIER;
          
          // 1. Actualizar el estado de la apuesta a WON y asignarle su premio en bets.json
          await betRepository.updateBetStatus(bet.id, 'WON', payoutAmount);
          // 2. Inyectar los fondos ganados e incrementar estadísticas en wallets.json
          await walletRepository.resolveWalletBet(bet.userId, true, payoutAmount);
          
          console.log(`💰 ¡Usuario [${bet.userId}] GANÓ! Apostó ${bet.amount} y recibe un payout de ${payoutAmount}`);
        } else {
          // 1. Actualizar el estado de la apuesta a LOST en bets.json
          await betRepository.updateBetStatus(bet.id, 'LOST', 0);
          // 2. Incrementar contador de pérdidas en wallets.json (el saldo ya se descontó al crear la apuesta)
          await walletRepository.resolveWalletBet(bet.userId, false, 0);
          
          console.log(`Usuario [${bet.userId}] PERDIÓ la apuesta de ${bet.amount}`);
        }
      }
      console.log(`Todas las apuestas de la carrera fueron resueltas.`);
    } catch (error) {
      console.error('Error crítico al resolver la liquidación automática de apuestas:', error);
    }
  }
}

export default new RaceSimulatorService();
