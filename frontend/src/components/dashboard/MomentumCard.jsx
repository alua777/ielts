import { createElement } from 'react';
import { Award, Clock3, Flame } from 'lucide-react';
import DashboardPanel from './DashboardPanel';

const ITEMS = [
  { key: 'streak', label: 'Day streak', icon: Flame, color: 'text-orange-500' },
  { key: 'completed', label: 'Tests completed', icon: Award, color: 'text-violet-500' },
  { key: 'weekly', label: 'This week', icon: Clock3, color: 'text-blue-500' },
];

export default function MomentumCard({ streak, completed, weekly }) {
  const values = { streak, completed, weekly };
  return (
    <DashboardPanel title="Momentum" className="h-[170px]">
      <div className="flex justify-between px-5">
        {ITEMS.map(({ key, label, icon, color }) => (
          <div key={key} className="min-w-0">
            
            <p className="mt-2 text-[48px] font-extrabold leading-none text-slate-950">{values[key]}</p>
            <div className="flex items-center gap-1">
              {createElement(icon, { size: 18, className: color })}
              <p className="mt-2 truncate text-[13px] font-medium text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
