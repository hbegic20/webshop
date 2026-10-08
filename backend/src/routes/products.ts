import { Router, type Request, type Response } from 'express';
import { AppError } from '../errors/AppError.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send({ resource: 'products', message: 'Welcome to the Products API' });
});

router.get('/boom', () => {
  throw new AppError(400, 'Something was wrong with your request');
});
router.get('/crash', () => {
  throw new AppError(500, 'Secret internal server error');
});

export default router;