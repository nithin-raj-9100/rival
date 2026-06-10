import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { taskQuerySchema } from '../utils/validation';
import * as taskService from '../services/taskService';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/tasks', validate(taskQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req as any).validatedQuery;
    const result = await taskService.getTasks(req.user!.userId, true, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
