import express from 'express';
import dotenv from 'dotenv';
import setupSwagger from './swagger.js';

dotenv.config();
const ser = express();

// Configuración
ser.use(express.json());
const PORT = process.env.PORT || 3000;

// Swagger
setupSwagger(ser);

// Listener
ser.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { ser };
