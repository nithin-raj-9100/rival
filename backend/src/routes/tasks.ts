import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../utils/validation';
import * as taskService from '../services/taskService';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.createTask(req.user!.userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.get('/', validate(taskQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req as any).validatedQuery;
    const result = await taskService.getTasks(req.user!.userId, false, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTaskById(req.params.id as string, req.user!.userId, req.user!.role === 'ADMIN');
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validate(updateTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.updateTask(req.params.id as string, req.user!.userId, req.user!.role === 'ADMIN', req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await taskService.deleteTask(req.params.id as string, req.user!.userId, req.user!.role === 'ADMIN');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
