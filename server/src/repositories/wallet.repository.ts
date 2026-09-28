import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Wallet } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../database/data/wallets.json');

class WalletRepository {
  private async _readAll(): Promise<Wallet[]> {
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

  private async _writeAll(wallets: Wallet[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(wallets, null, 2), 'utf-8');
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const wallets = await this._readAll();
    return wallets.find(w => w.userId === userId) || null;
  }

  async create(userId: string): Promise<Wallet> {
    const wallets = await this._readAll();
    const newWallet: Wallet = {
      userId,
      balance: 0,
      betsWon: 0,
      betsLost: 0,
      updatedAt: new Date().toISOString()
    };
    wallets.push(newWallet);
    await this._writeAll(wallets);
    return newWallet;
  }

  async addFunds(userId: string, amount: number): Promise<Wallet | null> {
    const wallets = await this._readAll();
    const index = wallets.findIndex(w => w.userId === userId);
    if (index === -1) return null;

    wallets[index].balance += amount;
    wallets[index].updatedAt = new Date().toISOString();
    
    await this._writeAll(wallets);
    return wallets[index];
  }

  async deductFunds(userId: string, amount: number): Promise<Wallet | null> {
    if (amount <= 0) throw new Error('El monto debe ser mayor a cero.');

    const wallets = await this._readAll();
    const index = wallets.findIndex(w => w.userId === userId);
    if (index === -1) return null;

    if (wallets[index].balance < amount) {
      throw new Error('Saldo insuficiente.');
    }

    wallets[index].balance -= amount;
    wallets[index].updatedAt = new Date().toISOString();

    await this._writeAll(wallets);
    return wallets[index];
  }

  async updateBalance(userId: string, amount: number): Promise<Wallet | null> {
    const wallets = await this._readAll();
    const index = wallets.findIndex(w => w.userId === userId);
    if (index === -1) return null;

    const newBalance = wallets[index].balance + amount;
    if (newBalance < 0) throw new Error('Saldo insuficiente.');

    wallets[index].balance = newBalance;
    wallets[index].updatedAt = new Date().toISOString();

    await this._writeAll(wallets);
    return wallets[index];
  }

  async registerBetResult(userId: string, won: boolean): Promise<Wallet | null> {
    const wallets = await this._readAll();
    const index = wallets.findIndex(w => w.userId === userId);
    if (index === -1) return null;

    if (won) wallets[index].betsWon += 1;
    else wallets[index].betsLost += 1;
    wallets[index].updatedAt = new Date().toISOString();

    await this._writeAll(wallets);
    return wallets[index];
  }
}

export default new WalletRepository();
