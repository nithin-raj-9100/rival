'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from 'next-themes';
import { Moon, Sun, ClipboardList, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <Link href="/tasks" className="flex items-center gap-2 font-semibold">
          <ClipboardList className="w-5 h-5" />
          <span>Task Manager</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link href="/admin/tasks">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
              <Link href="/tasks/new">
                <Button size="sm">New Task</Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
