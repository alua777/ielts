import { CalendarDays, ClipboardCheck, Target, TrendingUp } from 'lucide-react';

function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

export default function NewUserDashboard({ survey, onStartExam, onPractice, onSurvey }) {
  const weakSections = survey?.weak_sections || [];
  const countdown = daysUntil(survey?.exam_date);
  const target = survey?.target_band || 7;

  return (
    <div className="space-y-4">
      <section className="soft-card grid gap-4 rounded-lg p-5 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-[12px] font-bold uppercase text-violet-600">Welcome to IELTS Buddy</p>
          <h2 className="mt-2 text-[24px] font-extrabold text-slate-950 sm:text-[30px]">Let’s build your first score baseline</h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-500">
            Start with a full mock test so your dashboard can show real scores, trends, strengths, and feedback.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onStartExam} className="min-h-11 rounded-lg bg-violet-600 px-5 text-[14px] font-bold text-white">Start first mock test</button>
            <button type="button" onClick={onPractice} className="min-h-11 rounded-lg bg-white/75 px-5 text-[14px] font-bold text-violet-700 shadow-sm">Practice weak sections</button>
          </div>
        </div>
        <div className="rounded-lg bg-violet-50 p-4">
          <p className="text-[13px] font-bold text-slate-900">Your target</p>
          <p className="mt-2 text-[42px] font-extrabold text-violet-700">{Number(target).toFixed(1)}</p>
          <p className="text-[13px] text-slate-500">
            {countdown == null ? 'Add your exam date to unlock a countdown.' : countdown >= 0 ? `${countdown} days until exam` : 'Exam date has passed'}
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="soft-card pastel-card-violet rounded-lg p-5">
          <Target className="text-violet-600" size={22} />
          <h3 className="mt-4 text-[16px] font-bold text-slate-950">Recommended focus</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">
            {weakSections.length ? `Start with ${weakSections.map(item => item[0].toUpperCase() + item.slice(1)).join(', ')} practice.` : 'Take one diagnostic test to reveal your weak sections.'}
          </p>
        </article>
        <article className="soft-card pastel-card-blue rounded-lg p-5">
          <CalendarDays className="text-blue-600" size={22} />
          <h3 className="mt-4 text-[16px] font-bold text-slate-950">Study rhythm</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">Aim for {survey?.study_hours || 6} focused hours this week, split across short daily sessions.</p>
        </article>
        <article className="soft-card pastel-card-mint rounded-lg p-5">
          <TrendingUp className="text-emerald-600" size={22} />
          <h3 className="mt-4 text-[16px] font-bold text-slate-950">Progress tracking</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">Your charts and history will fill in automatically after your first completed attempt.</p>
        </article>
      </div>

      <section className="soft-card rounded-lg p-5 text-center">
        <ClipboardCheck className="mx-auto text-violet-600" size={26} />
        <h3 className="mt-3 text-[16px] font-bold text-slate-950">No attempts yet</h3>
        <p className="mt-2 text-[14px] text-slate-500">Complete a mock test or practice task to see detailed cards here.</p>
        <button type="button" onClick={onSurvey} className="mt-4 min-h-11 rounded-lg bg-white/75 px-5 text-[14px] font-bold text-slate-700 shadow-sm">Update survey</button>
      </section>
    </div>
  );
}
