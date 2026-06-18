import { CheckCircle2 } from 'lucide-react';

const CRITERIA = [
  'Task Achievement',
  'Coherence and Cohesion',
  'Grammar',
  'Lexical Resource / Vocabulary',
];

export default function AssessmentCriteria({ className = '' }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <p className="mb-3 text-[11px] font-bold uppercase text-slate-500">Assessment Criteria</p>
      <div className="grid grid-cols-2 gap-2">
        {CRITERIA.map(criterion => (
          <div key={criterion} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2">
            <CheckCircle2 size={14} className="shrink-0 text-violet-600" />
            <p className="text-[12px] font-semibold text-slate-700">{criterion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
