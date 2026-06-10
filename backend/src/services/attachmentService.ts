import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { emitTaskEvent } from './taskService';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function saveFile(file: Express.Multer.File): string {
  const ext = path.extname(file.originalname);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  return filename;
}

export async function addAttachment(taskId: string, userId: string, file: Express.Multer.File) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only add attachments to your own tasks');
  }

  const filename = saveFile(file);
  const url = `/uploads/${filename}`;

  const attachment = await prisma.attachment.create({
    data: {
      filename: file.originalname,
      url,
      mimeType: file.mimetype,
      size: file.size,
      taskId,
    },
  });

  emitTaskEvent(userId, { type: 'attachment:added', taskId, attachmentId: attachment.id });
  return attachment;
}

export async function getAttachments(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only view your own tasks');
  }

  return prisma.attachment.findMany({ where: { taskId }, orderBy: { createdAt: 'desc' } });
}
