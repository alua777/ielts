import ResultsPanel from './ResultsPanel';

export default function ResultsTrendCard({ values }) {
  const points = values.length ? values : [5.5, 5.8, 6, 5.9, 6.2, 6];
  const width = 390;
  const height = 145;
  const coords = points.map((value, index) => [
    (index / Math.max(points.length - 1, 1)) * width,
    height - ((Math.max(4, Math.min(9, value)) - 4) / 5) * height,
  ]);
  const path = coords.map(([x, y], index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');

  return (
    <ResultsPanel title="Band Score Trend" className="min-h-[292px]">
      <div className="relative pt-2">
        <div className="absolute inset-x-0 top-4 flex h-[145px] flex-col justify-between">
          {[8, 7, 6, 5].map(value => <div key={value} className="border-t border-dashed border-slate-200" />)}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="relative h-[165px] w-full overflow-visible">
          <path d={path} fill="none" stroke="#6d4aff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="4" fill="#6d4aff" />)}
        </svg>
        <div className="flex justify-between overflow-hidden text-[10px] font-medium text-slate-500 sm:text-[11px]">
          {points.map((_, index) => <span key={index}>Mock {index + 1}</span>)}
        </div>
      </div>
    </ResultsPanel>
  );
}
