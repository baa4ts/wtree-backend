import { Router } from 'express';

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const r = Router();

r.post('/', async (req, res) => {
  try {
    const { sensorID } = req.body;

    if (!sensorID) {
      return res.status(400).json({ error: 'Falta sensorID' });
    }

    const sensor = await prisma.Sensor.findUnique({
      where: { sensorID },
      include: { usuario: true }
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor no registrado' });
    }

    const responseData = {
      username: sensor.usuario.username,
      sensorName: sensor.sensorUsername,
      expoToken: sensor.usuario.expoToken
    };

    return res.json(responseData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
});


export { r as tokenRoute };
