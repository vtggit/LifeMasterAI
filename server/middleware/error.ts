import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }

  // Default to 500 server error
  return res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
}