import LoadingState from '@/components/ui/LoadingState';
import Skeleton from '@/components/ui/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton width="40%" height={32} />
        <Skeleton width="60%" />
      </div>
      <LoadingState variant="chart" count={1} />
    </div>
  );
}
