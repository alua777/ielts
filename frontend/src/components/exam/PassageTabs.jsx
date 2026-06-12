// Segmented passage/section switcher tabs
export default function PassageTabs({ passages, currentIndex, onSelect, label = 'Passage' }) {
  if (passages.length <= 1) return null;
  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
      {passages.map((p, i) => (
        <button
          key={p.id || i}
          onClick={() => onSelect(i)}
          className={`px-5 py-1.5 rounded-lg text-[13px] font-semibold transition-all border-0 cursor-pointer ${
            currentIndex === i
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label} {i + 1}
        </button>
      ))}
    </div>
  );
}
