import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send({ resource: 'products', message: 'Welcome to the Products API' });
});

export default router;