import { ChartNoAxesCombined } from 'lucide-react';
import DashboardPanel from './DashboardPanel';
import { clampBand } from './dashboardConfig';

function BandGauge({ band }) {
  const pct = Math.round((clampBand(band) / 9) * 100);
  return (
    <div
      className="relative h-[132px] w-[132px] shrink-0 rounded-full"
      style={{ background: `conic-gradient(#6d4aff ${pct * 3.6}deg, #edf0f6 0deg)` }}
    >
      <div className="absolute inset-[11px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[48px] font-extrabold leading-none text-slate-950">
          {band ? Number(band).toFixed(1) : '-'}
        </span>
        <span className=" text-[12px] font-medium text-slate-500">
          {band >= 7 ? 'Good' : band >= 6 ? 'Competent' : 'Developing'}
        </span>
      </div>
    </div>
  );
}

export default function OverallBandCard({ averageBand, targetBand }) {
  return (
    <DashboardPanel title="Overall Band Score" className="h-[270px]">
      <div className="flex items-center justify-center gap-8">
        <BandGauge band={averageBand} />
        <div className="min-w-0 flex-1 text-end border-l border-slate-200 pl-5">
          <p className="text-[14px] text-slate-500">Target</p>
          <p className="mt-1 text-[36px] font-bold leading-none text-violet-600">{targetBand.toFixed(1)}</p>
          <p className="mt-6 text-[14px] leading-5 text-slate-700">
            {averageBand
              ? `${Math.max(0, targetBand - averageBand).toFixed(1)} bands away`
              : 'Complete your first exam'}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${Math.min(100, (averageBand / targetBand) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[14px] text-slate-500">
        <ChartNoAxesCombined size={15} className="text-violet-500" />
        Keep practicing consistently
      </p>
    </DashboardPanel>
  );
}
