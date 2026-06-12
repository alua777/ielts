import { createElement } from 'react';
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardCheck,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  Library,
  LogOut,
  Mic2,
  PenLine,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Study Plan', icon: CalendarDays },
  { label: 'Mock Tests', icon: ClipboardCheck, action: 'startExam' },
  { label: 'Practice', icon: Target, expandable: true },
  { label: 'Writing Feedback', icon: PenLine },
  { label: 'Speaking Feedback', icon: Mic2 },
  { label: 'Vocabulary', icon: Library },
  { label: 'Progress', icon: ChartNoAxesCombined },
  { label: 'Results', icon: ScrollText, path: '/results' },
  { label: 'Resources', icon: BookOpen },
  { label: 'Achievements', icon: Trophy },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function DashboardSidebar({
  onStartExam,
  onLogout,
  activeLabel = 'Dashboard',
  onNavigate,
}) {
  return (
    <aside className="hidden h-dvh w-[250px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-3 py-4 lg:flex">
      <div className="flex items-center gap-5 px-2 pb-5">
        <span className="relative h-10 w-10">
          <img
            src="/ielts-buddy-logo.png"
            alt="IELTS Buddy"
            className="absolute left-1/2 top-[49%] h-[185%] w-[185%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
          />
        </span>
        <span className="text-[18px] font-extrabold text-slate-950">IELTS Buddy</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, icon, path, action, expandable }) => (
          <button
            key={label}
            type="button"
            onClick={action === 'startExam' ? onStartExam : path ? () => onNavigate?.(path) : undefined}
            className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium transition-colors ${
              activeLabel === label
                ? 'bg-violet-50 text-violet-700'
                : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {createElement(icon, { size: 18, strokeWidth: 2 })}
            {label}
            {expandable && <ChevronDown size={15} className="ml-auto" />}
          </button>
        ))}
      </nav>

      <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-center">
        <Sparkles size={20} className="mx-auto text-violet-600" />
        <p className="mt-2 text-[13px] font-semibold text-slate-900">Ready for another test?</p>
        <button
          type="button"
          onClick={onStartExam}
          className="mt-3 w-full rounded-lg bg-violet-600 px-3 py-2 text-[15px] font-semibold text-white hover:bg-violet-700"
        >
          Start full exam
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between px-2">
        <button className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900">
          <HelpCircle size={16} /> Help Center
        </button>
        <button
          type="button"
          onClick={onLogout}
          title="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
