import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): Response {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
}