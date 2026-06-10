'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Grid, Kanban, ArrowUpDown } from 'lucide-react';

interface FiltersBarProps {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
  order?: string;
  viewMode?: 'grid' | 'board';
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  onViewModeChange?: (mode: 'grid' | 'board') => void;
}

export function FiltersBar({
  status,
  priority,
  search,
  sort,
  order,
  viewMode = 'grid',
  onFilterChange,
  onClear,
  onViewModeChange,
}: FiltersBarProps) {
  return (
    <section
      aria-label="Filters and Sorting Controls"
      className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between"
    >
      <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Field */}
        <div className="relative w-full sm:max-w-xs sm:flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search tasks by title or description"
            placeholder="Search tasks..."
            value={search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9 bg-background border-border shadow-sm focus:border-primary focus:ring-primary/20 h-10 w-full rounded-lg transition-all"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex flex-col">
            <span id="status-filter-label" className="sr-only">Filter by Status</span>
            <Select
              value={status || 'all'}
              onValueChange={(v) => onFilterChange('status', v === 'all' ? '' : (v || ''))}
            >
              <SelectTrigger aria-labelledby="status-filter-label" className="w-36 shrink-0 bg-background border-border h-10 rounded-lg cursor-pointer text-xs font-bold text-foreground hover:bg-accent/50 shadow-sm transition-all focus-ring">
                <SelectValue placeholder="Status">
                  {(value) => {
                    const labels: Record<string, string> = {
                      all: 'All Status',
                      TODO: 'To Do',
                      IN_PROGRESS: 'In Progress',
                      DONE: 'Done',
                    };
                    return labels[value] || value || 'Status';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border/80 shadow-lg rounded-lg min-w-[144px]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <span id="priority-filter-label" className="sr-only">Filter by Priority</span>
            <Select
              value={priority || 'all'}
              onValueChange={(v) => onFilterChange('priority', v === 'all' ? '' : (v || ''))}
            >
              <SelectTrigger aria-labelledby="priority-filter-label" className="w-36 shrink-0 bg-background border-border h-10 rounded-lg cursor-pointer text-xs font-bold text-foreground hover:bg-accent/50 shadow-sm transition-all focus-ring">
                <SelectValue placeholder="Priority">
                  {(value) => {
                    const labels: Record<string, string> = {
                      all: 'All Priority',
                      LOW: 'Low',
                      MEDIUM: 'Medium',
                      HIGH: 'High',
                    };
                    return labels[value] || value || 'Priority';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border/80 shadow-lg rounded-lg min-w-[144px]">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <span id="sort-by-label" className="sr-only">Sort Tasks By</span>
            <Select
              value={sort || 'createdAt'}
              onValueChange={(v) => onFilterChange('sort', v || 'createdAt')}
            >
              <SelectTrigger aria-labelledby="sort-by-label" className="w-36 shrink-0 bg-background border-border h-10 rounded-lg cursor-pointer text-xs font-bold text-foreground hover:bg-accent/50 shadow-sm transition-all focus-ring">
                <SelectValue placeholder="Sort by">
                  {(value) => {
                    const labels: Record<string, string> = {
                      createdAt: 'Created Date',
                      dueDate: 'Due Date',
                      priority: 'Priority',
                    };
                    return labels[value] || value || 'Sort by';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border/80 shadow-lg rounded-lg min-w-[144px]">
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onFilterChange('order', order === 'asc' ? 'desc' : 'asc')}
            className="h-10 w-10 bg-background border-border shadow-sm hover:bg-accent/50 text-foreground focus-ring rounded-lg cursor-pointer transition-all duration-200"
            aria-label={order === 'asc' ? 'Change sorting to descending' : 'Change sorting to ascending'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          {(status || priority || search) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive focus-ring rounded-lg cursor-pointer transition-all duration-200 shrink-0 animate-in fade-in zoom-in-95 duration-150"
              aria-label="Clear active filters"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Grid vs Board View Toggles */}
      {onViewModeChange && (
        <div
          role="radiogroup"
          aria-label="Select Task View"
          className="flex items-center bg-muted/70 p-1 rounded-xl border border-border/30 w-fit self-end md:self-auto h-10 gap-1"
        >
          <Button
            role="radio"
            aria-checked={viewMode === 'grid'}
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`gap-1.5 h-8 font-semibold rounded-lg text-xs cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-background shadow-sm border border-border/30 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Grid
          </Button>
          <Button
            role="radio"
            aria-checked={viewMode === 'board'}
            variant={viewMode === 'board' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('board')}
            className={`gap-1.5 h-8 font-semibold rounded-lg text-xs cursor-pointer ${
              viewMode === 'board'
                ? 'bg-background shadow-sm border border-border/30 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Board
          </Button>
        </div>
      )}
    </section>
  );
}
