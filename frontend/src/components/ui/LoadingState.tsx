import Skeleton from './Skeleton';

export default function LoadingState({
  variant = 'chart',
  count = 3,
}: {
  variant?: 'chart' | 'tasks' | 'plans' | 'stats';
  count?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={
        variant === 'plans'
          ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
          : variant === 'stats'
            ? 'grid grid-cols-2 gap-4 xl:grid-cols-4'
            : 'space-y-3'
      }
    >
      <span className="sr-only">Loading content…</span>
      {Array.from({ length: variant === 'chart' ? 1 : count }, (_, index) => (
        <div key={index} className="card" aria-hidden="true">
          <Skeleton width="40%" height={14} />
          {variant === 'chart' ? (
            <div className="mt-8 flex h-60 items-end gap-3 border-b border-slate-200 pb-2 dark:border-slate-700">
              {[35, 60, 45, 80, 65, 90, 75].map((height, i) => (
                <Skeleton key={i} variant="rectangular" height={`${height}%`} className="flex-1" />
              ))}
            </div>
          ) : (
            <Skeleton
              width={variant === 'stats' ? '55%' : '80%'}
              height={variant === 'plans' ? 100 : 24}
              className="mt-4"
            />
          )}
        </div>
      ))}
    </div>
  );
}
