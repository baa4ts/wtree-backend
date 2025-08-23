import express from 'express';
import dotenv from 'dotenv';
import setupSwagger from '../swagger.js';

dotenv.config();
const ser = express();

// Configuración
ser.use(express.json());

// Swagger (opcional)
setupSwagger(ser);

export { ser };
