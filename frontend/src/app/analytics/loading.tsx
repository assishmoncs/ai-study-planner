export default function AnalyticsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="card h-80 animate-pulse bg-slate-100 dark:bg-slate-800 xl:col-span-2" />
      <div className="card h-80 animate-pulse bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}
