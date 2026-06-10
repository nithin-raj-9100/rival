import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';

export async function addAttachment(taskId: string, userId: string, file: Express.Multer.File) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only add attachments to your own tasks');
  }

  const attachment = await prisma.attachment.create({
    data: {
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      taskId,
    },
  });

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
