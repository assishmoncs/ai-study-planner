'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { BookOpen, ChevronRight, Loader2, LogOut, Moon, Sun } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from './ThemeProvider';
import { NAV_ITEMS, isRouteActive } from './navigation';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/Toaster';

export default function TopBar() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);
  const currentPage =
    NAV_ITEMS.find((item) => isRouteActive(pathname, item.href))?.label ?? 'Workspace';

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* Clear the local session even if the API is unavailable. */
    } finally {
      clearAuth();
      queryClient.clear();
      toast({ title: 'Signed out', description: 'You have been logged out.', variant: 'success' });
      router.push('/login');
    }
  };
  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-slate-200/70 bg-[rgb(var(--background))]/90 px-4 backdrop-blur-xl dark:border-slate-800 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/dashboard" className="flex items-center gap-2.5 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">Study Planner</span>
        </Link>
        <div className="hidden items-center gap-3 text-sm lg:flex">
          <span className="text-slate-500 dark:text-slate-400">Workspace</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium">{currentPage}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn-secondary !h-11 !w-11 !p-0"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="btn-secondary !h-11 !w-11 !p-0"
            aria-label="Logout"
            title="Logout"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </header>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isRouteActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex min-h-14 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 text-[10px] font-medium transition-colors sm:text-xs',
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
