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
import { Search, X } from 'lucide-react';

interface FiltersBarProps {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
  order?: string;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function FiltersBar({ status, priority, search, sort, order, onFilterChange, onClear }: FiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={status || 'all'} onValueChange={(v) => onFilterChange('status', v === 'all' ? '' : (v || ''))}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority || 'all'} onValueChange={(v) => onFilterChange('priority', v === 'all' ? '' : (v || ''))}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sort || 'createdAt'} onValueChange={(v) => onFilterChange('sort', v || 'createdAt')}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created</SelectItem>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFilterChange('order', order === 'asc' ? 'desc' : 'asc')}
      >
        {order === 'asc' ? '↑' : '↓'}
      </Button>

      {(status || priority || search) && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
