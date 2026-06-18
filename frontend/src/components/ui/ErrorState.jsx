import { RefreshCw, TriangleAlert } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this page. Please try again.',
  onRetry,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'min-h-[55vh] py-16'}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <TriangleAlert size={22} />
      </span>
      <h2 className="mt-4 text-[18px] font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-slate-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-[14px] font-semibold text-white hover:bg-violet-700"
        >
          <RefreshCw size={16} /> Try again
        </button>
      )}
    </div>
  );
}
