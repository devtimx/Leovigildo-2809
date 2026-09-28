import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { apiReference } from '@scalar/express-api-reference';
import authRoutes from './routes/auth.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import raceRoutes from './routes/race.routes.js';
import betRoutes from './routes/bet.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Configuración de Documentación OpenAPI con Scalar
app.use(
  '/scalar',
  apiReference({
    spec: {
      content: {
        openapi: '3.1.0',
        info: {
          title: 'Sistema de Apuestas de Carreras API',
          version: '1.0.0',
          description: 'Documentación interactiva de la API con Scalar y TypeScript.',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [{ bearerAuth: [] }],
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
          },
          '/api/auth/logout': {
            post: {
              summary: 'Cerrar sesión de usuario',
              description: 'Invalida la sesión actual. Requiere enviar el token JWT en la cabecera Authorization: Bearer <token>',
              responses: {
                200: {
                  description: 'Cierre de sesión exitoso.'
                },
                401: {
                  description: 'No autorizado / Token no proporcionado o inválido.'
                }
              }
            }
          },
          '/api/wallet/balance': {
            get: {
              summary: 'Obtener balance y estadísticas de la billetera del usuario',
              description: 'Requiere Token JWT en la cabecera Authorization: Bearer <token>',
              responses: {
                200: { description: 'Devuelve el balance actual, apuestas ganadas y perdidas.' },
                401: { description: 'No autorizado / Token inválido' },
                404: { description: 'Billetera no encontrada' }
              }
            }
          },
          '/api/wallet/deposit': {
            post: {
              summary: 'Realizar una recarga de saldo simulada con SnailPay',
              description: 'Requiere Token JWT. Permite simular caídas de sistema usando el query param ?force_error=true',
              parameters: [
                {
                  name: 'force_error',
                  in: 'query',
                  description: 'Si se envía como true, fuerza un error interno simulado de SnailPay (Error 2.3.3)',
                  required: false,
                  schema: { type: 'boolean', example: false }
                }
              ],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        cardNumber: { type: 'string', description: 'Usa 1234123412341234 para cobro exitoso', example: '1234123412341234' },
                        expiryDate: { type: 'string', example: '12/26' },
                        cvv: { type: 'string', example: '543' },
                        fullName: { type: 'string', example: 'Cosme Fulanito' },
                        amount: { type: 'number', description: 'Debe ser mayor a 0', example: 150 }
                      },
                      required: ['cardNumber', 'expiryDate', 'cvv', 'fullName', 'amount']
                    }
                  }
                }
              },
              responses: {
                200: { description: 'Cobro exitoso, saldo actualizado e incrementado' },
                400: { description: 'Transacción rechazada por SnailPay o Error del Sistema simulado' },
                401: { description: 'No autorizado / Token inválido' }
              }
            }
          },
          '/api/races': {
            get: {
              summary: 'Obtener la lista de carreras activas y sus competidores',
              description: 'Requiere Token JWT en la cabecera Authorization: Bearer <token>',
              responses: {
                200: { description: 'Devuelve la lista de carreras activas y sus competidores' },
                401: { description: 'No autorizado / Token inválido' }
              }
            }
          },
          '/api/bets': {
            post: {
              summary: 'Registrar un ticket de apuesta',
              description: 'Descuenta saldo de la wallet y genera un ticket PENDING. Requiere JWT Bearer Token.',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        raceId: { type: 'string', example: 'uuid-de-la-carrera' },
                        raceNumber: { type: 'number', example: 1 },
                        competitorId: { type: 'string', example: 'c1' },
                        competitorName: { type: 'string', example: 'Rayo Veloz' },
                        competitorNumber: { type: 'number', example: 1 },
                        amount: { type: 'number', example: 50 }
                      },
                      required: ['raceId', 'raceNumber', 'competitorId', 'competitorName', 'competitorNumber', 'amount']
                    }
                  }
                }
              },
              responses: {
                201: { description: 'Apuesta creada y saldo retenido con éxito' },
                400: { description: 'Saldo insuficiente o la carrera ya no acepta apuestas' }
              }
            }
          },
          '/api/bets/my-bets': {
            get: {
              summary: 'Obtener el historial de apuestas del usuario autenticado',
              responses: {
                200: { description: 'Lista de apuestas del usuario.' }
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
app.use('/api/races', raceRoutes);
app.use('/api/bets', betRoutes);

// Middleware global de manejo de errores (Tipado estrictamente)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocurrió un error interno en el servidor.' });
});

export default app;
