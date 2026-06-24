import { createElement } from 'react';
import { ChevronRight, FileText, Headphones, PenLine, Sparkles } from 'lucide-react';
import DashboardPanel from './DashboardPanel';

const AREAS = [
  ['True / False / Not Given', FileText, 'text-rose-500', 'bg-rose-50'],
  ['Task 2 Coherence', PenLine, 'text-orange-500', 'bg-orange-50'],
  ['Linking Words', Sparkles, 'text-amber-500', 'bg-amber-50'],
  ['Map Questions', Headphones, 'text-emerald-500', 'bg-emerald-50'],
];

export default function WeakAreasCard() {
  return (
    <DashboardPanel title="Weak Areas" className="pastel-card-peach h-[232px]">
      <div className="space-y-1.5">
        {AREAS.map(([label, icon, color, bg]) => (
          <div key={label} className="flex h-8 min-w-0 items-center gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color} ${bg}`}>
              {createElement(icon, { size: 14 })}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] text-slate-700">{label}</span>
            <button className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 text-[13px] font-semibold text-violet-600">
              Practice
            </button>
          </div>
        ))}
      </div>
      <button className="mt-2 flex items-center gap-1 text-[14px] font-medium text-violet-600">
        View all weak areas <ChevronRight size={14} />
      </button>
    </DashboardPanel>
  );
}
