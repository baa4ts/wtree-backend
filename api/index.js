import { reporterRouter } from './apps/reportes/reportes.js';
import { sensorRouter } from './apps/sensores/sensores.js';
import { userRouter } from './apps/user/user.js';
import { ser } from './config/config.js';

ser.use('/user', userRouter);
ser.use('/sensor', sensorRouter);
ser.use('/reports', reporterRouter);

export default ser;