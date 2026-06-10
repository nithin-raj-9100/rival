'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useCreateTask } from '@/hooks/useTasks';
import { TaskForm } from '@/components/task/task-form';
import { TaskFormData } from '@/lib/validators';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTaskPage() {
  const { user, loading } = useAuth();
  const createTask = useCreateTask();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    router.push('/login');
    return null;
  }

  const onSubmit = (data: TaskFormData) => {
    const payload: any = { ...data };
    if (!payload.description) delete payload.description;
    if (!payload.dueDate) payload.dueDate = null;
    else payload.dueDate = new Date(payload.dueDate).toISOString();

    createTask.mutate(payload, {
      onSuccess: () => router.push('/tasks'),
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/tasks" className="flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm onSubmit={onSubmit} isPending={createTask.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
