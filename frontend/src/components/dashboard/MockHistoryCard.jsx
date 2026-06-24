import DashboardPanel from './DashboardPanel';

export default function MockHistoryCard({ completed, onViewAll }) {
  const rows = completed.slice(0, 3).length ? completed.slice(0, 3) : [{ id: 'empty', band_score: 0 }];

  return (
    <DashboardPanel
      title="Mock Test History"
      className="pastel-card-mint h-[170px]"
      action={<button onClick={onViewAll} className="text-[12px] font-medium text-violet-600">View all</button>}
    >
      <div className="space-y-1">
        {rows.map((attempt, index) => (
          <div
            key={attempt.id || index}
            className="grid grid-cols-[minmax(0,1fr)_42px_64px] items-center border-b border-slate-100 py-2 text-[12px] font-medium last:border-0"
          >
            <span className="truncate font-semibold text-slate-700">Mock Test #{Math.max(1, completed.length - index)}</span>
            <strong>{Number(attempt.band_score || 0).toFixed(1)}</strong>
            <span className="text-right text-slate-400">
              {attempt.completed_at
                ? new Date(attempt.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : '-'}
            </span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
