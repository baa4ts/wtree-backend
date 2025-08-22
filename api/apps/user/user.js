import { Router } from 'express';

const r = Router();


r.post('/', (req, res) => {
  const { username, gmail, password } = req.body;
  res.json({ username, gmail, password });
});

export { r as userRouter };
