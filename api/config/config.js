import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const ser = express();

// Configuración
ser.use(express.json());
const PORT = process.env.PORT || 3000;

// Listener
ser.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { ser };
