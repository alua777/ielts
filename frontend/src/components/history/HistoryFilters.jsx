import { Search } from 'lucide-react';

export default function HistoryFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-2 xl:grid-cols-[1fr_180px_170px_170px]">
      <label className="relative">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={filters.search} onChange={event => update('search', event.target.value)} placeholder="Search by test title" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-[14px] outline-none focus:border-violet-400" />
      </label>
      <select value={filters.section} onChange={event => update('section', event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-medium">
        <option value="all">All sections</option>
        <option value="reading">Reading</option>
        <option value="listening">Listening</option>
        <option value="writing">Writing</option>
        <option value="speaking">Speaking</option>
        <option value="mock">Full Mock Test</option>
      </select>
      <select value={filters.status} onChange={event => update('status', event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-medium">
        <option value="all">All statuses</option>
        <option value="completed">Completed</option>
        <option value="in_progress">In Progress</option>
        <option value="submitted">Submitted</option>
        <option value="reviewed">Reviewed</option>
      </select>
      <select value={filters.sort} onChange={event => update('sort', event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-medium">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="highest">Highest score</option>
        <option value="lowest">Lowest score</option>
      </select>
    </section>
  );
}
