import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


interface BlacklistedToken {
  token: string;
  expiresAt: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../database/data/blacklist.json');

class BlacklistService {
  
  private async _readAll(): Promise<BlacklistedToken[]> {
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

  private async _writeAll(tokens: BlacklistedToken[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
  }

  /**
   * Agrega un token a la lista negra persistente
   */
  async add(token: string): Promise<void> {
    const blacklist = await this._readAll();
    
    // Decodificar el token de manera nativa para obtener la expiración (exp)
    let expiresAt = Date.now() + 2 * 60 * 60 * 1000; // Fallback: 2 horas
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      if (payload.exp) {
        expiresAt = payload.exp * 1000;
      }
    } catch (e) {
      // Error al decodificar, se usa el fallback
    }

    if (!blacklist.some(item => item.token === token)) {
      blacklist.push({ token, expiresAt });
      await this._writeAll(blacklist);
    }
  }

  /**
   * Comprueba si el token está en el archivo de lista negra
   */
  async has(token: string): Promise<boolean> {
    const blacklist = await this._readAll();
    const now = Date.now();
    
    // Aprovechamos para filtrar los tokens ya expirados cronológicamente y limpiar el archivo JSON
    const activeBlacklist = blacklist.filter(item => item.expiresAt > now);
    if (activeBlacklist.length !== blacklist.length) {
      await this._writeAll(activeBlacklist);
    }

    return activeBlacklist.some(item => item.token === token);
  }
}

export default new BlacklistService();
