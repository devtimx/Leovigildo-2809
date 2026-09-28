


sistema-apuestas-carreras/
├── client/                      # FRONTEND (React + Vite)
│   ├── src/
│   │   ├── components/          # Componentes visuales (Tarjetas de carreras, botones)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Gestión de sesión (localStorage)
│   │   │   └── WalletContext.jsx# Gestión del saldo del usuario
│   │   ├── hooks/               # useAuth, useRaceSimulator, etc.
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx    # Panel principal, saldo, carreras activas
│   │   │   └── Deposit.jsx      # Formulario que conecta a la pasarela de pagos
│   │   ├── services/
│   │   │   ├── api.js           # Configuración base de Axios/Fetch
│   │   │   └── race.service.js  # Llamadas a endpoints de carreras/apuestas
│   │   └── App.jsx
│
├── server/                      # BACKEND (Express)
│   ├── src/
│   │   ├── config/              # Variables de entorno y constantes del sistema
│   │   ├── controllers/         # Reciben peticiones HTTP y responden
│   │   │   ├── auth.controller.js
│   │   │   ├── bet.controller.js
│   │   │   └── wallet.controller.js
│   │   │
│   │   ├── database/            # Capa de persistencia local
│   │   │   ├── data/
│   │   │   │   ├── users.json   # Almacena usuarios y su saldo (wallet)
│   │   │   │   └── bets.json    # Almacena el historial de apuestas
│   │   │   └── memoryDb.js      # Opcional: estado global en memoria si no usas JSON
│   │   │
│   │   ├── repositories/        # PATRÓN REPOSITORY (Lógica de acceso a datos)
│   │   │   ├── user.repository.js # Métodos: findByEmail(), save(), updateBalance()
│   │   │   └── bet.repository.js  # Métodos: create(), findByUserId()
│   │   │
│   │   ├── services/            # LÓGICA DE NEGOCIO (Casos de uso)
│   │   │   ├── auth.service.js
│   │   │   ├── bet.service.js
│   │   │   ├── race.service.js  # Módulo del Simulador de las 6 carreras del día
│   │   │   └── payment.gateway.js # Módulo Externo Simulador de Pasarela de Pagos
│   │   │
│   │   ├── middlewares/         # Validación de JWT/sesión y de saldos suficientes
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── bet.routes.js
│   │   │   ├── wallet.routes.js
│   │   │   └── index.js
│   │   │
│   │   └── app.js
│   ├── index.js
│   └── package.json
