'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from 'next-themes';
import { Moon, Sun, ClipboardList, LogOut, ShieldAlert } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="glass-navbar">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-16">
        <Link
          href="/tasks"
          className="flex items-center gap-2.5 font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:opacity-90 transition-opacity focus-ring rounded"
          aria-label="Task Manager Dashboard"
        >
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary border border-primary/20">
            <ClipboardList className="w-5 h-5" />
          </div>
          <span className="tracking-tight text-foreground">Rival Task</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:bg-accent/50 focus-ring rounded-lg cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Sun className="w-4.5 h-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="w-4.5 h-4.5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link href="/admin/tasks" className="focus-ring rounded">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-red-500/10 hover:text-red-500 text-muted-foreground border border-transparent hover:border-red-500/20">
                    <ShieldAlert className="w-3.5 h-3.5" /> Admin
                  </Button>
                </Link>
              )}
              <Link href="/tasks/new" className="focus-ring rounded hidden sm:inline-block">
                <Button size="sm" className="font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer">
                  New Task
                </Button>
              </Link>
              <span className="text-xs font-medium text-muted-foreground bg-muted/65 px-2.5 py-1.5 rounded-full max-w-[150px] truncate hidden md:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="hover:bg-destructive/10 hover:text-destructive focus-ring rounded-lg cursor-pointer"
                aria-label="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="focus-ring rounded">
                <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="focus-ring rounded">
                <Button size="sm" className="font-semibold shadow-md shadow-primary/20 cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
