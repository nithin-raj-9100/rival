'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Plus, Pencil, Trash2, Tag, ArrowRight } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  user: { email: string };
}

const actionMeta: Record<string, { icon: React.ReactNode; badgeClass: string }> = {
  CREATED: {
    icon: <Plus className="w-3.5 h-3.5 text-emerald-500" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20',
  },
  UPDATED: {
    icon: <Pencil className="w-3.5 h-3.5 text-indigo-500" />,
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-500/20',
  },
  DELETED: {
    icon: <Trash2 className="w-3.5 h-3.5 text-rose-500" />,
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/20',
  },
};

export function ActivityTimeline({ activities }: { activities: ActivityEntry[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs font-semibold text-muted-foreground">No operations recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/60">
      {activities.map((entry) => {
        const meta = actionMeta[entry.action] || {
          icon: <Clock className="w-3.5 h-3.5 text-zinc-500" />,
          badgeClass: 'bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300 border-zinc-500/20',
        };

        return (
          <div key={entry.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[23.5px] top-1 w-[15px] h-[15px] rounded-full bg-background dark:bg-zinc-950 border-2 border-border/80 group-hover:border-primary transition-colors flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`font-bold text-[10px] uppercase py-0.5 px-2 tracking-wider ${meta.badgeClass}`}>
                  <span className="flex items-center gap-1">
                    {meta.icon}
                    {entry.action}
                  </span>
                </Badge>
                {entry.field && (
                  <span className="text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/30">
                    <Tag className="w-3 h-3 inline mr-1 text-primary/70" />
                    {entry.field}
                  </span>
                )}
              </div>

              {entry.newValue && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/20 max-w-lg flex items-center gap-2 flex-wrap font-medium">
                  {entry.field ? (
                    <>
                      <span className="bg-background px-1.5 py-0.5 rounded border border-border/50 text-[11px] truncate max-w-[150px]">
                        {entry.oldValue || '""'}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span className="bg-background text-foreground font-bold px-1.5 py-0.5 rounded border border-border/50 text-[11px] truncate max-w-[150px]">
                        {entry.newValue}
                      </span>
                    </>
                  ) : (
                    <span className="text-foreground">{entry.newValue}</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 font-semibold">
                <span>{entry.user.email}</span>
                <span>•</span>
                <span>{format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
