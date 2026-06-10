'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check, Calendar, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const statusBadges: Record<string, { label: string; class: string }> = {
  TODO: { label: 'To Do', class: 'bg-secondary text-secondary-foreground border-border/80' },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30' },
  DONE: { label: 'Done', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' },
};

const priorityClasses: Record<string, string> = {
  LOW: 'neon-border-low',
  MEDIUM: 'neon-border-medium',
  HIGH: 'neon-border-high',
};

interface TaskCardProps {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  onMarkDone?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  createdAt,
  onMarkDone,
  onDelete,
}: TaskCardProps) {
  const isCompleted = status === 'DONE';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={`glass-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-grab active:cursor-grabbing glow-hover select-none group relative overflow-hidden ${
        priorityClasses[priority] || ''
      } ${isCompleted ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      <div className="p-5 flex flex-col justify-between h-full min-h-[160px] gap-4">
        {/* Top Header Row */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/tasks/${id}`}
                className="hover:underline focus-ring rounded inline-block"
                aria-label={`View details of task: ${title}`}
              >
                <h3 className={`text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}>
                  {title}
                </h3>
              </Link>
            </div>
            
            {/* Status Badge */}
            <Badge variant="outline" className={`font-bold shrink-0 uppercase tracking-wider text-[9px] py-0.5 px-2 ${statusBadges[status]?.class}`}>
              {statusBadges[status]?.label || status}
            </Badge>
          </div>

          {description && (
            <p className={`text-xs leading-relaxed line-clamp-2 mt-2 font-medium ${
              isCompleted ? 'text-muted-foreground/60' : 'text-foreground/80 dark:text-foreground/75'
            }`}>
              {description}
            </p>
          )}
        </div>

        {/* Bottom Info and Action Row */}
        <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/90 font-semibold">
            {dueDate && (
              <span className="flex items-center gap-1.5" aria-label={`Due date: ${format(new Date(dueDate), 'MMM d, yyyy')}`}>
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                <span>{format(new Date(dueDate), 'MMM d, yyyy')}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5" aria-label={`Created on: ${format(new Date(createdAt), 'MMM d')}`}>
              <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>{format(new Date(createdAt), 'MMM d')}</span>
            </span>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            <Link href={`/tasks/${id}`} className="focus-ring rounded" aria-label="View task details">
              <Button size="icon-sm" variant="ghost" className="rounded-md hover:bg-accent cursor-pointer">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </Link>
            
            {!isCompleted && onMarkDone && (
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onMarkDone(id)}
                className="rounded-md border-border/85 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600 focus-ring cursor-pointer animate-check"
                aria-label={`Mark task "${title}" as done`}
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
            )}

            {onDelete && (
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onDelete(id)}
                className="rounded-md border-border/85 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-ring cursor-pointer"
                aria-label={`Delete task "${title}"`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
