export default function TasksLoading() {
  return (
    <div className="space-y-4">
      <div className="card h-12 animate-pulse bg-slate-100 dark:bg-slate-800" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="card h-16 animate-pulse bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}
