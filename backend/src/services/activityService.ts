import { prisma } from '../prisma';
import { emitTaskEvent } from './taskService';

export async function logActivity(
  userId: string,
  taskId: string,
  action: string,
  field: string | null,
  oldValue: string | null,
  newValue: string | null
) {
  await prisma.activityLog.create({
    data: { userId, taskId, action, field, oldValue, newValue },
  });

  emitTaskEvent(userId, { type: 'activity:new', taskId, action, field, newValue });
}

export async function getActivityLog(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return [];
  }
  if (task.userId !== userId) {
    return [];
  }

  return prisma.activityLog.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true } },
    },
  });
}
