import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { apiReference } from '@scalar/express-api-reference';
import authRoutes from './routes/auth.routes.js'; 
import walletRoutes from './routes/wallet.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Configuración de Documentación OpenAPI con Scalar
app.use(
  '/reference',
  apiReference({
    spec: {
      content: {
        openapi: '3.1.0',
        info: {
          title: 'Sistema de Apuestas de Carreras API',
          version: '1.0.0',
          description: 'Documentación interactiva de la API con Scalar y TypeScript.',
        },
        paths: {
          '/api/auth/register': {
            post: {
              summary: 'Registrar un nuevo usuario',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Juan Pérez' },
                        email: { type: 'string', example: 'juan@example.com' },
                        password: { type: 'string', example: 'password123' }
                      },
                      required: ['name', 'email', 'password']
                    }
                  }
                }
              },
              responses: {
                201: { description: 'Usuario creado con éxito' },
                400: { description: 'El usuario ya existe' }
              }
            }
          },
          '/api/auth/login': {
            post: {
              summary: 'Iniciar sesión de usuario',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        email: { type: 'string', example: 'juan@example.com' },
                        password: { type: 'string', example: 'password123' }
                      },
                      required: ['email', 'password']
                    }
                  }
                }
              },
              responses: {
                200: { description: 'Autenticación exitosa, retorna token JWT' },
                401: { description: 'Credenciales inválidas' }
              }
            }
          }
        }
      }
    }
  })
);

// Rutas de la Aplicación
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// Middleware global de manejo de errores (Tipado estrictamente)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocurrió un error interno en el servidor.' });
});

export default app;
