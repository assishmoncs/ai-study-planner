import LoadingState from '@/components/ui/LoadingState';
import Skeleton from '@/components/ui/Skeleton';
export default function DashboardLoading() {
  return (
    <div className="space-y-7">
      <Skeleton width="50%" height={40} />
      <Skeleton height={170} variant="rectangular" />
      <LoadingState variant="stats" count={4} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LoadingState />
        </div>
        <LoadingState />
      </div>
    </div>
  );
}
