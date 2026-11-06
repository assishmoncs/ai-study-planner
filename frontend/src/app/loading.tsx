import { BookOpen } from 'lucide-react';
export default function GlobalLoading() {
  return (
    <div role="status" className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
        <BookOpen className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">Getting things ready…</p>
    </div>
  );
}
