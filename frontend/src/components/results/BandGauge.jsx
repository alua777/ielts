export default function BandGauge({ value, label, color = '#6d4aff', size = 96 }) {
  const score = Math.max(0, Math.min(9, Number(value || 0)));
  const radius = 38;
  const circumference = Math.PI * radius;
  const progress = (score / 9) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.64 }}>
        <svg viewBox="0 0 96 58" className="h-full w-full overflow-visible">
          <path
            d="M 10 50 A 38 38 0 0 1 86 50"
            fill="none"
            stroke="#e9edf5"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 38 38 0 0 1 86 50"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <span className="absolute inset-x-0 bottom-0 text-center text-[25px] font-extrabold tabular-nums text-slate-950">
          {score.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold text-slate-900">{label}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-500">
        {score >= 7 ? 'Good' : score >= 6 ? 'Competent' : 'Developing'}
      </p>
    </div>
  );
}
