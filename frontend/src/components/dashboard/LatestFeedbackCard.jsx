import { createElement } from 'react';
import { Mic2, PenLine } from 'lucide-react';
import DashboardPanel from './DashboardPanel';

function FeedbackRow({ icon, iconClass, title, score, children, bordered }) {
  return (
    <div className={`flex min-w-0 gap-3 ${bordered ? 'border-t border-slate-100 pt-3' : ''}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        {createElement(icon, { size: 17 })}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold text-slate-900">{title}</p>
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[12px] font-medium text-violet-600">{score}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[14px] leading-[1.6] text-slate-500">{children}</p>
      </div>
      <button className="self-center rounded-lg border border-violet-100 px-2.5 py-1 text-[13px] font-semibold text-violet-600">
        View
      </button>
    </div>
  );
}

export default function LatestFeedbackCard({ averageBand }) {
  return (
    <DashboardPanel title="Latest Feedback" className="pastel-card-blue h-[232px]">
      <div className="space-y-3">
        <FeedbackRow icon={PenLine} iconClass="bg-blue-50 text-blue-600" title="Writing Task 2" score={averageBand ? averageBand.toFixed(1) : '-'}>
          Improve coherence and support ideas with relevant examples.
        </FeedbackRow>
        <FeedbackRow icon={Mic2} iconClass="bg-violet-50 text-violet-600" title="Speaking Part 2" score="6.0" bordered>
          Reduce hesitation and expand answers with more detail.
        </FeedbackRow>
      </div>
    </DashboardPanel>
  );
}
