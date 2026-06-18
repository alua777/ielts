import { createElement } from 'react';
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  Headphones,
  LayoutDashboard,
  Mic2,
  PenLine,
  Target,
} from 'lucide-react';

const skills = [
  { label: 'Reading', value: 7, icon: BookOpen, color: 'bg-emerald-500' },
  { label: 'Listening', value: 7.5, icon: Headphones, color: 'bg-orange-500' },
  { label: 'Writing', value: 6, icon: PenLine, color: 'bg-blue-500' },
  { label: 'Speaking', value: 6.5, icon: Mic2, color: 'bg-violet-500' },
];

export default function LandingPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(76,29,149,0.14)]">
      <div className="grid h-[500px] grid-cols-[145px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 px-1 pb-5">
            <img src="/ielts-buddy-logo.png" alt="" className="h-7 w-7 rounded-md object-cover" />
            <span className="text-[11px] font-extrabold text-slate-950">IELTS Buddy</span>
          </div>
          <div className="space-y-1">
            {[
              ['Dashboard', LayoutDashboard, true],
              ['Study Plan', CalendarDays],
              ['Mock Tests', Target],
              ['Practice', BookOpen],
              ['Progress', ChartNoAxesCombined],
            ].map(([label, Icon, active]) => (
              <div key={label} className={`flex h-8 items-center gap-2 rounded-md px-2 text-[9px] font-semibold ${active ? 'bg-violet-50 text-violet-700' : 'text-slate-500'}`}>
                {createElement(Icon, { size: 12 })} {label}
              </div>
            ))}
          </div>
        </aside>

        <div className="bg-[#f8faff] p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[16px] font-extrabold text-slate-950">Welcome back, Alua!</p>
              <p className="mt-1 text-[8px] text-slate-500">Let's achieve your target band 7.0</p>
            </div>
            <span className="rounded-md bg-violet-50 px-2 py-1 text-[8px] font-bold text-violet-700">34 days left</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-900">Overall Band Score</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-20 w-20 place-items-center rounded-full border-[7px] border-violet-500 border-r-slate-100">
                  <span className="text-[24px] font-extrabold">6.5</span>
                </div>
                <div>
                  <p className="text-[8px] text-slate-500">Target</p>
                  <p className="text-[18px] font-extrabold text-violet-600">7.0</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-900">Today's Plan</p>
              <div className="mt-3 space-y-3">
                {['Vocabulary Review', 'Reading Passage 2', 'Writing Task 2'].map((item, index) => (
                  <div key={item} className="flex items-center gap-2 text-[8px] text-slate-600">
                    <CheckCircle2 size={11} className={index < 2 ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className="flex-1">{item}</span>
                    <span className="text-slate-400">{15 + index * 10} min</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md bg-violet-600 py-2 text-center text-[8px] font-bold text-white">Continue Studying</div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-900">Skills Breakdown</p>
              <div className="mt-3 space-y-3">
                {skills.map(skill => (
                  <div key={skill.label} className="grid grid-cols-[16px_48px_1fr_22px] items-center gap-2 text-[8px]">
                    <skill.icon size={12} className="text-violet-600" />
                    <span>{skill.label}</span>
                    <div className="h-1.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${skill.color}`} style={{ width: `${skill.value * 10}%` }} /></div>
                    <strong>{skill.value.toFixed(1)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1.05fr_0.95fr] gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-900">Band Score Trend</p>
              <svg viewBox="0 0 360 130" className="mt-3 h-[145px] w-full">
                {[25, 60, 95].map(y => <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeDasharray="3 4" />)}
                <path d="M 5 100 C 45 85, 55 110, 90 65 S 145 45, 175 80 S 235 65, 270 92 S 325 75, 355 45" fill="none" stroke="#6d4aff" strokeWidth="3" />
              </svg>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-bold text-slate-900">Latest AI Feedback</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-[8px] font-bold">Writing Task 2 <span className="text-violet-600">Band 6.0</span></p>
                  <p className="mt-2 text-[7px] leading-4 text-slate-500">Improve coherence and support ideas with relevant examples.</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-[8px] font-bold">Speaking Part 2 <span className="text-violet-600">Band 6.5</span></p>
                  <p className="mt-2 text-[7px] leading-4 text-slate-500">Reduce hesitation and expand answers with more detail.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
