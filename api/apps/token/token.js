import { Router } from 'express';

import pkg from '@prisma/client';
import { Auth } from '../middleware/Proteccion.js';
const { PrismaClient } = pkg;
import { sendPushNotification } from '../../../expo/expo.js';

const prisma = new PrismaClient();
const r = Router();
