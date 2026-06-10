'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useAdminTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/task/task-card';
import { FiltersBar } from '@/components/task/filters-bar';
import { Pagination } from '@/components/task/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({
    sort: 'createdAt',
    order: 'desc',
  });

  const query = {
    status: filters.status,
    priority: filters.priority,
    search: filters.search,
    sort: filters.sort || 'createdAt',
    order: filters.order || 'desc',
    page: filters.page ? parseInt(filters.page) : 1,
    limit: 10,
  };

  const { data, isLoading, isError } = useAdminTasks(query);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'page' && { page: '1' }) }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters({ sort: 'createdAt', order: 'desc' });
  }, []);

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-md" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    router.push('/tasks');
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-md py-1 px-2 hover:bg-muted/40"
            aria-label="Back to dashboard workspace"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Global overview and management of all operations across the database.
            </p>
          </div>
        </div>
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
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading admin database...</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="glass-card p-6 border-destructive/20 bg-destructive/5 text-destructive rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-semibold text-sm">Failed to retrieve admin list. Please check database permissions.</p>
        </div>
      )}

      {!isLoading && !isError && data?.tasks?.length === 0 && (
        <p className="text-muted-foreground text-center py-16 font-semibold bg-muted/20 border border-dashed border-border/60 rounded-2xl">
          No user tasks were found in the database.
        </p>
      )}

      {!isLoading && !isError && data?.tasks && data.tasks.length > 0 && (
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
