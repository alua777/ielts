import Skeleton from '../ui/Skeleton';

export default function HistorySkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-3"><Skeleton className="h-8 w-44" /><Skeleton className="h-4 w-80 max-w-full" /></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-24" />)}
      </div>
      <Skeleton className="h-28 w-full" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-36 w-full" />)}
      </div>
    </div>
  );
}
