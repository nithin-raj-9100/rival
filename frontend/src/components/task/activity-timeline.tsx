'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Plus, Pencil, Trash2, Tag } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  user: { email: string };
}

const actionIcons: Record<string, React.ReactNode> = {
  CREATED: <Plus className="w-4 h-4 text-green-500" />,
  UPDATED: <Pencil className="w-4 h-4 text-blue-500" />,
  DELETED: <Trash2 className="w-4 h-4 text-red-500" />,
};

export function ActivityTimeline({ activities }: { activities: ActivityEntry[] }) {
  if (activities.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((entry) => (
        <div key={entry.id} className="flex gap-3 items-start">
          <div className="mt-0.5">{actionIcons[entry.action] || <Clock className="w-4 h-4" />}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {entry.action}
              </Badge>
              {entry.field && (
                <span className="text-sm">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {entry.field}
                </span>
              )}
            </div>
            {entry.newValue && (
              <p className="text-sm text-muted-foreground mt-1">
                {entry.field ? `${entry.oldValue || '""'} → ${entry.newValue}` : entry.newValue}
              </p>
            )}
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>{entry.user.email}</span>
              <span>{format(new Date(entry.createdAt), 'MMM d, h:mm a')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
