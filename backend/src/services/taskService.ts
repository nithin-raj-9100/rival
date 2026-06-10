import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../utils/validation';
import { Prisma } from '@prisma/client';
import { logActivity } from './activityService';
import { getCached, setCache, delCache, cacheKey, delByPattern } from '../utils/redis';

const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

const TASK_CACHE_TTL = 300; // 5 min for single task
const LIST_CACHE_TTL = 30;  // 30s for list queries

function listCacheKey(userId: string, query: TaskQueryInput) {
  const q = `${query.status ?? ''}|${query.priority ?? ''}|${query.search ?? ''}|${query.sort}|${query.order}|${query.page}|${query.limit}`;
  return cacheKey('list', userId, q);
}

export async function createTask(userId: string, data: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'TODO',
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId,
    },
  });

  await logActivity(userId, task.id, 'CREATED', null, null, null);
  await delByPattern(cacheKey('list', userId, '*'));
  return task;
}

export async function getTasks(userId: string, admin: boolean, query: TaskQueryInput) {
  const key = listCacheKey(userId, query);
  const cached = await getCached(key);
  if (cached) return cached;

  const where: Prisma.TaskWhereInput = {};
  if (!admin) {
    where.userId = userId;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.priority) {
    where.priority = query.priority;
  }
  if (query.search) {
    where.title = { contains: query.search, mode: 'insensitive' };
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput =
    query.sort === 'priority'
      ? { priority: query.order }
      : query.sort === 'dueDate'
        ? { dueDate: query.order }
        : { createdAt: query.order };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.task.count({ where }),
  ]);

  if (query.sort === 'priority') {
    tasks.sort((a, b) => {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return query.order === 'desc' ? -diff : diff;
    });
  }

  const result = {
    tasks,
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit),
  };

  await setCache(key, result, LIST_CACHE_TTL);
  return result;
}

export async function getTaskById(taskId: string, userId: string, admin: boolean) {
  const cacheId = cacheKey('item', taskId);
  const cached = await getCached<Record<string, unknown>>(cacheId);
  if (cached) {
    if (!admin && cached.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only view your own tasks');
    }
    return cached;
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (!admin && task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only view your own tasks');
  }

  await setCache(cacheId, task, TASK_CACHE_TTL);
  return task;
}

export async function updateTask(taskId: string, userId: string, admin: boolean, data: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (!admin && task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only update your own tasks');
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
  });

  for (const key of ['title', 'description', 'status', 'priority', 'dueDate'] as const) {
    if (data[key] !== undefined) {
      const oldRaw = task[key as keyof typeof task];
      const newRaw = data[key];
      const oldVal = key === 'dueDate' && oldRaw instanceof Date ? oldRaw.toISOString() : String(oldRaw ?? '');
      const newVal = String(newRaw ?? '');
      await logActivity(userId, taskId, 'UPDATED', key, oldVal, newVal !== oldVal ? newVal : null);
    }
  }

  await delCache(cacheKey('item', taskId));
  await delByPattern(cacheKey('list', userId, '*'));
  if (admin) await delByPattern(cacheKey('list', task.userId, '*'));

  emitTaskEvent(userId, { type: 'task:updated', task: updated });
  return updated;
}

export async function deleteTask(taskId: string, userId: string, admin: boolean) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
  }
  if (!admin && task.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only delete your own tasks');
  }

  await logActivity(userId, taskId, 'DELETED', null, null, null);
  await prisma.task.delete({ where: { id: taskId } });

  await delCache(cacheKey('item', taskId));
  await delByPattern(cacheKey('list', userId, '*'));
  if (admin) await delByPattern(cacheKey('list', task.userId, '*'));

  emitTaskEvent(userId, { type: 'task:deleted', taskId });
}

type EventCallback = (event: object) => void;
const eventClients = new Map<string, EventCallback[]>();

export function addEventClient(userId: string, callback: EventCallback) {
  const clients = eventClients.get(userId) || [];
  clients.push(callback);
  eventClients.set(userId, clients);
}

export function removeEventClient(userId: string, callback: EventCallback) {
  const clients = eventClients.get(userId) || [];
  eventClients.set(userId, clients.filter((cb) => cb !== callback));
}

export function emitTaskEvent(userId: string, event: object) {
  const clients = eventClients.get(userId) || [];
  for (const cb of clients) {
    try {
      cb(event);
    } catch {
      // client disconnected
    }
  }
}
