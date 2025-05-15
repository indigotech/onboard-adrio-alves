import type { NextFunction, Request, Response } from 'express';
import { ValidationError, AuthError } from '../types/errors';

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

  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      code: err.code,
    });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
