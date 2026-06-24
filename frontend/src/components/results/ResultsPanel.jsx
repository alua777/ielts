export default function ResultsPanel({ title, action, children, className = '' }) {
  return (
    <section className={`soft-card min-w-0 rounded-lg p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="text-[15px] font-bold text-slate-950">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
