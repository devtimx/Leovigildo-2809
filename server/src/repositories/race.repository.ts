import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Race } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../database/data/races.json');

class RaceRepository {
  async readAll(): Promise<Race[]> {
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

  async writeAll(races: Race[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(races, null, 2), 'utf-8');
  }

  async findById(id: string): Promise<Race | null> {
    const races = await this.readAll();
    return races.find(r => r.id === id) || null;
  }

  async updateRace(updatedRace: Race): Promise<void> {
    const races = await this.readAll();
    const index = races.findIndex(r => r.id === updatedRace.id);
    if (index !== -1) {
      races[index] = updatedRace;
      await this.writeAll(races);
    }
  }
}

export default new RaceRepository();
