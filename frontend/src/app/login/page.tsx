'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ClipboardList, KeyRound, Mail, AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      setError('');
      await login(data.email, data.password);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-stretch justify-center py-6">
      <div className="w-full max-w-4xl glass-card rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Left Side - Showcase (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-indigo-950 to-zinc-950 p-10 flex-col justify-between relative overflow-hidden text-white border-r border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.65_0.19_275_/_15%)_0%,transparent_50%)]" />
          
          <div className="relative z-10 flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">Rival Task</span>
          </div>

          <div className="relative z-10 space-y-4 my-auto">
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Organize your operations in one beautiful workspace.
            </h2>
            <p className="text-sm text-zinc-300 font-medium leading-relaxed">
              Track deadlines, organize timelines, and collaborate seamlessly using our fast Kanban board views.
            </p>
          </div>

          <div className="relative z-10 text-xs font-semibold text-zinc-400">
            &copy; {new Date().getFullYear()} Rival Task. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center bg-background/40">
          <div className="max-w-sm w-full mx-auto space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Sign In</h1>
              <p className="text-sm text-muted-foreground font-semibold">Enter your credentials to access your workspace</p>
            </div>

            {error && (
              <div
                role="alert"
                className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5 animate-shake"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    placeholder="you@example.com"
                    className="pl-10.5 bg-background/50 border-border/50 focus:border-primary h-11 rounded-xl"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs font-semibold text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    placeholder="••••••••"
                    className="pl-10.5 bg-background/50 border-border/50 focus:border-primary h-11 rounded-xl"
                  />
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="text-xs font-semibold text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground font-semibold pt-2">
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="text-primary hover:underline font-bold focus-ring rounded">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
