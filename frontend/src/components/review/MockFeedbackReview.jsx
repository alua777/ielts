import { FileText, Mic2 } from 'lucide-react';
import { resolveApiAssetUrl } from '../../lib/api';

function CriteriaGrid({ criteria }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {criteria.map(item => (
        <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] font-bold text-slate-900">{item.label}</h3>
            <span className="text-[20px] font-extrabold text-violet-700">{Number(item.band).toFixed(1)}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${Number(item.band) / 9 * 100}%` }} />
          </div>
          <p className="mt-3 text-[13px] leading-6 text-slate-500">{item.feedback}</p>
        </article>
      ))}
    </div>
  );
}

function AdviceList({ title, items, tone }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className={`text-[14px] font-bold ${tone}`}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map(item => <li key={item} className="text-[13px] leading-6 text-slate-600">• {item}</li>)}
      </ul>
    </section>
  );
}

function TaskFeedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="mt-5 space-y-4 rounded-lg border border-violet-100 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-[14px] font-bold text-slate-950">AI feedback for this question</h4>
        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-violet-700">
          Band {Number(feedback.overall_band).toFixed(1)}
        </span>
      </div>
      <p className="text-[13px] leading-6 text-slate-600">{feedback.summary}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(feedback.criteria || []).map(item => (
          <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h5 className="text-[13px] font-bold text-slate-900">{item.label}</h5>
              <span className="text-[16px] font-extrabold text-violet-700">{Number(item.band).toFixed(1)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[12px] leading-6 text-slate-600">{item.feedback}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function MockFeedbackReview({ section, feedback }) {
  const isWriting = section === 'writing';
  if (!feedback) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <p className="text-[14px] font-semibold text-slate-500">No feedback is available for this section.</p>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="grid gap-5 rounded-lg border border-violet-100 bg-white p-6 md:grid-cols-[190px_1fr]">
          <div className="border-b border-slate-100 pb-5 md:border-b-0 md:border-r md:pb-0">
            <p className="text-[11px] font-bold uppercase text-violet-600">Estimated Band</p>
            <p className="mt-2 text-[48px] font-extrabold leading-none text-slate-950">{Number(feedback.overall_band).toFixed(1)}</p>
            <p className="mt-3 text-[12px] font-semibold text-slate-500">AI Feedback Preview</p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-[22px] font-extrabold text-slate-950">
              {isWriting ? <FileText size={21} /> : <Mic2 size={21} />}
              {isWriting ? 'Writing feedback' : 'Speaking feedback'}
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-slate-600">{feedback.summary}</p>
            <p className="mt-3 text-[11px] text-slate-400">Practice estimate only. This is not an official IELTS score.</p>
          </div>
        </section>

        <CriteriaGrid criteria={feedback.criteria || []} />

        <div className="grid gap-3 md:grid-cols-2">
          <AdviceList title="Strengths" items={feedback.strengths || []} tone="text-emerald-700" />
          <AdviceList title="Improvements" items={feedback.improvements || []} tone="text-amber-700" />
        </div>

        {isWriting ? (
          <section className="space-y-3">
            {(feedback.submissions || []).map((submission, index) => (
              <article key={submission.id} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-bold text-slate-950">Writing Task {index + 1}</h3>
                  <span className="text-[12px] font-bold text-violet-700">
                    {submission.word_count} words · Band {Number(submission.estimated_band).toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-semibold text-slate-500">{submission.question_text}</p>
                <div className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-5 text-[14px] leading-7 text-slate-700">
                  {submission.essay_text}
                </div>
                <TaskFeedback feedback={submission.ai_feedback} />
              </article>
            ))}
          </section>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(feedback.submissions || []).map(submission => (
              <article key={submission.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-[14px] font-bold text-slate-950">Speaking Part {Number(submission.part_index) + 1}</h3>
                <p className="mt-1 text-[12px] text-slate-500">{submission.passage_title || 'Recorded response'}</p>
                <audio controls className="mt-4 w-full" src={resolveApiAssetUrl(submission.audio_path)} />
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
