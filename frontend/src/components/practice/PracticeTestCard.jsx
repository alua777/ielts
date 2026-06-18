import { ArrowRight, Clock3, Gauge, RotateCcw } from 'lucide-react';

const difficultyClass = {
  Beginner: 'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-rose-50 text-rose-700',
};

export default function PracticeTestCard({ test, onOpen }) {
  return (
    <article className="flex min-h-64 flex-col border border-slate-200 bg-white p-5 shadow-sm" style={{ borderRadius: 8 }}>
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-md px-2 py-1 text-[12px] font-semibold ${difficultyClass[test.difficulty]}`}>
          {test.difficulty}
        </span>
        {test.latest_band != null && (
          <span className="text-[13px] font-bold text-violet-700">Band {Number(test.latest_band).toFixed(1)}</span>
        )}
      </div>
      <h2 className="mt-4 text-[17px] font-bold leading-6 text-slate-950">{test.title}</h2>
      <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-slate-500">{test.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5"><Clock3 size={14} /> {test.duration_minutes} min</span>
        <span className="flex items-center gap-1.5"><Gauge size={14} /> {test.question_types?.[0]}</span>
      </div>
      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onOpen}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-[14px] font-semibold text-white hover:bg-violet-700"
        >
          {test.status === 'completed' ? <RotateCcw size={16} /> : <ArrowRight size={16} />}
          {test.status === 'completed' ? 'Practice again' : 'Start practice'}
        </button>
      </div>
    </article>
  );
}
