import { userRouter } from './apps/user/user.js';
import { ser } from './config/config.js';

ser.use('/user', userRouter);
