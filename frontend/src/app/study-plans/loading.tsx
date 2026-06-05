export default function StudyPlansLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="card h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}
