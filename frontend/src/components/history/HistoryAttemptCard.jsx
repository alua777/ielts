import { ArrowRight, Clock3 } from 'lucide-react';

const sectionTone = {
  reading: 'bg-emerald-50 text-emerald-700',
  listening: 'bg-amber-50 text-amber-700',
  writing: 'bg-blue-50 text-blue-700',
  speaking: 'bg-violet-50 text-violet-700',
  mock: 'bg-slate-100 text-slate-700',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryAttemptCard({ attempt, onReview }) {
  const label = attempt.section === 'mock' ? 'Full Mock Test' : `${attempt.section[0].toUpperCase()}${attempt.section.slice(1)}`;
  const criteria = Array.isArray(attempt.criteria) ? attempt.criteria : null;
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${sectionTone[attempt.section]}`}>{label}</span>
            <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-semibold capitalize text-slate-500">{attempt.status.replace('_', ' ')}</span>
          </div>
          <h2 className="mt-3 text-[17px] font-bold text-slate-950">{attempt.title}</h2>
          <p className="mt-1 text-[13px] text-slate-500">{formatDate(attempt.created_at)}</p>
        </div>
        <div className="flex items-center gap-5 sm:text-right">
          {attempt.score_total > 0 && <div><p className="text-[11px] font-semibold text-slate-400">Score</p><p className="mt-1 text-[17px] font-bold text-slate-900">{attempt.score_raw}/{attempt.score_total}</p></div>}
          <div><p className="text-[11px] font-semibold text-slate-400">Estimated Band</p><p className="mt-1 text-[24px] font-extrabold text-violet-700">{attempt.estimated_band == null ? '--' : Number(attempt.estimated_band).toFixed(1)}</p></div>
        </div>
      </div>

      {criteria?.length > 0 && (
        <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {criteria.map(item => (
            <div key={item.label} className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-[12px]">
              <span className="truncate text-slate-500">{item.label}</span>
              <strong className="text-slate-900">{Number(item.band).toFixed(1)}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-[12px] font-medium text-slate-500"><Clock3 size={15} /> {attempt.duration_minutes ? `${attempt.duration_minutes} min` : 'Duration not recorded'}</span>
        <button type="button" onClick={onReview} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-[13px] font-bold text-white hover:bg-violet-700">
          {attempt.section === 'writing' || attempt.section === 'speaking' ? 'View Feedback' : 'Review'} <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
