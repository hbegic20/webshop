import express, { type Request, type Response } from 'express';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';

const app = express();

app.get('/health', (req: Request, res: Response) => {
  res.send({ status: 'OK' });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
