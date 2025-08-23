import { reporterRouter } from './apps/reportes/reportes.js';
import { sensorRouter } from './apps/sensores/sensores.js';
import { userRouter } from './apps/user/user.js';
import { ser } from './config/config.js';

app.use('/user', userRouter);
app.use('/sensor', sensorRouter);
app.use('/reports', reporterRouter);



module.exports = app;