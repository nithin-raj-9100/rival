'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useSSE } from '@/hooks/useSSE';
import { TaskCard } from '@/components/task/task-card';
import { FiltersBar } from '@/components/task/filters-bar';
import { Pagination } from '@/components/task/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({
    sort: 'createdAt',
    order: 'desc',
  });

  useSSE();

  const query = {
    status: filters.status,
    priority: filters.priority,
    search: filters.search,
    sort: filters.sort || 'createdAt',
    order: filters.order || 'desc',
    page: filters.page ? parseInt(filters.page) : 1,
    limit: 10,
  };

  const { data, isLoading, isError } = useTasks(query);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'page' && { page: '1' }) }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters({ sort: 'createdAt', order: 'desc' });
  }, []);

  const handleMarkDone = useCallback(
    (id: string) => {
      updateTask.mutate({ id, status: 'DONE' });
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTask.mutate(id);
    },
    [deleteTask]
  );

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
        <p className="text-muted-foreground mb-6">Please log in to view your tasks.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/login"><Button>Login</Button></Link>
          <Link href="/signup"><Button variant="outline">Sign Up</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/new">
          <Button>
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </Link>
      </div>

      <FiltersBar
        status={filters.status}
        priority={filters.priority}
        search={filters.search}
        sort={filters.sort}
        order={filters.order}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-red-500">Failed to load tasks. Please try again.</p>
      )}

      {data?.tasks?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found.</p>
          <Link href="/tasks/new">
            <Button variant="link">Create your first task</Button>
          </Link>
        </div>
      )}

      {data?.tasks && data.tasks.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                status={task.status}
                priority={task.priority}
                dueDate={task.dueDate}
                createdAt={task.createdAt}
                onMarkDone={handleMarkDone}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => handleFilterChange('page', String(page))}
          />
        </>
      )}
    </div>
  );
}
