import { BookOpen, Headphones, Mic2, PenLine } from 'lucide-react';

export const DASHBOARD_SKILLS = [
  { key: 'reading', label: 'Reading', icon: BookOpen, color: '#16a34a', bg: '#ecfdf3' },
  { key: 'listening', label: 'Listening', icon: Headphones, color: '#f97316', bg: '#fff7ed' },
  { key: 'writing', label: 'Writing', icon: PenLine, color: '#1683ff', bg: '#eff6ff' },
  { key: 'speaking', label: 'Speaking', icon: Mic2, color: '#8b5cf6', bg: '#f5f3ff' },
];

export function clampBand(value) {
  return Math.max(0, Math.min(9, Number(value) || 0));
}
