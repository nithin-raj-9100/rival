import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import * as attachmentService from '../services/attachmentService';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats)/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_MISSING', message: 'No file uploaded' } });
      return;
    }
    const attachment = await attachmentService.addAttachment(req.params.taskId as string, req.user!.userId, req.file);
    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attachments = await attachmentService.getAttachments(req.params.taskId as string, req.user!.userId);
    res.json(attachments);
  } catch (err) {
    next(err);
  }
});

export default router;
