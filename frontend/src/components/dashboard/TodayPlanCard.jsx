import { Check, ChevronRight, Play } from 'lucide-react';
import DashboardPanel from './DashboardPanel';

const TASKS = [
  ['Vocabulary Review', '15 min', true],
  ['Reading Passage', '20 min', false],
  ['Writing Task 2', '40 min', false],
  ['Speaking Part 2', '10 min', false],
];

export default function TodayPlanCard({ weeklyDone, onContinue }) {
  return (
    <DashboardPanel
      title="Today's Plan"
      className="pastel-card-blue h-[270px]"
      action={
        <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-semibold text-blue-600">
          {Math.min(weeklyDone, 3)}/3 completed
        </span>
      }
    >
      <div className="space-y-1">
        {TASKS.map(([label, time, done]) => (
          <div key={label} className="flex h-9 min-w-0 items-center gap-3 rounded-lg px-2 hover:bg-slate-50">
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
              done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
            }`}>
              {done && <Check size={11} strokeWidth={2.6} />}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-slate-700">{label}</span>
            <span className="shrink-0 text-[13px] font-medium text-slate-400">{time}</span>
            {!done && <Play size={14} className="shrink-0 text-violet-500" />}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[15px] font-semibold text-white hover:bg-violet-700"
      >
        Continue Studying <ChevronRight size={16} />
      </button>
    </DashboardPanel>
  );
}
