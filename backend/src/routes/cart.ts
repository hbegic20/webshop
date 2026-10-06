import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send({ resource: 'cart', message: 'Welcome to the Cart API' });
});

export default router;