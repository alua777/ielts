import Skeleton from '../ui/Skeleton';

export default function PracticeListSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-28" />)}
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(item => <Skeleton key={item} className="h-60" />)}
      </div>
    </div>
  );
}
