import { Router } from 'express';
import { Auth } from '../middleware/Proteccion.js';

import pkg from '@prisma/client';
import { serializeJsonQuery } from '@prisma/client/runtime/library';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const r = Router();

/**
 * @swagger
 * /sensor:
 *   get:
 *     summary: Obtener sensores del usuario autenticado
 *     description: Devuelve la lista de sensores asociados al usuario que ha iniciado sesión. Requiere token JWT.
 *     tags:
 *       - sensor
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
 *                 sensores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sensorID:
 *                         type: integer
 *                         example: 101
 *                       sensorUsername:
 *                         type: string
 *                         example: sensor_1
 *                 token:
 *                   type: null
 *       401:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token requerido
 *                 token:
 *                   type: null
 *       403:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token inválido
 *                 token:
 *                   type: null
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
 *                   type: null
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
 *     summary: Obtener un sensor por ID
 *     description: Devuelve la información de un sensor específico y sus reportes. Solo el usuario autenticado puede acceder a sus propios sensores. Requiere token JWT.
 *     tags:
 *       - sensor
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sensor
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
 *                 resultado:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     sensorUsername:
 *                       type: string
 *                       example: sensor_1
 *                     sensorDescripction:
 *                       type: string
 *                       example: Sensor de temperatura ambiente
 *                     sensorID:
 *                       type: integer
 *                       example: 101
 *                     reportes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 55
 *                           sensorID:
 *                             type: integer
 *                             example: 101
 *                           valor:
 *                             type: number
 *                             example: 25.7
 *                           fecha:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-08-22T10:15:00Z
 *                 token:
 *                   type: null
 *       400:
 *         description: ID no proporcionado
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido
 *       404:
 *         description: Sensor no encontrado o no pertenece al usuario
 *       500:
 *         description: Error del servidor
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

// r.post('/', Auth, async (req, res) => {
//     try {
//         const { sensorID, sensorUsername, sensorDescripction } = req.body;

//         if (!sensorIDm || !sensorUsername || !sensorDescripction) {
//             return res.status(400).json({ message: 'Debe proporcionar un id', token: null });

//         }

//     } catch (error) {

//     }
// });

export { r as sensorRouter };
