import express from 'express';
import dotenv from 'dotenv';
import setupSwagger from './swagger.js';

dotenv.config();
const ser = express();

// Middleware global para medir tiempo de respuesta
ser.use((req, res, next) => {
  const start = process.hrtime.bigint();

  const originalEnd = res.end;
  res.end = function (chunk, encoding, callback) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
});


ser.use(express.json());
const PORT = process.env.PORT || 3000;

setupSwagger(ser);

ser.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { ser };
