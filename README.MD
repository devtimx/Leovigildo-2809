# Carreras

Aplicación fullstack de apuestas deportivas simuladas.

## Descripción

- **Registro/login** con JWT (duración 2h, revocable por logout mediante lista negra).
- **Billetera** por usuario: saldo, apuestas ganadas y perdidas; se inicializa en ceros al registrarse.
- **Recargas simuladas** : aprueba, rechaza o simula errores del sistema.
- **Simulador de carreras**: genera 6 carreras (`SCHEDULED → RUNNING → FINISHED`), ejecuta cada una con resultados aleatorios y **resuelve las apuestas automáticamente** (premio de **3x** al ganador). Cuando termina la tanda, regenera nuevas carreras tras una pausa.
- **Apuestas**: descuentan el saldo al crearse y quedan en estado `PENDING` hasta liquidarse (`WON`/`LOST`).
- **Dashboard** con gráficas: balance, donut de ganadas/perdidas del usuario y barras con las **victorias de cada uno de los 6 caracoles durante el día simulado** (6 carreras, se actualiza en vivo).
- **Documentación interactiva** de la API con Scalar en `http://localhost:4000/scalar`.

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, react-router-dom 7, Axios, Chart.js |
| Backend | Node.js 22, Express 4, TypeScript, JSON Web Token, bcrypt |
| Persistencia | Archivos JSON (`server/src/database/data/*.json`) — sin base de datos externa |
| Infraestructura | Docker, Docker Compose, nginx (frontend), tsx (hot-reload en desarrollo) |

## Estructura del proyecto

```
sistema-apuestas-carreras/
├── client/                      # FRONTEND (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/           # Button, Input
│   │   │   ├── molecules/       # Card, BetsDonutChart, SnailBarChart
│   │   │   └── organisms/       # Navbar
│   │   ├── context/             # AuthContext (sesión), WalletContext (saldo)
│   │   ├── hooks/               # useAuth, useWallet
│   │   ├── pages/               # Login, Register, Dashboard, Races, Wallet, MyBets, NotFound
│   │   ├── services/            # api.ts (Axios + token), auth/wallet/race/bet services
│   │   ├── types/api.ts         # Modelos compartidos con la API
│   │   ├── utils/
│   │   ├── App.tsx              # Router + providers
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.js           # Plugin Tailwind + proxy /api → :4000
│   └── Dockerfile
│
├── server/                      # BACKEND (Express + TypeScript)
│   ├── src/
│   │   ├── config/env.ts        # Variables de entorno (dotenv)
│   │   ├── controllers/         # auth, wallet, race, bet
│   │   ├── routes/              # /api/auth, /api/wallet, /api/races, /api/bets
│   │   ├── services/            # auth, bet, race (simulador), snailpay, blacklist
│   │   ├── repositories/        # PATRÓN REPOSITORY: user, wallet, race, bet
│   │   ├── middlewares/         # authMiddleware (JWT + blacklist)
│   │   ├── types/index.ts       # Interfaces del dominio
│   │   ├── database/data/       # users.json, wallets.json, races.json, bets.json, blacklist.json
│   │   ├── app.ts               # Express + CORS + Scalar + rutas
│   │   └── index.ts             # Arranque del servidor y del simulador
│   ├── tsconfig.json
│   └── Dockerfile
│
└── docker-compose.yml
```

## Requisitos y dependencias

