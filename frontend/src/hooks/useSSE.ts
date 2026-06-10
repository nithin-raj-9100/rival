'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';

export function useSSE() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const ref = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!token) return;

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/events`;
    const es = new EventSource(`${url}?token=${token}`);
    ref.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'task:updated' || data.type === 'task:created' || data.type === 'task:deleted') {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
        if (data.type === 'activity:new' && data.taskId) {
          queryClient.invalidateQueries({ queryKey: ['activity', data.taskId] });
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [token, queryClient]);
}
