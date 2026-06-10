import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import { supabase } from '../utils/supabase';
import { emitTaskEvent } from './taskService';

function getPublicUrl(path: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
}

export async function addAttachment(taskId: string, userId: string, file: Express.Multer.File) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only add attachments to your own tasks');
  }

  const filePath = `tasks/${taskId}/${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError(500, 'UPLOAD_FAILED', error.message);
  }

  const url = getPublicUrl(filePath);

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
