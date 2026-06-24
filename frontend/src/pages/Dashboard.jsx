import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import OverallBandCard from '../components/dashboard/OverallBandCard';
import TodayPlanCard from '../components/dashboard/TodayPlanCard';
import SkillsBreakdownCard from '../components/dashboard/SkillsBreakdownCard';
import WeakAreasCard from '../components/dashboard/WeakAreasCard';
import BandTrendCard from '../components/dashboard/BandTrendCard';
import LatestFeedbackCard from '../components/dashboard/LatestFeedbackCard';
import MockHistoryCard from '../components/dashboard/MockHistoryCard';
import StudyTimeCard from '../components/dashboard/StudyTimeCard';
import MomentumCard from '../components/dashboard/MomentumCard';
import { clampBand, DASHBOARD_SKILLS } from '../components/dashboard/dashboardConfig';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import ErrorState from '../components/ui/ErrorState';
import NewUserDashboard from '../components/dashboard/NewUserDashboard';
import { API } from '../lib/api';

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const { startExam } = useExam();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [survey, setSurvey] = useState(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/attempts`, { headers }).then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load dashboard.');
        return data;
      }),
      user?.id
        ? fetch(`${API}/onboarding-survey/${user.id}`, { headers }).then(response => response.json()).catch(() => ({ survey: null }))
        : Promise.resolve({ survey: null }),
    ])
      .then(([attemptData, surveyData]) => {
        setAttempts(attemptData.attempts || []);
        setSurvey(surveyData.survey || null);
      })
      .catch(fetchError => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, [token, user?.id]);

  const completed = useMemo(
    () => attempts.filter(attempt => attempt.status === 'completed'),
    [attempts]
  );

  const averageBand = completed.length
    ? completed.reduce((sum, attempt) => sum + Number(attempt.band_score || 0), 0) / completed.length
    : 0;
  const targetBand = 7;
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const weeklyDone = completed.filter(attempt => {
    const date = new Date(attempt.completed_at || attempt.started_at);
    return (now - date.getTime()) / 86400000 < 7;
  }).length;
  const trendValues = completed.slice(0, 10).reverse().map(attempt => Number(attempt.band_score || 0));
  const latest = completed[0];
  const latestAttempt = latest
    ? new Date(latest.completed_at || latest.started_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No attempt yet';

  const skillScores = DASHBOARD_SKILLS.map((skill, index) => {
    const relevant = completed.filter(attempt => attempt.section === skill.key || attempt.section === 'full');
    const value = relevant.length
      ? relevant.reduce((sum, attempt) => sum + Number(attempt.band_score || 0), 0) / relevant.length
      : Math.max(0, averageBand - index * 0.25);
    return { ...skill, value: clampBand(value) };
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell flex min-h-dvh text-slate-900 lg:h-dvh lg:overflow-hidden">
      <DashboardSidebar
        onStartExam={() => startExam('reading')}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-20 sm:px-6 lg:overflow-hidden lg:px-6 lg:py-4">
        <DashboardHeader
          firstName={firstName}
          user={user}
          latestAttempt={latestAttempt}
          targetBand={targetBand}
          onProfile={() => navigate('/profile')}
          onSettings={() => navigate('/settings')}
          onLogout={handleLogout}
        />

        {loading ? <DashboardSkeleton /> : error ? (
          <ErrorState compact message={error} onRetry={() => window.location.reload()} />
        ) : completed.length === 0 ? (
          <NewUserDashboard
            survey={survey}
            onStartExam={() => startExam('reading')}
            onPractice={() => navigate(survey?.weak_sections?.[0] ? `/practice/${survey.weak_sections[0]}` : '/practice')}
            onSurvey={() => navigate('/onboarding')}
          />
        ) : <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.02fr_1.02fr_1.28fr]">
          <OverallBandCard averageBand={averageBand} targetBand={targetBand} />

          <SkillsBreakdownCard skills={skillScores} />
          <TodayPlanCard weeklyDone={weeklyDone} onContinue={() => startExam('reading')} />
          <WeakAreasCard />
          <BandTrendCard values={trendValues} />
          <LatestFeedbackCard averageBand={averageBand} />
          <MockHistoryCard completed={completed} onViewAll={() => navigate('/results')} />
          <StudyTimeCard skills={skillScores} completedCount={completed.length} />
          <MomentumCard
            streak={Math.max(1, weeklyDone)}
            completed={completed.length}
            weekly={weeklyDone}
          />
        </div>}
      </main>
    </div>
  );
}
