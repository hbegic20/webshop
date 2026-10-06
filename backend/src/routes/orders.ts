import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send({ resource: 'orders', message: 'Welcome to the Orders API' });
});

export default router;