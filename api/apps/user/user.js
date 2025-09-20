import { Router } from 'express';
import bcrypt from 'bcrypt';
import { Auth } from '../middleware/Proteccion.js';
import jwt from 'jsonwebtoken';

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const r = Router();

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Registro de usuario
 *     description: Crea un nuevo usuario con `username`, `gmail` y `password`. Devuelve un token JWT válido por 24 horas.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - gmail
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: usuario123
 *               gmail:
 *                 type: string
 *                 example: correo@dominio.com
 *               password:
 *                 type: string
 *                 example: contraseña123
 *     responses:
 *       200:
 *         description: Registro exitoso
 *       400:
 *         description: Faltan credenciales
 *       409:
 *         description: Usuario ya existe
 *       500:
 *         description: Error del servidor
 */
r.post('/', async (req, res) => {
  try {
    const { username, gmail, password, tokenExpo } = req.body;

    if (!username || !gmail || !password) {
      return res.status(400).json({ message: 'Faltan credenciales', token: null });
    }

    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [{ username }, { gmail }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'El usuario ya existe', token: null });
    }

    const hashedPassword = bcrypt.hashSync(password, 5);

    const user = await prisma.usuario.create({
      data: {
        username,
        gmail,
        password: hashedPassword,
        expoToken: tokenExpo ?? null,
      },
    });

    const payload = { id: user.id, username: user.username, gmail: user.gmail, tokenExpo: tokenExpo ?? null };
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '24h' });

    return res.status(200).json({ message: 'Registro exitoso', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Login de usuario
 *     description: Autentica un usuario usando `username`, `password` y `tokenExpo`. Devuelve un token JWT válido por 24 horas si las credenciales son correctas. El JWT incluye `tokenExpo` para notificaciones push.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - tokenExpo
 *             properties:
 *               username:
 *                 type: string
 *                 example: usuario123
 *                 description: Nombre de usuario registrado
 *               password:
 *                 type: string
 *                 example: contraseña123
 *                 description: Contraseña del usuario
 *               tokenExpo:
 *                 type: string
 *                 example: ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 *                 description: Token de Expo Push Notification del dispositivo
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Faltan credenciales o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *                 token:
 *                   type: null
 *       401:
 *         description: Password incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password incorrecta
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
r.put('/', async (req, res) => {
  try {
    const { username, password, tokenExpo } = req.body;

    if (!username || !password || !tokenExpo) {
      console.log(req.body)
      return res.status(401).json({ message: 'Faltan credenciales', token: null });
    }

    const usuario = await prisma.usuario.findFirst({ where: { username } });

    if (!usuario) {
      return res.status(402).json({ message: 'Usuario no encontrado', token: null });
    }

    const passCheck = await bcrypt.compare(password, usuario.password);

    if (!passCheck) {
      return res.status(403).json({ message: 'Password incorrecta', token: null });
    }

    // Actualizar tokenExpo en la base de datos si cambió o es nuevo
    if (usuario.expoToken !== tokenExpo) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { expoToken },
      });
    }

    const payload = { id: usuario.id, username: usuario.username, gmail: usuario.gmail, tokenExpo };
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '24h' });

    return res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     description: Devuelve los datos del usuario que ha iniciado sesión. Requiere token JWT en el header Authorization.
 *     tags:
 *       - Usuarios
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: usuario obtenido exitosamente
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: usuario123
 *                     gmail:
 *                       type: string
 *                       example: correo@dominio.com
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-08-22T10:00:00Z
 *                 token:
 *                   type: null
 *       400:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se pudo obtener el usuario
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
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, gmail: true, createdAt: true },
    });

    if (!user) {
      return res.status(400).json({ message: 'No se pudo obtener el usuario', token: null });
    }

    return res.status(200).json({
      message: 'usuario obtenido exitosamente',
      usuario: user,
      token: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor', token: null });
  }
});

export { r as userRouter };
