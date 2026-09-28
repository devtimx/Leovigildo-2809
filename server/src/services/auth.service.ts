import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import userRepository from '../repositories/user.repository.js'; // Extensión .js requerida
import walletRepository from '../repositories/wallet.repository.js';
import { ENV } from '../config/env.js';
import { User, UserCreationData } from '../types/index.js';

// Estructura de la respuesta que devolverá el servicio tras autenticar
interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

class AuthService {
  /**
   * Registra un nuevo usuario en el sistema.
   * Inicializa su balance en 0 de forma automática mediante el repositorio.
   */
  async register(userData: UserCreationData): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('EL_USUARIO_YA_EXISTE');
    }

    // Hasheamos la contraseña con un factor de costo de 10 (estándar seguro)
    const hashedPassword = await bcrypt.hash(userData.password!, 10);

    // El repositorio guarda en el JSON y retorna el usuario sin contraseña
    const userWithoutPassword = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Inicializa la wallet del usuario en ceros (balance, apuestas ganadas/perdidas)
    const existingWallet = await walletRepository.findByUserId(userWithoutPassword.id);
    if (!existingWallet) {
      await walletRepository.create(userWithoutPassword.id);
    }

    const token = this.generateToken(userWithoutPassword.id);

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Autentica un usuario mediante email y contraseña.
   */
  async login({ email, password }: Omit<UserCreationData, 'name'>): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('CREDENCIALES_INVALIDAS');
    }

    //Comparamos la contraseña en texto plano con el hash guardado en el JSON
    const isPasswordValid = await bcrypt.compare(password!, user.password || '');
    if (!isPasswordValid) {
      throw new Error('CREDENCIALES_INVALIDAS');
    }

    const token = this.generateToken(user.id);
    
    // Extraemos la contraseña para no exponerla en el retorno
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Helper privado para firmar los tokens JWT
   */
  private generateToken(userId: string): string {
    // Si ENV.JWT_SECRET no existe, usamos un fallback seguro para evitar caídas en desarrollo
    const secret = ENV.JWT_SECRET || 'fallback_secret_key_12345';
    return jwt.sign({ id: userId, jti: uuidv4() }, secret, { expiresIn: '2h' });
  }
}

export default new AuthService();
