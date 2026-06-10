'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useCreateTask } from '@/hooks/useTasks';
import { TaskForm } from '@/components/task/task-form';
import { TaskFormData } from '@/lib/validators';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-md py-1 px-2 -ml-2 hover:bg-muted/40"
      >
        <ArrowLeft className="w-4 h-4" /> Back to workspace
      </Link>
      
      <Card className="glass-card rounded-2xl overflow-hidden border-border/40">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-xl font-bold">Create New Task</CardTitle>
          <CardDescription className="text-xs">Add a new operational directive to your team or personal list.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <TaskForm onSubmit={onSubmit} isPending={createTask.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
