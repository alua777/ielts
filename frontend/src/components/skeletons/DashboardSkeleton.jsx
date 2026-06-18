import Skeleton from '../ui/Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-3 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(item => <Skeleton key={item} className="h-52" />)}
      </div>
    </div>
  );
}
