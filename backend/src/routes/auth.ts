import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema } from '../utils/validation';
import * as authService from '../services/authService';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.post('/signup', validate(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.signup(req.body.email, req.body.password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
