import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PracticeFilters from '../components/practice/PracticeFilters';
import PracticeShell from '../components/practice/PracticeShell';
import PracticeTestCard from '../components/practice/PracticeTestCard';
import PracticeListSkeleton from '../components/skeletons/PracticeListSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

export default function PracticeSection() {
  const { section } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/practice-tests/section/${section}`, token)
      .then(data => setTests(data.tests || []))
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [section, token]);

  const filtered = useMemo(
    () => tests.filter(test =>
      (!difficulty || test.difficulty === difficulty)
      && (!search || `${test.title} ${test.description}`.toLowerCase().includes(search.toLowerCase()))
    ),
    [difficulty, search, tests]
  );
  const completed = tests.filter(test => test.status === 'completed');
  const label = section ? section[0].toUpperCase() + section.slice(1) : 'Practice';

  return (
    <PracticeShell>
      {loading ? <PracticeListSkeleton /> : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          <button type="button" onClick={() => navigate('/practice')} className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-violet-700">
            <ArrowLeft size={16} /> All practice
          </button>
          <header className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-[32px] font-bold text-slate-950">{label} practice</h1>
              <p className="mt-2 text-[15px] text-slate-500">Choose a focused test and build consistency one session at a time.</p>
            </div>
            <div className="flex gap-6 text-right">
              <div><p className="text-[22px] font-extrabold text-slate-950">{tests.length}</p><p className="text-[12px] text-slate-500">Available</p></div>
              <div><p className="text-[22px] font-extrabold text-violet-700">{completed.length}</p><p className="text-[12px] text-slate-500">Completed</p></div>
            </div>
          </header>

          <div className="mt-6">
            <PracticeFilters search={search} onSearch={setSearch} difficulty={difficulty} onDifficulty={setDifficulty} />
          </div>

          <div className="mt-5">
            {filtered.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map(test => (
                  <PracticeTestCard key={test.id} test={test} onOpen={() => navigate(`/practice/test/${test.id}`)} />
                ))}
              </div>
            ) : (
              <EmptyState title="No matching tests" message="Try a different search term or difficulty filter." />
            )}
          </div>
        </>
      )}
    </PracticeShell>
  );
}
