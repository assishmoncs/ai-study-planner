import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variants = {
    primary: 'bg-indigo-600 dark:bg-indigo-500',
    success: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    danger: 'bg-rose-500 dark:bg-rose-400',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden', sizes[size])}>
        <div
          className={clsx('h-full transition-all duration-500 ease-out rounded-full', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
