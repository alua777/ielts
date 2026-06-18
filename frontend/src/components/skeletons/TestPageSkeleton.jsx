import Skeleton from '../ui/Skeleton';

export default function TestPageSkeleton() {
  return (
    <div className="min-h-dvh bg-slate-50 p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Skeleton className="h-[70vh]" />
          <Skeleton className="h-[70vh]" />
        </div>
      </div>
    </div>
  );
}
