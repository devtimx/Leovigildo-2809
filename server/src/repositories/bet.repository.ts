import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { Bet } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../database/data/bets.json');

class BetRepository {
  async readAll(): Promise<Bet[]> {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(FILE_PATH, JSON.stringify([]));
        return [];
      }
      throw error;
    }
  }

  async writeAll(bets: Bet[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(bets, null, 2), 'utf-8');
  }

  async create(userId: string, betData: Omit<Bet, 'id' | 'userId' | 'status' | 'payout' | 'createdAt'>): Promise<Bet> {
    const bets = await this.readAll();
    
    const newBet: Bet = {
      id: uuidv4(),
      userId,
      ...betData,
      status: 'PENDING',
      payout: 0,
      createdAt: new Date().toISOString()
    };

    bets.push(newBet);
    await this.writeAll(bets);
    return newBet;
  }

  async findByUserId(userId: string): Promise<Bet[]> {
    const bets = await this.readAll();
    return bets.filter(b => b.userId === userId);
  }

  async updateBetStatus(betId: string, status: 'WON' | 'LOST', payout: number): Promise<void> {
  const bets = await this.readAll();
  const index = bets.findIndex(b => b.id === betId);
  if (index !== -1) {
    bets[index].status = status;
    bets[index].payout = payout;
    await this.writeAll(bets);
  }
}
}

export default new BetRepository();
