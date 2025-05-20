import type { Request } from 'express';
import { ValidationError } from '../types/errors';

export interface PaginationParams {
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const DEFAULT_LIMIT = 20;

export function parsePaginationParams(req: Request): PaginationParams {
  const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : DEFAULT_LIMIT;
  const skip = req.query.skip ? Number.parseInt(req.query.skip as string) : 0;
  if (Number.isNaN(limit) || limit <= 0) {
    throw new ValidationError('Invalid limit parameter', 'USER_VALIDATION');
  }
  if (Number.isNaN(skip) || skip < 0) {
    throw new ValidationError('Invalid skip parameter', 'USER_VALIDATION');
  }
  return { limit, skip };
}

export function buildPaginatedResponse<T>(data: T[], total: number, skip: number, limit: number): PaginatedResponse<T> {
  return {
    data,
    total,
    hasPrevious: skip > 0,
    hasNext: skip + limit < total,
  };
}
