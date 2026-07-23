import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        return res.status(400).json({ status: 'error', errors: e.issues });
      }
      return res.status(400).json({ status: 'error', message: 'Validation Error' });
    }
  };
};
