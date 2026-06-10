'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

interface TaskQuery {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export function useTasks(query: TaskQuery = {}, options?: { enabled?: boolean }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', user?.id, query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.status) params.set('status', query.status);
      if (query.priority) params.set('priority', query.priority);
      if (query.search) params.set('search', query.search);
      if (query.sort) params.set('sort', query.sort);
      if (query.order) params.set('order', query.order);
      if (query.page) params.set('page', String(query.page));
      if (query.limit) params.set('limit', String(query.limit));
      const res = await api.get(`/tasks?${params.toString()}`);
      return res.data;
    },
    enabled: options?.enabled !== false && !!user,
  });
}

export function useTask(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', user?.id, id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/tasks', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast.success('Task created');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await api.patch(`/tasks/${id}`, data);
      return res.data;
    },
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
      const previousTasks = queryClient.getQueryData(['tasks', user?.id]);
      const previousTask = queryClient.getQueryData(['tasks', user?.id, id]);

      queryClient.setQueryData(['tasks', user?.id, id], (old: any) => old ? { ...old, ...data } : old);
      queryClient.setQueriesData({ queryKey: ['tasks', user?.id], exact: false }, (old: any) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: any) => t.id === id ? { ...t, ...data } : t),
        };
      });

      return { previousTasks, previousTask };
    },
    onError: (err: any, { id }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', user?.id, id], context.previousTask);
      }
      toast.error(err.response?.data?.error?.message || 'Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
      const previous = queryClient.getQueryData(['tasks', user?.id]);

      queryClient.setQueriesData({ queryKey: ['tasks', user?.id], exact: false }, (old: any) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: any) => t.id !== id),
          total: (old.total || 1) - 1,
        };
      });

      return { previous };
    },
    onError: (err: any, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks', user?.id], context.previous);
      }
      toast.error(err.response?.data?.error?.message || 'Failed to delete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
    onSuccess: () => {
      toast.success('Task deleted');
    },
  });
}

export function useAdminTasks(query: TaskQuery = {}, options?: { enabled?: boolean }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-tasks', user?.id, query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.status) params.set('status', query.status);
      if (query.priority) params.set('priority', query.priority);
      if (query.search) params.set('search', query.search);
      if (query.sort) params.set('sort', query.sort);
      if (query.order) params.set('order', query.order);
      if (query.page) params.set('page', String(query.page));
      if (query.limit) params.set('limit', String(query.limit));
      const res = await api.get(`/admin/tasks?${params.toString()}`);
      return res.data;
    },
    enabled: options?.enabled !== false && !!user,
  });
}

export function useActivityLog(taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['activity', user?.id, taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/activity`);
      return res.data;
    },
    enabled: !!taskId && !!user,
  });
}

export function useAttachments(taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['attachments', user?.id, taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/attachments`);
      return res.data;
    },
    enabled: !!taskId && !!user,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', user?.id, taskId] });
      toast.success('File uploaded');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Upload failed');
    },
  });
}
