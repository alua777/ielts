import { ArrowRight, CircleCheck, CircleX } from 'lucide-react';
import ResultsPanel from './ResultsPanel';

export default function StrengthsCard({ accuracy }) {
  const strengths = accuracy >= 60
    ? ['Listening - Note Completion', 'Reading - True / False / Not Given', 'Speaking - Fluency']
    : ['Speaking - Completion', 'Reading - Focus', 'Listening - Persistence'];
  const weaknesses = ['Writing - Task Achievement', 'Reading - Matching Headings', 'Writing - Coherence & Cohesion'];

  return (
    <ResultsPanel title="Strengths & Weaknesses" className="h-[292px]">
      <p className="text-[11px] font-bold text-emerald-600">Strengths</p>
      <div className="mt-3 space-y-2">
        {strengths.map(item => (
          <div key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
            <CircleCheck size={14} className="text-emerald-500" /> {item}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] font-bold text-red-500">Weaknesses</p>
      <div className="mt-3 space-y-2">
        {weaknesses.map(item => (
          <div key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
            <CircleX size={14} className="text-red-400" /> {item}
          </div>
        ))}
      </div>
      {/* <button className="mt-4 flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-violet-100 bg-violet-50 text-[12px] font-bold text-violet-700">
        View Detailed Analysis <ArrowRight size={14} />
      </button> */}
    </ResultsPanel>
  );
}
