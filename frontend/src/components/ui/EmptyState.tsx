import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-500 dark:border-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
