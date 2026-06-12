import { createElement } from 'react';
import { Lightbulb, Mic2, PenLine } from 'lucide-react';
import ResultsPanel from './ResultsPanel';

function FeedbackItem({ icon: Icon, title, score, children, tone }) {
  return (
    <div className="flex gap-3">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tone}`}>
        {createElement(Icon, { size: 18 })}
      </span>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-bold text-slate-900">{title}</p>
          {score && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">Band {score}</span>}
        </div>
        <p className="mt-1 text-[11px] leading-5 text-slate-600">{children}</p>
      </div>
    </div>
  );
}

export default function FeedbackCard({ writingScore, speakingScore }) {
  return (
    <ResultsPanel title="AI Feedback Summary" className="h-[305px]">
      <div className="space-y-5">
        <FeedbackItem icon={PenLine} title="Writing Task 2" score={writingScore.toFixed(1)} tone="bg-violet-50 text-violet-600">
          Develop each main idea fully and support it with a relevant example.
        </FeedbackItem>
        <FeedbackItem icon={Mic2} title="Speaking" score={speakingScore.toFixed(1)} tone="bg-blue-50 text-blue-600">
          Good baseline fluency. Reduce hesitation and expand answers with more detail.
        </FeedbackItem>
        <FeedbackItem icon={Lightbulb} title="Overall Advice" tone="bg-amber-50 text-amber-600">
          Focus your next study session on writing structure and reading question matching.
        </FeedbackItem>
      </div>
    </ResultsPanel>
  );
}
