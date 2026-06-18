import { BookOpen, Headphones, Mic2, PenLine } from 'lucide-react';
import BandGauge from './BandGauge';
import ResultsPanel from './ResultsPanel';

const ITEMS = [
  { key: 'reading', label: 'Reading', icon: BookOpen, color: '#6d4aff' },
  { key: 'listening', label: 'Listening', icon: Headphones, color: '#f97316' },
  { key: 'writing', label: 'Writing', icon: PenLine, color: '#3b82f6' },
  { key: 'speaking', label: 'Speaking', icon: Mic2, color: '#8b5cf6' },
];

export default function SectionScoresCard({ scores }) {
  return (
    <ResultsPanel title="Sectional Band Scores" className="min-h-[292px]">
      <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4">
        {ITEMS.map(item => (
          <div key={item.key} className="relative">
            {/* <span className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-violet-600">
              <item.icon size={18} />
            </span> */}
            <BandGauge value={scores[item.key]} label={item.label} color={item.color} />
          </div>
        ))}
      </div>
    </ResultsPanel>
  );
}
