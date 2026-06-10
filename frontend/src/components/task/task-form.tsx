'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

interface TaskFormProps {
  defaultValues?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => void;
  isPending?: boolean;
}

export function TaskForm({ defaultValues, onSubmit, isPending }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Field */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Task Title <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          placeholder="e.g., Design database schema"
          className="bg-background/50 border-border/50 focus:border-primary h-11 px-4 rounded-xl"
        />
        {errors.title && (
          <p id="title-error" role="alert" className="text-xs font-semibold text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          placeholder="Detail the tasks, requirements, or links..."
          rows={4}
          className="bg-background/50 border-border/50 focus:border-primary px-4 py-3 rounded-xl resize-none"
        />
        {errors.description && (
          <p id="description-error" role="alert" className="text-xs font-semibold text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Status & Priority Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span id="status-select-label" className="block font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <Select
            defaultValue={defaultValues?.status || 'TODO'}
            onValueChange={(v) => setValue('status', v as TaskFormData['status'])}
          >
            <SelectTrigger aria-labelledby="status-select-label" className="bg-background border-border h-11 rounded-xl cursor-pointer text-xs font-bold text-foreground hover:bg-accent/50 shadow-sm transition-all focus-ring">
              <SelectValue placeholder="Status">
                {(value) => {
                  const labels: Record<string, string> = {
                    TODO: 'To Do',
                    IN_PROGRESS: 'In Progress',
                    DONE: 'Done',
                  };
                  return labels[value] || value || 'Status';
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p role="alert" className="text-xs font-semibold text-destructive mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <span id="priority-select-label" className="block font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Priority
          </span>
          <Select
            defaultValue={defaultValues?.priority || 'MEDIUM'}
            onValueChange={(v) => setValue('priority', v as TaskFormData['priority'])}
          >
            <SelectTrigger aria-labelledby="priority-select-label" className="bg-background border-border h-11 rounded-xl cursor-pointer text-xs font-bold text-foreground hover:bg-accent/50 shadow-sm transition-all focus-ring">
              <SelectValue placeholder="Priority">
                {(value) => {
                  const labels: Record<string, string> = {
                    LOW: 'Low',
                    MEDIUM: 'Medium',
                    HIGH: 'High',
                  };
                  return labels[value] || value || 'Priority';
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p role="alert" className="text-xs font-semibold text-destructive mt-1">
              {errors.priority.message}
            </p>
          )}
        </div>
      </div>

      {/* Due Date Field */}
      <div className="space-y-1.5">
        <Label htmlFor="dueDate" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Due Date
        </Label>
        <Input
          id="dueDate"
          type="date"
          {...register('dueDate')}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
          className="bg-background/50 border-border/50 focus:border-primary h-11 px-4 rounded-xl cursor-pointer"
        />
        {errors.dueDate && (
          <p id="dueDate-error" role="alert" className="text-xs font-semibold text-destructive mt-1">
            {errors.dueDate.message}
          </p>
        )}
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-6 h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving task...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Task
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
