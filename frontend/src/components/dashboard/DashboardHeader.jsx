import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';

export default function DashboardHeader({
  firstName,
  user,
  latestAttempt,
  targetBand,
  onProfile,
  onSettings,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = event => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="mb-4 flex min-h-[64px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[32px]">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500 sm:text-[16px]">
          Let's continue your journey to band {targetBand.toFixed(1)}
        </p>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:gap-3">
        <div className="hidden text-right xl:block">
          <p className="text-[12px] font-medium text-slate-400">Latest attempt</p>
          <p className="text-[14px] font-bold text-slate-900">{latestAttempt}</p>
        </div>
        <span className="hidden rounded-full bg-violet-50 px-3 py-2 text-[13px] font-semibold text-violet-600 sm:inline-flex">
          Target {targetBand.toFixed(1)}
        </span>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-slate-500 shadow-sm hover:bg-white"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="relative pl-3" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-[14px] font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || <UserRound size={17} />}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-[14px] font-bold text-slate-900">{user?.name || 'Student'}</span>
              <span className="block text-[12px] text-slate-400">IELTS learner</span>
            </span>
            <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="soft-card absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl p-2">
              <div className="px-3 py-2">
                <p className="truncate text-[14px] font-semibold text-slate-900">{user?.name}</p>
                <p className="truncate text-[12px] text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); onProfile(); }}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              >
                <UserRound size={16} /> Profile
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); onSettings(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); onLogout(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
