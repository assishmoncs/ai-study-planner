export default function PomodoroLoading() {
  return (
    <div className="space-y-6">
      <div className="h-14 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card space-y-6 animate-pulse">
          <div className="mx-auto h-72 w-72 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mx-auto h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="card space-y-4 animate-pulse">
          <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
