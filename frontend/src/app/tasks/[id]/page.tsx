'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTask, useUpdateTask, useActivityLog, useAttachments, useUploadAttachment } from '@/hooks/useTasks';
import { TaskForm } from '@/components/task/task-form';
import { ActivityTimeline } from '@/components/task/activity-timeline';
import { FileUpload } from '@/components/task/file-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit3, History, Paperclip, Loader2 } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!task) {
    return (
      <div className="text-center py-24 max-w-md mx-auto glass-card p-8 rounded-2xl border border-border/40 my-12 animate-shake">
        <p className="text-base text-muted-foreground mb-6">Oops! The requested task was not found.</p>
        <Link href="/tasks" className="focus-ring rounded-lg">
          <Button className="font-semibold cursor-pointer">Back to workspace</Button>
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
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-md py-1 px-2 -ml-2 hover:bg-muted/40"
      >
        <ArrowLeft className="w-4 h-4" /> Back to workspace
      </Link>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground truncate">{task.title}</h1>
        <p className="text-xs text-muted-foreground">
          ID: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] select-all font-mono">{task.id}</code>
        </p>
      </div>

      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList className="glass-card p-1 rounded-xl border border-border/30 w-full sm:w-auto flex">
          <TabsTrigger value="edit" className="gap-2 font-bold text-xs py-2 px-4 flex-1 sm:flex-initial rounded-lg cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Edit3 className="w-3.5 h-3.5 text-primary" /> Edit Details
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 font-bold text-xs py-2 px-4 flex-1 sm:flex-initial rounded-lg cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="w-3.5 h-3.5 text-indigo-500" /> Activity Log
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-2 font-bold text-xs py-2 px-4 flex-1 sm:flex-initial rounded-lg cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Paperclip className="w-3.5 h-3.5 text-emerald-500" /> Attachments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="focus-ring rounded-2xl outline-none">
          <Card className="glass-card rounded-2xl overflow-hidden border-border/40">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg font-bold">Edit Details</CardTitle>
              <CardDescription className="text-xs">Update your task information, status, priority, and timeline.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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

        <TabsContent value="activity" className="focus-ring rounded-2xl outline-none">
          <Card className="glass-card rounded-2xl overflow-hidden border-border/40">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg font-bold">Activity Log</CardTitle>
              <CardDescription className="text-xs">Chronological timeline of updates and interactions for this task.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ActivityTimeline activities={activities || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="focus-ring rounded-2xl outline-none">
          <Card className="glass-card rounded-2xl overflow-hidden border-border/40">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg font-bold">Attachments</CardTitle>
              <CardDescription className="text-xs">Upload images, PDFs, or documents relevant to this task.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
