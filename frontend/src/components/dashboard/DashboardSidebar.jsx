import { createElement, useEffect, useState } from 'react';
import { HelpCircle, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS } from './dashboardNav';
import { useAuth } from '../../context/AuthContext';

function Logo() {
  return (
    <div className="flex items-center gap-4">
      <span className="relative h-10 w-10 shrink-0">
        <img
          src="/ielts-buddy-logo.png"
          alt="IELTS Buddy"
          className="absolute left-1/2 top-[49%] h-[185%] w-[185%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
        />
      </span>
      <span className="text-[18px] font-extrabold text-slate-950">IELTS Buddy</span>
    </div>
  );
}

function NavContent({ pathname, onStartExam, onLogout, onNavigate, onClose }) {
  const { user } = useAuth();
  const navItems = PRIMARY_NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'admin');
  const act = callback => {
    callback?.();
    onClose?.();
  };
  return (
    <>
      <div className="px-2 pb-5"><Logo /></div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(item => {
          const active = item.match?.(pathname) || false;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => act(item.action === 'startExam' ? onStartExam : () => onNavigate?.(item.path))}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] transition-colors ${
                active
                  ? 'bg-violet-50 font-semibold text-violet-700'
                  : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {createElement(item.icon, { size: 18, strokeWidth: 2 })}
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="rounded-lg border border-violet-100 bg-violet-50/70 p-3 text-center">
        <Sparkles size={20} className="mx-auto text-violet-600" />
        <p className="mt-2 text-[13px] font-semibold text-slate-900">Ready for another test?</p>
        <button type="button" onClick={() => act(onStartExam)} className="mt-3 min-h-11 w-full rounded-lg bg-violet-600 px-3 text-[14px] font-semibold text-white">
          Start full exam
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between px-2">
        <button className="flex min-h-11 items-center gap-2 text-[13px] font-semibold text-slate-500"><HelpCircle size={16} /> Help Center</button>
        <button type="button" onClick={() => act(onLogout)} title="Log out" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
          <LogOut size={17} />
        </button>
      </div>
    </>
  );
}

export default function DashboardSidebar({ onStartExam, onLogout, onNavigate }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700">
          <Menu size={21} />
        </button>
      </header>

      {open && <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white px-3 py-4 transition-transform lg:static lg:z-auto lg:h-dvh lg:w-[250px] lg:shrink-0 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 lg:hidden">
          <X size={20} />
        </button>
        <NavContent pathname={pathname} onStartExam={onStartExam} onLogout={onLogout} onNavigate={onNavigate} onClose={() => setOpen(false)} />
      </aside>
    </>
  );
}
