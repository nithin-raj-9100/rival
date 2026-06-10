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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input id="title" {...register('title')} placeholder="Task title" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Optional description" rows={3} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select
            defaultValue={defaultValues?.status || 'TODO'}
            onValueChange={(v) => setValue('status', v as TaskFormData['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>

        <div>
          <Label>Priority</Label>
          <Select
            defaultValue={defaultValues?.priority || 'MEDIUM'}
            onValueChange={(v) => setValue('priority', v as TaskFormData['priority'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" {...register('dueDate')} />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Saving...' : 'Save Task'}
      </Button>
    </form>
  );
}
