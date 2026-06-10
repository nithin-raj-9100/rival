'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTask, useUpdateTask, useActivityLog, useAttachments, useUploadAttachment } from '@/hooks/useTasks';
import { TaskForm } from '@/components/task/task-form';
import { ActivityTimeline } from '@/components/task/activity-timeline';
import { FileUpload } from '@/components/task/file-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TaskFormData } from '@/lib/validators';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data: task, isLoading } = useTask(id);
  const { data: activities } = useActivityLog(id);
  const { data: attachments } = useAttachments(id);
  const updateTask = useUpdateTask();
  const uploadAttachment = useUploadAttachment();

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Task not found.</p>
        <Link href="/tasks">
          <span className="text-primary hover:underline">Back to tasks</span>
        </Link>
      </div>
    );
  }

  const onSubmit = (data: TaskFormData) => {
    const payload: any = {};
    if (data.title !== task.title) payload.title = data.title;
    if (data.description !== (task.description || '')) payload.description = data.description || null;
    if (data.status !== task.status) payload.status = data.status;
    if (data.priority !== task.priority) payload.priority = data.priority;
    if (data.dueDate) {
      const newDue = new Date(data.dueDate).toISOString();
      if (newDue !== (task.dueDate ? new Date(task.dueDate).toISOString() : null)) {
        payload.dueDate = newDue;
      }
    } else if (task.dueDate) {
      payload.dueDate = null;
    }

    if (Object.keys(payload).length === 0) return;
    updateTask.mutate({ id, ...payload });
  };

  const handleUpload = (file: File) => {
    uploadAttachment.mutate({ taskId: id, file });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/tasks" className="flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                defaultValues={{
                  title: task.title,
                  description: task.description || '',
                  status: task.status,
                  priority: task.priority,
                  dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                }}
                onSubmit={onSubmit}
                isPending={updateTask.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUpload={handleUpload}
                isPending={uploadAttachment.isPending}
                attachments={attachments}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
