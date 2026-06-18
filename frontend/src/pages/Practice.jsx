import { BookOpen, Headphones, Mic2, PenLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PracticeSectionCard from '../components/practice/PracticeSectionCard';
import PracticeShell from '../components/practice/PracticeShell';
import PracticeListSkeleton from '../components/skeletons/PracticeListSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const SECTIONS = [
  { key: 'reading', label: 'Reading', icon: BookOpen, iconClass: 'bg-emerald-50 text-emerald-600', description: 'Build speed and accuracy across authentic passage and question formats.' },
  { key: 'listening', label: 'Listening', icon: Headphones, iconClass: 'bg-amber-50 text-amber-600', description: 'Practise note completion, multiple choice, and detail recognition.' },
  { key: 'writing', label: 'Writing', icon: PenLine, iconClass: 'bg-blue-50 text-blue-600', description: 'Write Task 1 and Task 2 responses with an AI Feedback Preview.' },
  { key: 'speaking', label: 'Speaking', icon: Mic2, iconClass: 'bg-violet-50 text-violet-600', description: 'Record answers for all three parts and receive an estimated band.' },
];

export default function Practice() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    apiRequest('/practice-tests', token)
      .then(data => setTests(data.tests || []))
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token, reload]);

  const completed = tests.filter(test => test.status === 'completed');
  const averageBand = completed.length
    ? completed.reduce((sum, test) => sum + Number(test.latest_band || 0), 0) / completed.length
    : 0;
  const counts = useMemo(
    () => Object.fromEntries(SECTIONS.map(section => [section.key, tests.filter(test => test.section === section.key).length])),
    [tests]
  );

  return (
    <PracticeShell>
      {loading ? <PracticeListSkeleton /> : error ? (
        <ErrorState message={error} onRetry={() => { setError(''); setLoading(true); setReload(value => value + 1); }} />
      ) : (
        <>
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[12px] font-bold uppercase text-violet-600">Practice library</p>
              <h1 className="mt-2 text-[32px] font-bold text-slate-950">Choose a skill to improve</h1>
              <p className="mt-2 text-[15px] text-slate-500">Focused IELTS practice with saved progress and useful feedback.</p>
            </div>
            <div className="flex gap-6 border border-slate-200 bg-white px-5 py-3" style={{ borderRadius: 8 }}>
              <div><p className="text-[22px] font-extrabold text-slate-950">{completed.length}</p><p className="text-[12px] text-slate-500">Completed</p></div>
              <div><p className="text-[22px] font-extrabold text-violet-700">{averageBand ? averageBand.toFixed(1) : '--'}</p><p className="text-[12px] text-slate-500">Average band</p></div>
            </div>
          </header>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SECTIONS.map(section => (
              <div key={section.key} className="relative">
                <PracticeSectionCard section={section} onOpen={() => navigate(`/practice/${section.key}`)} />
                <span className="pointer-events-none absolute right-5 top-5 text-[12px] font-semibold text-slate-400">{counts[section.key]} tests</span>
              </div>
            ))}
          </div>

          <section className="mt-7 border border-violet-100 bg-violet-50 p-6" style={{ borderRadius: 8 }}>
            <h2 className="text-[18px] font-bold text-slate-950">AI Feedback Preview</h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-slate-600">
              Writing and speaking practice can generate an estimated band with criterion-level guidance. It is designed for learning and is not an official IELTS result.
            </p>
          </section>
        </>
      )}
    </PracticeShell>
  );
}
