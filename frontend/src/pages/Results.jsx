import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import FeedbackCard from '../components/results/FeedbackCard';
import PerformanceCard from '../components/results/PerformanceCard';
import QuickStatsCard from '../components/results/QuickStatsCard';
import ResultsOverview from '../components/results/ResultsOverview';
import ResultsTrendCard from '../components/results/ResultsTrendCard';
import SectionScoresCard from '../components/results/SectionScoresCard';
import StrengthsCard from '../components/results/StrengthsCard';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import ResultsSkeleton from '../components/skeletons/ResultsSkeleton';
import ErrorState from '../components/ui/ErrorState';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function toBand(correct, total) {
  if (!total) return 0;
  const percentage = correct / total;
  if (percentage >= 0.97) return 9;
  if (percentage >= 0.93) return 8.5;
  if (percentage >= 0.87) return 8;
  if (percentage >= 0.8) return 7.5;
  if (percentage >= 0.73) return 7;
  if (percentage >= 0.67) return 6.5;
  if (percentage >= 0.6) return 6;
  if (percentage >= 0.53) return 5.5;
  if (percentage >= 0.47) return 5;
  if (percentage >= 0.4) return 4.5;
  return 4;
}

function formatDuration(seconds) {
  if (!seconds) return 'Not recorded';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(value) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Results() {
  const { token, logout } = useAuth();
  const { attemptId, startExam } = useExam();
  const navigate = useNavigate();
  const { attemptParam } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [mockFeedback, setMockFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API}/attempts`, { headers })
      .then(response => response.json())
      .then(async data => {
        const history = data.attempts || [];
        const selectedId = attemptParam || attemptId || history.find(item => item.status === 'completed')?.id || history[0]?.id;
        setAttempts(history);
        if (!selectedId) throw new Error('No results found.');

        const response = await fetch(`${API}/attempts/${selectedId}`, { headers });
        const detail = await response.json();
        if (!response.ok) throw new Error(detail.error || 'Failed to load results.');
        setResult(detail.attempt);
        setAnswers(detail.answers || []);
        setMockFeedback(detail.mock_feedback || null);
      })
      .catch(fetchError => setError(fetchError.message || 'Failed to load results.'))
      .finally(() => setLoading(false));
  }, [attemptId, attemptParam, token]);

  const gradedAnswers = useMemo(
    () => answers.filter(answer => answer.is_correct !== null && answer.is_correct !== undefined),
    [answers]
  );
  const correctCount = gradedAnswers.filter(answer => answer.is_correct === 1 || answer.is_correct === true).length;
  const totalGraded = gradedAnswers.length;
  const accuracy = totalGraded ? Math.round((correctCount / totalGraded) * 100) : 0;
  const overallBand = Number(result?.band_score || 0);

  const sectionRows = ['reading', 'listening'].map(section => {
    const sectionAnswers = gradedAnswers.filter(answer => answer.section === section);
    const correct = sectionAnswers.filter(answer => answer.is_correct === 1 || answer.is_correct === true).length;
    const total = sectionAnswers.length;
    return {
      key: section,
      label: section.charAt(0).toUpperCase() + section.slice(1),
      detail: section === 'reading' ? 'Comprehension questions' : 'Listening questions',
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : 0,
      band: toBand(correct, total),
    };
  });

  const scores = {
    reading: sectionRows[0]?.band || overallBand,
    listening: sectionRows[1]?.band || overallBand,
    writing: Number(mockFeedback?.writing?.overall_band || 6),
    speaking: Number(mockFeedback?.speaking?.overall_band || 6),
  };

  const completedAttempts = attempts.filter(item => item.status === 'completed');
  const trendValues = completedAttempts
    .slice(0, 6)
    .reverse()
    .map(item => Number(item.band_score || 0));
  const previousBand = trendValues.length > 1 ? trendValues.at(-2) : overallBand;
  const improvement = overallBand - previousBand;
  const averageTime = totalGraded && result?.time_taken_seconds
    ? `${Math.max(1, Math.round(result.time_taken_seconds / totalGraded))}s`
    : 'N/A';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate('/dashboard')} />;
  }

  return (
    <div className="flex min-h-dvh bg-[#f7f9fd] text-slate-900 lg:h-dvh lg:overflow-hidden">
      <DashboardSidebar
        activeLabel="Results"
        onStartExam={() => startExam('reading')}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-20 sm:px-6 lg:px-5 lg:py-4">
        <div className="mx-auto">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mb-3 flex items-center gap-2 bg-transparent text-[12px] font-bold text-slate-700"
              >
                <ArrowLeft size={15} /> Back to Dashboard
              </button>
              <h1 className="text-[26px] font-extrabold text-slate-950">Results</h1>
              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Full Mock Test <span className="px-2">•</span> Academic
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-violet-700 sm:px-5 sm:text-[13px]"
              >
                <Download size={16} /> Download Report
              </button>
              <button
                type="button"
                onClick={() => navigate(`/review-answers?attempt=${result?.id}`)}
                className="min-h-11 rounded-lg border-0 bg-violet-600 px-3 text-[12px] font-bold text-white hover:bg-violet-700 sm:px-5 sm:text-[13px]"
              >
                Review Answers
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <ResultsOverview
              band={overallBand}
              target={7}
              date={formatDate(result?.completed_at || result?.started_at)}
              time={formatDuration(result?.time_taken_seconds)}
              correct={correctCount}
              total={totalGraded}
            />

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_1.05fr_0.9fr]">
              <SectionScoresCard scores={scores} />
              <ResultsTrendCard values={trendValues} />
              <StrengthsCard accuracy={accuracy} />
              <PerformanceCard sectionRows={sectionRows} />
              <FeedbackCard
                writingScore={scores.writing}
                speakingScore={scores.speaking}
                onViewFeedback={() => navigate(`/review-answers?attempt=${result?.id}&section=writing`)}
              />
              <QuickStatsCard
                averageTime={averageTime}
                attemptsCount={completedAttempts.length}
                improvement={improvement}
                onStudyPlan={() => navigate('/dashboard')}
              />
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-violet-100 bg-violet-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-900">Keep the momentum going!</p>
                <p className="mt-1 text-[11px] text-slate-600">Consistent practice is the key to reaching your target band.</p>
              </div>
              <button
                type="button"
                onClick={() => startExam('reading')}
                className="h-10 rounded-lg border-0 bg-violet-600 px-6 text-[13px] font-bold text-white hover:bg-violet-700"
              >
                Take Another Mock Test
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
