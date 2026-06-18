import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'New items will appear here when they become available.',
  action,
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <Inbox size={22} />
      </span>
      <h2 className="mt-4 text-[18px] font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-slate-500">{message}</p>
      {action}
    </div>
  );
}
