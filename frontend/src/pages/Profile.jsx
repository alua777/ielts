import { UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <main className="min-h-[calc(100dvh-57px)] bg-[#f7f9fd] px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <UserRound size={25} />
          </span>
          <div>
            <h1 className="text-[32px] font-bold text-slate-950">Profile</h1>
            <p className="text-[14px] text-slate-500">Your IELTS Buddy account details.</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-[14px] sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4"><dt className="text-slate-400">Name</dt><dd className="mt-1 font-semibold">{user?.name}</dd></div>
          <div className="rounded-lg bg-slate-50 p-4"><dt className="text-slate-400">Email</dt><dd className="mt-1 font-semibold">{user?.email}</dd></div>
        </dl>
      </div>
    </main>
  );
}
