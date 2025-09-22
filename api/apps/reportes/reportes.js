import { Router } from 'express';

import pkg from '@prisma/client';
import { Auth } from '../middleware/Proteccion.js';
const { PrismaClient } = pkg;
import { sendPushNotification } from '../../../expo/expo.js';

const prisma = new PrismaClient();
const r = Router();

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Registrar un nuevo reporte de un sensor
 *     description: Registra un nuevo reporte para un sensor específico.
 *                  Se debe enviar `sensorID` y `value`.
 *                  Si el valor supera cierto umbral, se puede generar una notificación al usuario.
 *     tags:
 *       - Reportes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sensorID
 *               - value
 *             properties:
 *               sensorID:
 *                 type: string
 *                 example: SENSOR1234
 *                 description: Identificador único del sensor al que pertenece el reporte
 *               value:
 *                 type: number
 *                 example: 23.5
 *                 description: Valor registrado por el sensor
 *     responses:
 *       200:
 *         description: Reporte guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reporte guardado exitosamente
 *       400:
 *         description: Datos incompletos o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se debe proporcionar el id y el valor
 *       500:
 *         description: Error al guardar el reporte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al guardar el reporte
 *                 error:
 *                   type: string
 *                   example: Detalle del error interno
 */
r.post('/', async (req, res) => {
  const { sensorID, value } = req.body;

  // Validación de datos
  if (!sensorID || value === undefined) {
    return res.status(400).json({ message: 'Se debe proporcionar el id y el valor' });
  }

  try {
    await prisma.reporte.create({
      data: { valor: value, sensorID },
    });

    // if (value > 750) {
    //   const sensorData = await prisma.sensor.findUnique({
    //     where: { sensorID },
    //     select: { usuarioId: true, sensorUsername: true },
    //   });

    //   if (sensorData) {
    //     const usuario = await prisma.usuario.findUnique({
    //       where: { id: sensorData.usuarioId },
    //       select: { expoToken: true, username: true },
    //     });

    //     if (usuario && usuario.expoToken) {
    //       const sent = sendPushNotification(
    //         usuario.expoToken,
    //         `¡¡¡ ${usuario.username} vuelvee !!!`,
    //         `Tu planta te necesita. El sensor ${sensorData.sensorUsername} detectó que su tierra se está secando.`,
    //         sensorID
    //       );

    //       if (sent) console.log(`Notificación enviada: ${usuario} : ${usuario.expoToken}`);
    //     }
    //   }
    // }

    return res.status(200).json({ message: 'Reporte guardado exitosamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al guardar el reporte', error: error.message });
  }
});


/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Obtener reportes de los sensores del usuario
 *     description: Obtiene todos los reportes asociados a los sensores del usuario autenticado.  
 *                  Cada reporte incluye la información del sensor (nombre y descripción).
 *     tags:
 *       - Reportes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-17T15:29:37.000Z"
 *                   valor:
 *                     type: number
 *                     example: 288
 *                   sensorID:
 *                     type: string
 *                     example: CASA
 *                   sensorUsername:
 *                     type: string
 *                     example: Sensor Sala
 *                   sensorDescripction:
 *                     type: string
 *                     example: Sensor en la sala principal
 *       404:
 *         description: No se encontraron sensores o reportes para el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se encontraron reportes
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
r.get('/', Auth, async (req, res) => {
  const { id } = req.user;

  try {
    const sensores = await prisma.sensor.findMany({
      where: { usuarioId: id },
      select: {
        sensorID: true,
        sensorUsername: true,
        sensorDescripction: true,
      },
    });

    if (!sensores.length) {
      return res.status(404).json({ message: 'No se encontraron sensores', token: null });
    }

    const sensorID = sensores.map(i => i.sensorID);

    const reportes = await prisma.reporte.findMany({
      where: { sensorID: { in: sensorID } },
      select: { fecha: true, valor: true, sensorID: true },
      orderBy: { fecha: 'desc' },
    });

    if (!reportes.length) {
      return res.status(404).json({ message: 'No se encontraron reportes', token: null });
    }

    const reportesConInfo = reportes.map(rep => {
      const sensor = sensores.find(s => s.sensorID === rep.sensorID);
      return {
        ...rep,
        sensorUsername: sensor?.sensorUsername || null,
        sensorDescripction: sensor?.sensorDescripction || null,
      };
    });

    return res.status(200).json(reportesConInfo);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});

export { r as reporterRouter };
