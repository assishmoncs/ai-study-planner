export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-28 animate-pulse bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card h-80 animate-pulse bg-slate-100 dark:bg-slate-800 xl:col-span-2" />
        <div className="card h-80 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="card h-40 animate-pulse bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}
