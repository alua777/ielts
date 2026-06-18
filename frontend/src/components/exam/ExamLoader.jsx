import TestPageSkeleton from '../skeletons/TestPageSkeleton';
import ErrorState from '../ui/ErrorState';

export function ExamLoader({ message = 'Loading...' }) {
  return <div aria-label={message}><TestPageSkeleton /></div>;
}

export function ExamError({ message = 'Something went wrong.' }) {
  return <ErrorState message={message} onRetry={() => window.location.reload()} />;
}
