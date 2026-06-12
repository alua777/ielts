import { createElement } from 'react';
import { CalendarDays, CheckCircle2, Clock3, FileText, Trophy } from 'lucide-react';
import ResultsPanel from './ResultsPanel';

function MetaItem({ icon: Icon, label, value, detail }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
        {createElement(Icon, { size: 17 })}
      </span>
      <div>
        <p className="text-[11px] font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-[13px] font-bold text-slate-900">{value}</p>
        {detail && <p className="mt-0.5 text-[11px] text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

export default function ResultsOverview({
  band,
  target,
  date,
  time,
  correct,
  total,
}) {
  const gap = Math.max(0, target - band);
  return (
    <ResultsPanel className="grid grid-cols-[1.05fr_1.15fr_0.9fr] items-center gap-7">
      <div>
        <p className="text-[15px] font-bold text-slate-950">Overall Band Score</p>
        <div className="mt-3 flex items-end gap-7">
          <div>
            <p className="text-[68px] font-extrabold leading-none text-violet-600">{band.toFixed(1)}</p>
            <p className="mt-2 text-[13px] font-semibold text-slate-600">
              {band >= 7 ? 'Good User' : band >= 6 ? 'Competent User' : 'Developing User'}
            </p>
          </div>
          <div className="min-w-44 pb-1">
            <p className="text-[13px] font-semibold text-slate-600">
              Your goal: <strong className="text-slate-950">{target.toFixed(1)}</strong>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.min((band / target) * 100, 100)}%` }} />
            </div>
            <p className="mt-3 text-[12px] text-slate-500">
              You're <strong className="text-violet-600">{gap.toFixed(1)}</strong> bands away
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-x border-slate-200 px-7">
        <MetaItem icon={CalendarDays} label="Test Date" value={date} />
        <MetaItem icon={FileText} label="Test Type" value="Academic" />
        <MetaItem icon={Clock3} label="Total Time" value={time} />
        <MetaItem icon={CheckCircle2} label="Answers Correct" value={`${correct} / ${total}`} />
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-violet-100 bg-violet-50/70 p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white text-amber-500 shadow-sm">
          <Trophy size={29} />
        </span>
        <div>
          <p className="text-[14px] font-bold text-slate-950">Great effort!</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-600">
            You completed the full mock test. Review the analysis below to plan your next session.
          </p>
        </div>
      </div>
    </ResultsPanel>
  );
}
