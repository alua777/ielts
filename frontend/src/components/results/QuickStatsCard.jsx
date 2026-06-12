import { createElement } from 'react';
import { ArrowRight, Clock3, RefreshCw, Target, Trophy } from 'lucide-react';
import ResultsPanel from './ResultsPanel';

function Stat({ icon: Icon, label, value, positive }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600">
        {createElement(Icon, { size: 15 })}
      </span>
      <p className="flex-1 text-[11px] font-medium text-slate-600">{label}</p>
      <p className={`text-[11px] font-bold ${positive ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export default function QuickStatsCard({ averageTime, attemptsCount, improvement, onStudyPlan }) {
  return (
    <ResultsPanel title="Quick Stats" className="h-[305px]">
      <div className="space-y-3">
        <Stat icon={Clock3} label="Average time per question" value={averageTime} />
        <Stat icon={Trophy} label="Longest correct streak" value="12" />
        <Stat icon={RefreshCw} label="Re-attempts" value={String(Math.max(0, attemptsCount - 1))} />
        <Stat icon={Target} label="Score improvement" value={`${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)} band`} positive />
      </div>
      <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-[12px] font-bold text-slate-900">Next Step for You</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-600">Practice Writing Task 2 and Matching Headings before your next mock test.</p>
        <button
          type="button"
          onClick={onStudyPlan}
          className="mt-3 flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-white text-[11px] font-bold text-violet-700"
        >
          Go to Study Plan <ArrowRight size={13} />
        </button>
      </div>
    </ResultsPanel>
  );
}
