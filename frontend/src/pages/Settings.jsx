import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f9fd] px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <SettingsIcon size={25} />
          </span>
          <div>
            <h1 className="text-[32px] font-bold text-slate-950">Settings</h1>
            <p className="text-[14px] text-slate-500">Account and study preferences will live here.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
