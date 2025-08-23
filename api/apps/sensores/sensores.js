import { Router } from 'express';
import { Auth } from '../middleware/Proteccion.js';

import pkg from '@prisma/client';
import { serializeJsonQuery } from '@prisma/client/runtime/library';
import { faker } from '@faker-js/faker';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const r = Router();

/**
 * @swagger
 * /sensor:
 *   get:
 *     summary: Obtener todos los sensores del usuario
 *     description: Obtiene todos los sensores asociados al usuario autenticado mediante token JWT. 
 *                  Devuelve un arreglo con los nombres y IDs de cada sensor.
 *     tags:
 *       - Sensor
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sensores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sensores obtenidos exitosamente
 *                 token:
 *                   type: string
 *                   nullable: true
 *                 sensores:
 *                   type: array
 *                   description: Lista de sensores del usuario
 *                   items:
 *                     type: object
 *                     properties:
 *                       sensorID:
 *                         type: string
 *                         example: SENSOR1234
 *                         description: Identificador único del sensor
 *                       sensorUsername:
 *                         type: string
 *                         example: Sensor Sala
 *                         description: Nombre del sensor
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error del servidor
 *                 token:
 *                   type: string
 *                   nullable: true
 */
r.get('/', Auth, async (req, res) => {
  try {
    const sensores = await prisma.sensor.findMany({
      where: { usuarioId: req.user.id },
      select: {
        sensorUsername: true,
        sensorID: true,
      },
    });

    return res.status(200).json({
      message: 'Sensores obtenidos exitosamente',
      sensores,
      token: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});

/**
 * @swagger
 * /sensor/{id}:
 *   get:
 *     summary: Obtener un sensor y sus reportes
 *     description: Obtiene un sensor específico del usuario autenticado mediante su `id`. 
 *                  Devuelve los datos del sensor y un arreglo con sus reportes si existe.
 *     tags:
 *       - Sensor
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID del sensor que se desea obtener
 *     responses:
 *       200:
 *         description: Sensor obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sensor obtenido exitosamente
 *                 token:
 *                   type: string
 *                   nullable: true
 *                 resultado:
 *                   type: object
 *                   description: Datos del sensor y sus reportes
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     sensorID:
 *                       type: string
 *                       example: SENSOR1234
 *                     sensorUsername:
 *                       type: string
 *                       example: Sensor Sala
 *                     sensorDescripction:
 *                       type: string
 *                       example: Sensor de temperatura en sala principal
 *                     reportes:
 *                       type: array
 *                       description: Lista de reportes asociados al sensor
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           sensorID:
 *                             type: string
 *                             example: SENSOR1234
 *                           valor:
 *                             type: number
 *                             example: 23.5
 *                           fecha:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-22T14:30:00Z"
 *       400:
 *         description: Falta proporcionar el ID del sensor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Debe proporcionar un id
 *                 token:
 *                   type: string
 *                   nullable: true
 *       404:
 *         description: Sensor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El sensor no se pudo obtener
 *                 token:
 *                   type: string
 *                   nullable: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error del servidor
 *                 token:
 *                   type: string
 *                   nullable: true
 */
r.get('/:id', Auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Debe proporcionar un id', token: null });
    }

    const sensor = await prisma.sensor.findFirst({
      where: {
        id: parseInt(id, 10),
        usuarioId: req.user.id, // seguridad extra
      },
    });

    if (!sensor) {
      return res.status(404).json({ message: 'El sensor no se pudo obtener', token: null });
    }

    const datos = await prisma.reporte.findMany({
      where: { sensorID: sensor.sensorID },
    });

    const resultado = {
      id: sensor.id,
      sensorUsername: sensor.sensorUsername,
      sensorDescripction: sensor.sensorDescripction,
      sensorID: sensor.sensorID,
      reportes: datos || [],
    };

    return res.status(200).json({
      message: 'Sensor obtenido exitosamente',
      resultado,
      token: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});

/**
 * @swagger
 * /sensor:
 *   post:
 *     summary: Registrar un nuevo sensor
 *     description: Registra un sensor asociado al usuario autenticado. 
 *                  Debe enviar `sensorID`, `sensorUsername` y `sensorDescripction`.
 *                  Devuelve los datos del sensor registrado y un token (si aplica).
 *     tags:
 *       - Sensor
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sensorID
 *               - sensorUsername
 *               - sensorDescripction
 *             properties:
 *               sensorID:
 *                 type: string
 *                 example: SENSOR1234
 *                 description: Identificador único del sensor
 *               sensorUsername:
 *                 type: string
 *                 example: Sensor Sala
 *                 description: Nombre del sensor
 *               sensorDescripction:
 *                 type: string
 *                 example: Sensor de temperatura en sala principal
 *                 description: Breve descripción del sensor
 *     responses:
 *       200:
 *         description: Sensor registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sensor registrado exitosamente
 *                 token:
 *                   type: string
 *                   nullable: true
 *                 sensor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     sensorID:
 *                       type: string
 *                       example: SENSOR1234
 *                     sensorUsername:
 *                       type: string
 *                       example: Sensor Sala
 *                     sensorDescripction:
 *                       type: string
 *                       example: Sensor de temperatura en sala principal
 *                     usuarioId:
 *                       type: integer
 *                       example: 42
 *       400:
 *         description: Datos inválidos o sensor ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El sensor ya está registrado por otro usuario
 *                 token:
 *                   type: string
 *                   nullable: true
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error del servidor
 *                 token:
 *                   type: string
 *                   nullable: true
 */
r.post('/', Auth, async (req, res) => {
  try {
    const { sensorID, sensorUsername, sensorDescripction } = req.body;

    if (!sensorID || !sensorUsername || !sensorDescripction) {
      return res.status(400).json({ message: 'Debe proporcionar sensorID, sensorUsername y sensorDescripction', token: null });
    }

    // Verificar si el sensor ya existe
    const check = await prisma.sensor.findFirst({ where: { sensorID } });

    if (check) {
      return res.status(400).json({ message: 'El sensor ya está registrado por otro usuario', token: null });
    }

    const sensor = await prisma.sensor.create({
      data: {
        sensorID,
        sensorUsername,
        sensorDescripction,
        usuarioId: req.user.id,
      },
    });

    return res.status(200).json({ message: 'Sensor registrado exitosamente', token: null, sensor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});


export { r as sensorRouter };
