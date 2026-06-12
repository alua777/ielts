import DashboardPanel from './DashboardPanel';
import { clampBand } from './dashboardConfig';

function TrendChart({ values }) {
  const points = values.length ? values : [5.6, 5.8, 5.5, 6.1, 6.3, 5.9, 6, 5.8, 6.2, 6.5];
  const width = 330;
  const height = 112;
  const min = 4.5;
  const max = 9;
  const coords = points.map((value, index) => {
    const x = (index / Math.max(1, points.length - 1)) * width;
    const y = height - ((clampBand(value) - min) / (max - min)) * height;
    return [x, Math.max(6, Math.min(height - 6, y))];
  });
  const path = coords.map(([x, y], index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');

  return (
    <div className="relative h-[155px]">
      <div className="absolute inset-x-0 top-1 flex h-[108px] flex-col justify-between">
        {[7, 6.5, 6, 5.5].map(value => <div key={value} className="border-t border-dashed border-slate-200" />)}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="relative h-[116px] w-full overflow-visible">
        <path d={path} fill="none" stroke="#6d4aff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index === coords.length - 1 ? 5 : 3} fill="#6d4aff" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[12px] font-medium text-slate-400">
        <span>4 weeks ago</span><span>3 weeks</span><span>2 weeks</span><span>This week</span>
      </div>
    </div>
  );
}

export default function BandTrendCard({ values }) {
  return (
    <DashboardPanel
      title="Band Score Trend"
      className="h-[232px]"
      action={<span className="rounded-lg border border-slate-200 px-2 py-1 text-[12px] font-medium text-slate-500">30 Days</span>}
    >
      <TrendChart values={values} />
    </DashboardPanel>
  );
}
