import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { User, UserCreationData } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../database/data/users.json');
const userId = uuidv4();

class UserRepository {
  private async _readAll(): Promise<User[]> {
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

  private async _writeAll(users: User[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this._readAll();
    return users.find(u => u.email === email) || null;
  }

  async findById(id: string): Promise<User | null> {
    const users = await this._readAll();
    return users.find(u => u.id === id) || null;
  }

  async create(userData: UserCreationData): Promise<Omit<User, 'password'>> {
    const users = await this._readAll();
    
    const newUser: User = {
      id: userId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this._writeAll(users);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}

export default new UserRepository();
