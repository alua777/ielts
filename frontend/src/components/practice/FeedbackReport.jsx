import { CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react';
import { createElement } from 'react';

function ListBlock({ title, items, icon, tone }) {
  return (
    <section className="border border-slate-200 bg-white p-5" style={{ borderRadius: 8 }}>
      <h2 className="flex items-center gap-2 text-[16px] font-bold text-slate-950">
        {createElement(icon, { size: 18, className: tone })} {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map(item => (
          <li key={item} className="flex gap-3 text-[14px] leading-6 text-slate-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" /> {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function FeedbackReport({ feedback }) {
  return (
    <div className="space-y-4">
      <section className="grid gap-5 border border-violet-100 bg-white p-6 lg:grid-cols-[220px_1fr]" style={{ borderRadius: 8 }}>
        <div className="flex flex-col justify-center border-b border-slate-100 pb-5 lg:border-b-0 lg:border-r lg:pb-0">
          <p className="text-[12px] font-bold uppercase text-violet-600">Estimated Band</p>
          <p className="mt-2 text-[56px] font-extrabold leading-none text-slate-950">{Number(feedback.overall_band).toFixed(1)}</p>
          <p className="mt-3 text-[13px] font-semibold text-slate-500">AI Feedback Preview</p>
        </div>
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-950">{feedback.test_title || 'Practice feedback'}</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-slate-600">{feedback.summary}</p>
          <p className="mt-4 text-[12px] leading-5 text-slate-400">
            This is an automated practice estimate, not an official IELTS score.
          </p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {feedback.criteria.map(item => (
          <article key={item.label} className="border border-slate-200 bg-white p-5" style={{ borderRadius: 8 }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-bold text-slate-950">{item.label}</h2>
              <span className="text-[22px] font-extrabold text-violet-700">{Number(item.band).toFixed(1)}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${(Number(item.band) / 9) * 100}%` }} />
            </div>
            <p className="mt-3 text-[13px] leading-6 text-slate-500">{item.feedback}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListBlock title="What worked well" items={feedback.strengths} icon={CheckCircle2} tone="text-emerald-600" />
        <ListBlock title="How to improve" items={feedback.improvements} icon={TrendingUp} tone="text-amber-600" />
      </div>

      <section className="flex gap-3 border border-violet-100 bg-violet-50 p-5" style={{ borderRadius: 8 }}>
        <Lightbulb size={20} className="mt-0.5 shrink-0 text-violet-600" />
        <p className="text-[13px] leading-6 text-slate-600">
          Use this preview to guide another attempt. Focus on one or two improvements at a time, then compare the next estimate.
        </p>
      </section>
    </div>
  );
}
