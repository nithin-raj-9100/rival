import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'Full-stack task management application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20`}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus-ring font-medium"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="container mx-auto px-4 py-8 max-w-5xl focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground mt-auto">
            <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>&copy; {new Date().getFullYear()} Task Manager. All rights reserved.</p>
              <nav aria-label="Footer Navigation" className="flex gap-4">
                <span className="hover:text-foreground transition-colors cursor-default">Privacy</span>
                <span className="hover:text-foreground transition-colors cursor-default">Terms</span>
                <span className="hover:text-foreground transition-colors cursor-default">Help</span>
              </nav>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
