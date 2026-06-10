'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { useSSE } from '@/hooks/useSSE';
import { TaskCard } from '@/components/task/task-card';
import { FiltersBar } from '@/components/task/filters-bar';
import { Pagination } from '@/components/task/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, CheckSquare, Loader2, ListTodo, ClipboardCheck, TrendingUp, AlertCircle } from 'lucide-react';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({
    sort: 'createdAt',
    order: 'desc',
  });

  useSSE();

  // Load all tasks (up to 50) in background to compute accurate global dashboard stats
  const { data: allTasksData, isLoading: allTasksLoading } = useTasks({ limit: 50 });

  const debouncedSearch = useDebounce(filters.search);

  const query = {
    status: filters.status,
    priority: filters.priority,
    search: debouncedSearch,
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

  // Drag and Drop handlers for Board (Kanban) View
  const handleDragOver = (e: React.DragEvent, statusCol: string) => {
    e.preventDefault();
    if (draggedOverCol !== statusCol) {
      setDraggedOverCol(statusCol);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Find the task in the list to check if it's already in the target status
    const task = data?.tasks?.find((t: any) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      updateTask.mutate({ id: taskId, status: targetStatus });
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="text-center py-24 max-w-md mx-auto glass-card p-8 rounded-2xl border border-border/40 my-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Manage Your Tasks
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          A premium experience to streamline your workflow and collaborate smoothly. Please log in to see your workspace.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="focus-ring rounded-lg">
            <Button size="lg" className="font-semibold shadow-md shadow-primary/20 cursor-pointer">
              Login to workspace
            </Button>
          </Link>
          <Link href="/signup" className="focus-ring rounded-lg">
            <Button size="lg" variant="outline" className="font-semibold cursor-pointer">
              Sign Up
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // Calculate statistics from the full task array
  const totalTasks = allTasksData?.tasks?.length || 0;
  const completedTasks = allTasksData?.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
  const inProgressTasks = allTasksData?.tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0;
  const highPriorityTasks = allTasksData?.tasks?.filter((t: any) => t.priority === 'HIGH' && t.status !== 'DONE').length || 0;

  // Split tasks into columns for Kanban Board view
  const todoTasks = data?.tasks?.filter((t: any) => t.status === 'TODO') || [];
  const inProgressFilteredTasks = data?.tasks?.filter((t: any) => t.status === 'IN_PROGRESS') || [];
  const doneTasks = data?.tasks?.filter((t: any) => t.status === 'DONE') || [];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Workspace Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here is a summary of your operations.
          </p>
        </div>
        <Link href="/tasks/new" className="focus-ring rounded-xl self-start sm:self-auto">
          <Button className="font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all cursor-pointer">
            <Plus className="w-5 h-5 mr-1" /> New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards Dashboard */}
      <section aria-label="Dashboard Statistics Overview" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</span>
            {allTasksLoading ? (
              <Skeleton className="h-8 w-12 rounded-lg my-0.5" />
            ) : (
              <p className="text-2xl font-extrabold text-foreground group-hover:scale-105 transition-transform origin-left">{totalTasks}</p>
            )}
          </div>
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
            {allTasksLoading ? (
              <Skeleton className="h-8 w-12 rounded-lg my-0.5" />
            ) : (
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform origin-left">{completedTasks}</p>
            )}
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</span>
            {allTasksLoading ? (
              <Skeleton className="h-8 w-12 rounded-lg my-0.5" />
            ) : (
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform origin-left">{inProgressTasks}</p>
            )}
          </div>
          <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-rose-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High Risk</span>
            {allTasksLoading ? (
              <Skeleton className="h-8 w-12 rounded-lg my-0.5" />
            ) : (
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform origin-left">{highPriorityTasks}</p>
            )}
          </div>
          <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Filters Control Bar */}
      <FiltersBar
        status={filters.status}
        priority={filters.priority}
        search={filters.search}
        sort={filters.sort}
        order={filters.order}
        viewMode={viewMode}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        onViewModeChange={setViewMode}
      />

      {/* Loading state indicator */}
      {isLoading && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading tasks database...</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="glass-card p-6 border-destructive/20 bg-destructive/5 text-destructive rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-semibold text-sm">Failed to connect to the backend server. Please try refreshing again.</p>
        </div>
      )}

      {/* Empty workspace state */}
      {data?.tasks?.length === 0 && !isLoading && !isError && (
        <div className="glass-card text-center py-16 px-6 rounded-2xl border border-border/30 max-w-md mx-auto">
          <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4 text-muted-foreground border border-border/40">
            <ListTodo className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-1">No tasks in view</h2>
          <p className="text-xs text-muted-foreground max-w-[280px] mx-auto mb-6">
            We couldn&apos;t find any tasks matching your filters. Try clearing them or write a new task to get started!
          </p>
          <div className="flex gap-2 justify-center">
            {Object.keys(filters).length > 2 ? (
              <Button variant="outline" size="sm" onClick={handleClear} className="font-medium cursor-pointer">
                Clear Filters
              </Button>
            ) : null}
            <Link href="/tasks/new" className="focus-ring rounded-lg">
              <Button size="sm" className="font-medium cursor-pointer">Create a task</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Grid View rendering */}
      {!isLoading && !isError && data?.tasks && data.tasks.length > 0 && viewMode === 'grid' && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* Board View rendering with HTML5 drag and drop */}
      {!isLoading && !isError && data?.tasks && data.tasks.length > 0 && viewMode === 'board' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch min-h-[500px]">
            {/* TODO column */}
            <div
              role="region"
              aria-label="To Do tasks lane"
              onDragOver={(e) => handleDragOver(e, 'TODO')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'TODO')}
              className={`rounded-2xl p-4 transition-all duration-300 flex flex-col min-h-[400px] border border-transparent ${
                draggedOverCol === 'TODO'
                  ? 'bg-zinc-100/80 dark:bg-zinc-800/60 border-primary/30 shadow-inner'
                  : 'bg-zinc-50/45 dark:bg-zinc-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" />
                  <h3 className="font-bold text-sm text-foreground">To Do</h3>
                </div>
                <Badge variant="secondary" className="font-bold text-xs bg-zinc-100 dark:bg-zinc-800">{todoTasks.length}</Badge>
              </div>
              <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[550px]">
                {todoTasks.map((task: any) => (
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
                {todoTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 border border-dashed border-border/50 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium">Drag tasks here</p>
                  </div>
                )}
              </div>
            </div>

            {/* IN_PROGRESS column */}
            <div
              role="region"
              aria-label="In Progress tasks lane"
              onDragOver={(e) => handleDragOver(e, 'IN_PROGRESS')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
              className={`rounded-2xl p-4 transition-all duration-300 flex flex-col min-h-[400px] border border-transparent ${
                draggedOverCol === 'IN_PROGRESS'
                  ? 'bg-zinc-100/80 dark:bg-zinc-800/60 border-primary/30 shadow-inner'
                  : 'bg-zinc-50/45 dark:bg-zinc-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="font-bold text-sm text-foreground">In Progress</h3>
                </div>
                <Badge variant="secondary" className="font-bold text-xs bg-zinc-100 dark:bg-zinc-800">{inProgressFilteredTasks.length}</Badge>
              </div>
              <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[550px]">
                {inProgressFilteredTasks.map((task: any) => (
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
                {inProgressFilteredTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 border border-dashed border-border/50 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium">Drag tasks here</p>
                  </div>
                )}
              </div>
            </div>

            {/* DONE column */}
            <div
              role="region"
              aria-label="Done tasks lane"
              onDragOver={(e) => handleDragOver(e, 'DONE')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'DONE')}
              className={`rounded-2xl p-4 transition-all duration-300 flex flex-col min-h-[400px] border border-transparent ${
                draggedOverCol === 'DONE'
                  ? 'bg-zinc-100/80 dark:bg-zinc-800/60 border-primary/30 shadow-inner'
                  : 'bg-zinc-50/45 dark:bg-zinc-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-sm text-foreground">Done</h3>
                </div>
                <Badge variant="secondary" className="font-bold text-xs bg-zinc-100 dark:bg-zinc-800">{doneTasks.length}</Badge>
              </div>
              <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[550px]">
                {doneTasks.map((task: any) => (
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
                {doneTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 border border-dashed border-border/50 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium">Drag tasks here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => handleFilterChange('page', String(page))}
          />
        </div>
      )}
    </div>
  );
}
