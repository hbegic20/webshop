import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send({ resource: 'auth', message: 'Welcome to the Auth API' });
});

export default router;