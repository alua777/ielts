import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-dvh place-items-center bg-[#f7f9fd] px-4 text-slate-900">
      <main className="max-w-lg rounded-lg p-8 text-center">
        <p className="text-[13px] font-bold uppercase text-violet-600">404</p>
        <h1 className="mt-3 text-[34px] font-extrabold text-slate-950">Page not found</h1>
        <p className="mt-3 text-[14px] leading-6 text-slate-500">The page you are looking for does not exist or has moved.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => navigate(-1)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-bold text-slate-700">
            <ArrowLeft size={17} /> Back
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-[14px] font-bold text-white">
            <LayoutDashboard size={17} /> Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
