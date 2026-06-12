import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ListeningNotesPanel({ attemptId }) {
  const notesKey = `ielts-listening-notes-${attemptId || 'practice'}`;
  const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) || '');

  useEffect(() => {
    const timer = window.setTimeout(() => localStorage.setItem(notesKey, notes), 200);
    return () => window.clearTimeout(timer);
  }, [notes, notesKey]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-5">
        <FileText size={16} className="text-violet-600" />
        <p className="text-[13px] font-bold text-slate-900">Notes</p>
      </div>
      
        <textarea
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="Write names, dates, and keywords..."
          className="min-h-0 flex-1 resize-none rounded-lg  p-4 text-[14px] leading-6 text-slate-800 outline-none"
        />
        <p className="mt-3 text-right text-[11px] font-semibold text-slate-400">
          {notes.length} characters
        </p>
      
    </aside>
  );
}
