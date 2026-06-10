'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useAdminTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/task/task-card';
import { FiltersBar } from '@/components/task/filters-bar';
import { Pagination } from '@/components/task/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
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

  const { data, isLoading } = useAdminTasks(query);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'page' && { page: '1' }) }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters({ sort: 'createdAt', order: 'desc' });
  }, []);

  if (authLoading) return null;

  if (!user || user.role !== 'ADMIN') {
    router.push('/tasks');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tasks" className="flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Admin — All Tasks</h1>
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

      {data?.tasks?.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No tasks found.</p>
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
