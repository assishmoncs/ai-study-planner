import { AlertCircle, RefreshCw } from 'lucide-react';

export default function QueryError({
  onRetry,
  title = 'We couldn’t load this section',
}: {
  onRetry: () => void;
  title?: string;
}) {
  return (
    <div
      className="card flex flex-col items-center justify-center gap-3 py-12 text-center"
      role="alert"
    >
      <div className="rounded-2xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        Check your connection and give it another try.
      </p>
      <button type="button" className="btn-secondary mt-1" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
