import Skeleton from '../ui/Skeleton';

export default function ResultsSkeleton() {
  return (
    <div className="min-h-dvh bg-slate-50 p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-44 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map(item => <Skeleton key={item} className="h-64" />)}
        </div>
      </div>
    </div>
  );
}
