import { Router } from 'express';

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const r = Router();

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Registrar un nuevo reporte de un sensor
 *     description: Registra un nuevo reporte para un sensor específico. 
 *                  Se debe enviar `sensorID` y `value`. 
 *                  Si el valor supera cierto umbral, se puede generar una notificación (pendiente de implementar).
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
r.post("/", async (req, res) => {
    const { sensorID, value } = req.body;

    if (!sensorID || value === undefined) {
        return res.status(400).json({ message: "Se debe proporcionar el id y el valor" });
    }

    if (value > 500) {
        // Aquí va la lógica para enviar la notificación
        // TODO: Implementarla
    }

    try {
        const check = await prisma.reporte.create({
            data: { valor: value, sensorID: sensorID }
        });

        return res.status(200).json({ message: "Reporte guardado exitosamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al guardar el reporte", error: error.message });
    }
});

export { r as reporterRouter };
