import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err);

  if ((err as any).code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds 5MB limit' } });
    return;
  }

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
