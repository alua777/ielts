import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import FeedbackCard from '../components/results/FeedbackCard';
import PerformanceCard from '../components/results/PerformanceCard';
import QuickStatsCard from '../components/results/QuickStatsCard';
import ResultsOverview from '../components/results/ResultsOverview';
import ResultsPanel from '../components/results/ResultsPanel';
import ResultsTrendCard from '../components/results/ResultsTrendCard';
import SectionScoresCard from '../components/results/SectionScoresCard';
import StrengthsCard from '../components/results/StrengthsCard';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';

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
  const [attempts, setAttempts] = useState([]);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API}/attempts`, { headers })
      .then(response => response.json())
      .then(async data => {
        const history = data.attempts || [];
        const selectedId = attemptId || history.find(item => item.status === 'completed')?.id || history[0]?.id;
        setAttempts(history);
        if (!selectedId) throw new Error('No results found.');

        const response = await fetch(`${API}/attempts/${selectedId}`, { headers });
        const detail = await response.json();
        if (!response.ok) throw new Error(detail.error || 'Failed to load results.');
        setResult(detail.attempt);
        setAnswers(detail.answers || []);
      })
      .catch(fetchError => setError(fetchError.message || 'Failed to load results.'))
      .finally(() => setLoading(false));
  }, [attemptId, token]);

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
    writing: 6,
    speaking: 6,
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
    return <div className="grid min-h-dvh place-items-center bg-slate-50 text-[13px] font-semibold text-violet-600">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-red-500">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-[13px] font-bold text-white">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-[#f7f9fd] text-slate-900 lg:h-dvh lg:overflow-hidden">
      <DashboardSidebar
        activeLabel="Results"
        onStartExam={() => startExam('reading')}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-4 flex items-end justify-between">
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-bold text-violet-700"
              >
                <Download size={16} /> Download Report
              </button>
              <button
                type="button"
                onClick={() => setShowReview(value => !value)}
                className="h-10 rounded-lg border-0 bg-violet-600 px-5 text-[13px] font-bold text-white hover:bg-violet-700"
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

            <div className="grid grid-cols-[1.15fr_1.05fr_0.9fr] gap-3">
              <SectionScoresCard scores={scores} />
              <ResultsTrendCard values={trendValues} />
              <StrengthsCard accuracy={accuracy} />
              <PerformanceCard sectionRows={sectionRows} />
              <FeedbackCard writingScore={scores.writing} speakingScore={scores.speaking} />
              <QuickStatsCard
                averageTime={averageTime}
                attemptsCount={completedAttempts.length}
                improvement={improvement}
                onStudyPlan={() => navigate('/dashboard')}
              />
            </div>

            {showReview && (
              <ResultsPanel title={`Answer Review (${totalGraded} graded)`}>
                <div className="grid grid-cols-2 gap-3">
                  {gradedAnswers.map((answer, index) => {
                    const correct = answer.is_correct === 1 || answer.is_correct === true;
                    return (
                      <div key={answer.id || index} className={`flex gap-3 rounded-lg border p-3 ${correct ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                        {correct
                          ? <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                          : <X size={16} className="mt-0.5 shrink-0 text-red-500" />}
                        <div>
                          <p className="text-[12px] leading-5 text-slate-700">{answer.question_text}</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            Your answer: {answer.user_answer || 'No answer'}
                            {!correct && answer.correct_answer ? ` · Correct: ${answer.correct_answer}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ResultsPanel>
            )}

            <div className="flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50 px-5 py-4">
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
