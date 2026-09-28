import app from './app.js'; // Recuerda la extensión .js
import { ENV } from './config/env.js';
import raceSimulatorService from './services/race.service.js';

const PORT = ENV.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Scalar disponible en http://localhost:${PORT}/scalar`);

  try {
    await raceSimulatorService.initializeDailyRaces();
  } catch (error) {
    console.error('Error initializing daily races:', error);
  }
});
