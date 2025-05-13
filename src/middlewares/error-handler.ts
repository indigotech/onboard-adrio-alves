import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (err instanceof ValidationError) {
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
