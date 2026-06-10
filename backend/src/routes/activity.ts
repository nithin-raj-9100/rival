import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as activityService from '../services/activityService';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await activityService.getActivityLog(req.params.taskId as string, req.user!.userId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
