'use client';

export default function PomodoroError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Could not load Pomodoro timer</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error.message}</p>
      <button type="button" className="btn-primary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
