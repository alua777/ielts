import { Search } from 'lucide-react';

export default function PracticeFilters({ search, onSearch, difficulty, onDifficulty }) {
  return (
    <div className="soft-card flex flex-col gap-3 p-3 sm:flex-row" style={{ borderRadius: 8 }}>
      <label className="relative flex-1">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={event => onSearch(event.target.value)}
          placeholder="Search practice tests"
          className="h-10 w-full rounded-lg border border-violet-100 bg-white/70 pl-10 pr-3 text-[14px] outline-none focus:border-violet-400 focus:bg-white"
        />
      </label>
      <select
        value={difficulty}
        onChange={event => onDifficulty(event.target.value)}
        className="h-10 rounded-lg border border-violet-100 bg-white/70 px-3 text-[14px] font-medium text-slate-700 outline-none focus:border-violet-400"
      >
        <option value="">All difficulties</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>
    </div>
  );
}
