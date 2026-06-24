import { createElement } from 'react';
import DashboardPanel from './DashboardPanel';

export default function StudyTimeCard({ skills, completedCount }) {
  return (
    <DashboardPanel title="Study Time" className="pastel-card-peach h-[170px]">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] font-medium">
        {skills.map(({ label, icon, color }, index) => (
          <div key={label} className="flex min-w-0 items-center gap-2">
            {createElement(icon, { size: 14, className: 'shrink-0', style: { color } })}
            <span className="min-w-0 flex-1 truncate text-slate-500">{label}</span>
            <strong className="shrink-0">{index + 1}h {index * 10 + 20}m</strong>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between pt-2 text-[14px]">
        <strong>Total</strong>
        <strong>{Math.max(1, completedCount * 2)}h 45m</strong>
      </div>
    </DashboardPanel>
  );
}
