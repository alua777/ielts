export default function DashboardPanel({ title, action, children, className = '' }) {
  return (
    <section className={`soft-card min-w-0 rounded-xl p-4 ${className}`}>
      <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
        <h2 className="truncate text-[16px] font-bold tracking-[-0.01em] text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