**Para ejecutar en local:**
- [Node.js](https://nodejs.org/) **20 o superior** (recomendado: 22 LTS)
- npm (incluido con Node)

**Para ejecutar en contenedores:**
- [Docker](https://docs.docker.com/get-docker/) con Docker Desktop (o motor Docker + plugin de Compose)

**Dependencias principales** (se instalan automáticamente con `npm install`):

- *Server*: express, jsonwebtoken, bcrypt, cors, dotenv, uuid, @scalar/express-api-reference
- *Client*: react, react-dom, react-router-dom, axios, chart.js, react-chartjs-2
- *Dev*: typescript, tsx, tailwindcss, @tailwindcss/vite, vite, oxlint

## Ejecución en local

Abre **dos terminales** (una por servicio):

### 1. Backend (puerto 4000)

```bash
cd server
npm install
npm run dev
```

Servidor disponible en `http://localhost:4000` · Documentación en `http://localhost:4000/scalar`

### 2. Frontend (puerto 5173)

```bash
cd client
npm install
npm run dev
```

App disponible en `http://localhost:5173`. El `vite.config.js` incluye un **proxy** que redirige `/api` al backend, por lo que no hay que configurar nada más.

> El frontend también funciona apuntando directo a `http://localhost:4000` (CORS está habilitado); puedes sobreescribirlo con la variable `VITE_API_URL`.

### Scripts disponibles

| Comando | Ubicación | Descripción |
|---------|-----------|-------------|
| `npm run dev` | server/client | Servidor con recarga en caliente |
| `npm run build` | server/client | Compila TypeScript / bundle de producción |
| `npm start` | server | Ejecuta la build compilada (`dist/index.js`) |
| `npm run lint` | client | Lint con oxlint |
| `npm run test` | client | Tests unitarios con Vitest (auth y wallet) |
| `npm run test:watch` | client | Tests en modo watch (recarga en caliente) |
| `npx tsc --noEmit` | server/client | Typecheck sin generar archivos |

### Tests unitarios

El frontend incluye tests con **Vitest + Testing Library (jsdom)** en `client/src/__tests__/`:

- `auth.service.test.ts` — endpoints de login/register/logout y manejo de errores
- `wallet.service.test.ts` — endpoints de balance/depósito (incluido `?force_error=true`)
- `AuthContext.test.tsx` — sesión: login, register, logout, hidratación desde `localStorage` y limpieza aunque falle el servidor
- `WalletContext.test.tsx` — carga del balance, estado inicial en ceros y manejo de errores

```bash
cd client
npm run test          # una corrida
npm run test:watch    # modo watch
```

## Ejecución con Docker (contenedores)

```bash
docker compose up -d --build
```
Si utilizas entornos Linux o versiones específicas de Docker donde falle la compilación por rutas, ejecuta:

```bash
DOCKER_BUILDKIT=0 docker compose up -d --build
```

Esto construye y levanta:

| Contenedor | Imagen | Puerto | Descripción |
|------------|--------|--------|-------------|
| `apuestas_backend` | node:22-alpine | `4000` | API Express compilada (`tsc`) |
| `apuestas_frontend` | nginx:1.25-alpine | `80` | Build estático de Vite servido por nginx |

- Frontend: **http://localhost**
- Backend/API: **http://localhost:4000** · Scalar: **http://localhost:4000/scalar**

El archivo `docker-compose.yml` monta `server/src/database/data` como volumen, por lo que **los datos (usuarios, wallets, apuestas) persisten fuera del contenedor**.

Otros comandos útiles:

```bash
docker compose ps              # estado de los contenedores
docker compose logs -f         # ver logs en vivo
docker compose up -d --build   # reconstruir tras cambios en el código
docker compose down            # detener y eliminar contenedores
```

## Variables de entorno

### Server (`server/.env`, opcional — todos tienen valores por defecto)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `4000` | Puerto del servidor |
| `JWT_SECRET` | valor de desarrollo | Secreto para firmar los tokens |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `FORCE_ERROR` | `false` | Fuerza error simulado de la pasarela de pago en todo depósito |
| `RACE_INTERVAL_MS` | `15000` | Intervalo entre carreras (ms) |
| `DURATION_OF_RACE_MS` | `5000` | Duración de cada carrera (ms) |

### Client (`client/.env`, opcional)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000` | URL base de la API |

## Endpoints de la API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Registra usuario y crea su wallet en ceros. Devuelve `{ user, token }` |
| `POST` | `/api/auth/login` | No | Inicia sesión. Devuelve `{ user, token }` |
| `POST` | `/api/auth/logout` | Sí | Revoca el token actual (lista negra) |
| `GET` | `/api/wallet/balance` | Sí | Balance y estadísticas de la wallet |
| `POST` | `/api/wallet/deposit` | Sí | Recarga vía SnailPay (`?force_error=true` simula caída) |
| `GET` | `/api/races` | No | Lista de carreras y sus competidores |
| `POST` | `/api/bets` | Sí | Crea un ticket y descuenta el saldo |
| `GET` | `/api/bets/my-bets` | Sí | Historial de apuestas del usuario |

La autenticación se envía en todas las rutas protegidas mediante: `Authorization: Bearer <token>`.

## Tarjetas de prueba (pasarela de pagos)

| Tarjeta | Vencimiento | CVV | Resultado |
|---------|-------------|-----|-----------|
| `1234123412341234` | `12/26` | `543` | ✅ **APPROVED** |
| `4321XXXXXXXXXXXX` | cualquier | cualquier | ❌ `CARD_REJECTED` (fondos insuficientes) |
| cualquier otra | — | — | ❌ `SUSPECTED_FRAUD` |
| cualquiera + `?force_error=true` | — | — | ⚠️ Error 2.3.3 del sistema |

## Flujo de uso

1. **Regístrate** → tu billetera nace con `$0.00`.
2. Ve a **Billetera** y recarga con la tarjeta aprobada.
3. En **Carreras**, elige un caracol y apuesta (solo en carreras `Programada`).
4. Espera a que el simulador ejecute la carrera: si aciertas al ganador, recibes **3x** tu monto.
5. Revisa tus resultados y estadísticas en **Mis Apuestas** y el **Panel Principal**.
