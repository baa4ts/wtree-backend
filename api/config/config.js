import express from 'express';
import dotenv from 'dotenv';
import setupSwagger from './swagger.js';

dotenv.config();
const app = express();

// Configuración
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Swagger
setupSwagger(app);

// Listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app };
