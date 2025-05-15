import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../types/errors';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
