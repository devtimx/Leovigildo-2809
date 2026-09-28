import app from './app.js'; // Recuerda la extensión .js
import { ENV } from './config/env.js';

const PORT = ENV.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Scalar disponible en http://localhost:${PORT}/reference`);
});
