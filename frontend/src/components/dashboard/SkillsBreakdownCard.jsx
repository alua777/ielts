import { createElement } from 'react';
import DashboardPanel from './DashboardPanel';

export default function SkillsBreakdownCard({ skills }) {
  return (
    <DashboardPanel
      title="Skills Breakdown"
      className="h-[270px]"
      action={<button className="whitespace-nowrap text-[14px] font-medium text-violet-600">View details</button>}
    >
      <div className="space-y-3">
        {skills.map(({ label, icon, color, bg, value }) => (
          <div key={label} className="grid min-w-0 grid-cols-[38px_76px_minmax(60px,1fr)_54px] items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color, background: bg }}>
              {createElement(icon, { size: 18 })}
            </span>
            <span className="truncate text-[14px] text-slate-700">{label}</span>
            <span className="h-1.5 min-w-0 rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full"
                style={{ width: `${(value / 9) * 100}%`, background: color }}
              />
            </span>
            <strong className="text-right text-[24px] font-bold leading-none text-slate-950">
              {value ? value.toFixed(1) : '-'}
            </strong>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
