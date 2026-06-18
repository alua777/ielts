import { createElement } from 'react';
import { ArrowRight } from 'lucide-react';

export default function PracticeSectionCard({ section, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-52 flex-col border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
      style={{ borderRadius: 8 }}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${section.iconClass}`}>
        {createElement(section.icon, { size: 21 })}
      </span>
      <h2 className="mt-5 text-[18px] font-bold text-slate-950">{section.label}</h2>
      <p className="mt-2 flex-1 text-[14px] leading-6 text-slate-500">{section.description}</p>
      <span className="mt-5 flex items-center gap-2 text-[14px] font-semibold text-violet-700">
        Explore practice <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </span>
    </button>
  );
}
