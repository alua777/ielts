// Left panel: renders a reading passage with labeled paragraphs
function parseParagraphs(body) {
  if (!body) return [];
  return body.split('\n\n').filter(Boolean).map(block => {
    const match = block.match(/^([A-G])\.\s([\s\S]*)/);
    if (match) return { label: match[1], text: match[2].trim() };
    return { label: '', text: block.trim() };
  });
}

export default function PassagePanel({ passage, groups, passageIndex }) {
  const paragraphs = parseParagraphs(passage?.body);
  return (
    <div className="h-full overflow-y-auto rounded-lg bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="p-5 sm:p-8 lg:p-10">
        {/* Meta */}
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-widest text-violet-400 uppercase mb-2">
            Reading Passage {passageIndex + 1}
          </p>
          <h1 className="text-[22px] font-bold leading-tight text-gray-900 sm:text-[28px]">
            {passage?.title}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[12px] text-gray-400">
              Questions {groups[0]?.from_number}–{groups.at(-1)?.to_number}
            </span>
            <span className="text-gray-200">·</span>
            <span className="text-[12px] text-gray-400">~20 min</span>
          </div>
          <div className="h-px bg-gray-100 mt-4" />
        </div>

        {/* Paragraphs */}
        {paragraphs.map(({ label, text }, i) => (
          <div key={i} className="mb-6">
            {label && (
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-50 border border-violet-100 text-[12px] font-bold text-violet-500 mb-2">
                {label}
              </div>
            )}
            <p className="text-[15px] leading-7 text-gray-700 sm:text-[16px] sm:leading-8">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
