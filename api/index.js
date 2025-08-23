import { ser } from '../config/config.js';
import { userRouter } from '../apps/user/user.js';
import { sensorRouter } from '../apps/sensores/sensores.js';
import { reporterRouter } from '../apps/reportes/reportes.js';

// Montamos las rutas
ser.use('/user', userRouter);
ser.use('/sensor', sensorRouter);
ser.use('/reports', reporterRouter);

// Exportamos como función serverless
export default ser;
