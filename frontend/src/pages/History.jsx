import { Award, BarChart3, Clock3, ListChecks } from 'lucide-react';
import { createElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import HistoryAttemptCard from '../components/history/HistoryAttemptCard';
import HistoryFilters from '../components/history/HistoryFilters';
import HistorySkeleton from '../components/skeletons/HistorySkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { apiRequest } from '../lib/api';

const STATS = [
  ['Total attempts', 'total_attempts', ListChecks, 'text-violet-600 bg-violet-50'],
  ['Average band', 'average_band', BarChart3, 'text-blue-600 bg-blue-50'],
  ['Best band', 'best_band', Award, 'text-emerald-600 bg-emerald-50'],
  ['Practice time', 'practice_minutes', Clock3, 'text-amber-600 bg-amber-50'],
];

export default function History() {
  const { token, logout } = useAuth();
  const { startExam } = useExam();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', section: 'all', status: 'all', sort: 'newest' });
  const [data, setData] = useState({ attempts: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(filters);
    const timer = window.setTimeout(() => {
      apiRequest(`/history?${query}`, token)
        .then(setData)
        .catch(requestError => setError(requestError.message))
        .finally(() => setLoading(false));
    }, filters.search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [filters, reload, token]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-dvh bg-[#f7f9fd] text-slate-900">
      <DashboardSidebar onStartExam={() => startExam('reading')} onLogout={handleLogout} onNavigate={navigate} />
      <main className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-[1280px]">
          {loading ? <HistorySkeleton /> : error ? (
            <ErrorState title="Couldn't load history" message={error} onRetry={() => { setLoading(true); setError(''); setReload(value => value + 1); }} />
          ) : (
            <>
              <header>
                <h1 className="text-[28px] font-bold text-slate-950 sm:text-[32px]">History</h1>
                <p className="mt-2 text-[14px] text-slate-500 sm:text-[15px]">Review your past IELTS practice attempts and track your progress.</p>
              </header>

              <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {STATS.map(([label, key, Icon, tone]) => {
                  const value = data.stats[key];
                  const display = key === 'practice_minutes' ? `${value || 0} min` : key.includes('band') ? (value == null ? '--' : Number(value).toFixed(1)) : value || 0;
                  return (
                    <article key={key} className="rounded-lg border border-slate-200 bg-white p-4">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>{createElement(Icon, { size: 18 })}</span>
                      <p className="mt-3 text-[22px] font-extrabold text-slate-950 sm:text-[28px]">{display}</p>
                      <p className="mt-1 text-[12px] font-medium text-slate-500">{label}</p>
                    </article>
                  );
                })}
              </section>

              <div className="mt-5"><HistoryFilters filters={filters} onChange={next => { setLoading(true); setError(''); setFilters(next); }} /></div>
              <div className="mt-5 space-y-3">
                {data.attempts.length ? data.attempts.map(attempt => (
                  <HistoryAttemptCard key={`${attempt.source}-${attempt.id}`} attempt={attempt} onReview={() => navigate(attempt.review_url)} />
                )) : <EmptyState title="No attempts yet" message="Complete a practice test to see your history here." />}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
