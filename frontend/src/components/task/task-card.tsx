'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  TODO: 'bg-gray-500',
  IN_PROGRESS: 'bg-blue-500',
  DONE: 'bg-green-500',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-600',
  MEDIUM: 'bg-yellow-600',
  HIGH: 'bg-red-600',
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

export function TaskCard({ id, title, description, status, priority, dueDate, createdAt, onMarkDone, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/tasks/${id}`} className="hover:underline">
              <CardTitle className="text-lg truncate">{title}</CardTitle>
            </Link>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
            )}
          </div>
          <Badge className={statusColors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Badge variant="outline" className={priorityColors[priority] || ''}>
            {priority}
          </Badge>
          {dueDate && (
            <span>Due: {format(new Date(dueDate), 'MMM d, yyyy')}</span>
          )}
          <span className="ml-auto text-xs">Created: {format(new Date(createdAt), 'MMM d')}</span>
        </div>
        <div className="flex gap-2">
          {status !== 'DONE' && onMarkDone && (
            <Button size="sm" variant="outline" onClick={() => onMarkDone(id)}>
              <Check className="w-4 h-4 mr-1" /> Done
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="outline" onClick={() => onDelete(id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
