'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, BookOpen, Sparkles, Timer } from 'lucide-react';
import { clsx } from 'clsx';
import { NAV_ITEMS, isRouteActive } from './navigation';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 lg:flex xl:w-64">
      <Link href="/dashboard" className="flex h-20 shrink-0 items-center gap-3 px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-bold tracking-tight">
            Study Planner<span className="text-indigo-500">.</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            A little progress, every day
          </span>
        </span>
      </Link>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Your workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isRouteActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 mb-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-900/50 dark:from-indigo-950/50 dark:to-slate-900">
        <Sparkles className="mb-3 h-5 w-5 text-indigo-500" aria-hidden="true" />
        <p className="text-sm font-semibold">Small steps. Big goals.</p>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Make space for one focused study session today.
        </p>
        <Link
          href="/pomodoro"
          className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300"
        >
          <Timer className="h-3.5 w-3.5" />
          Start focusing
          <ArrowUpRight className="ml-auto h-4 w-4" />
        </Link>
      </div>
      <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-5 dark:border-slate-800">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
          aria-hidden="true"
        >
          {user?.name?.trim().charAt(0).toUpperCase() || 'S'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.name || 'Your workspace'}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {user?.email || 'Keep learning, keep growing'}
          </p>
        </div>
      </div>
    </aside>
  );
}
