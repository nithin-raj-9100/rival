import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(source === 'body' ? req.body : req.query);
      if (source === 'body') {
        req.body = data;
      } else {
        (req as any).validatedQuery = data;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
          },
        });
        return;
      }
      next(err);
    }
  };
}
