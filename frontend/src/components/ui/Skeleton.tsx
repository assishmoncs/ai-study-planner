import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-800';

  const variants = {
    text: 'rounded h-4 w-full my-1',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={clsx(baseClasses, variants[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

export default Skeleton;
