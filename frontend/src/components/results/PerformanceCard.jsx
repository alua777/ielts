import ResultsPanel from './ResultsPanel';

export default function PerformanceCard({ sectionRows }) {
  return (
    <ResultsPanel title="Performance by Section" className="h-[305px]">
      <div className="space-y-4">
        {sectionRows.map(row => (
          <div key={row.label} className="grid grid-cols-[120px_1fr_42px_58px] items-center gap-3">
            <div>
              <p className="text-[12px] font-bold text-slate-800">{row.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{row.detail}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${row.percent}%` }} />
            </div>
            <p className="text-right text-[12px] font-bold text-slate-900">{row.band.toFixed(1)}</p>
            <p className="text-right text-[11px] text-slate-500">{row.correct}/{row.total}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-[13px] font-bold text-slate-900">Overall graded performance</p>
        <p className="text-[13px] font-bold text-violet-600">
          {sectionRows.reduce((sum, row) => sum + row.correct, 0)} correct
        </p>
      </div>
    </ResultsPanel>
  );
}
