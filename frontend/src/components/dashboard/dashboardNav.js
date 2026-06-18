import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  History,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Target,
} from 'lucide-react';

export const PRIMARY_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', match: path => path === '/dashboard' },
  { label: 'Study Plan', icon: CalendarDays, path: '/dashboard' },
  { label: 'Mock Tests', icon: ClipboardCheck, action: 'startExam' },
  { label: 'Practice', icon: Target, path: '/practice', match: path => path.startsWith('/practice') },
  { label: 'Results', icon: ScrollText, path: '/results', match: path => path.startsWith('/results') || path === '/review-answers' },
  { label: 'History', icon: History, path: '/history', match: path => path.startsWith('/history') },
  { label: 'Progress', icon: ChartNoAxesCombined, path: '/history' },
  { label: 'Admin', icon: ShieldCheck, path: '/admin', adminOnly: true, match: path => path.startsWith('/admin') },
  { label: 'Settings', icon: Settings, path: '/settings', match: path => path.startsWith('/settings') },
];
