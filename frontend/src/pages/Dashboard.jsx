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

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const { startExam } = useExam();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/attempts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => response.json())
      .then(data => setAttempts(data.attempts || []))
      .catch(() => setAttempts([]));
  }, [token]);

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
    <div className="flex min-h-dvh bg-[#f7f9fd] text-slate-900 lg:h-dvh lg:overflow-hidden">
      <DashboardSidebar
        onStartExam={() => startExam('reading')}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:overflow-hidden lg:px-6">
        <DashboardHeader
          firstName={firstName}
          user={user}
          latestAttempt={latestAttempt}
          targetBand={targetBand}
          onProfile={() => navigate('/profile')}
          onSettings={() => navigate('/settings')}
          onLogout={handleLogout}
        />

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.02fr_1.02fr_1.28fr]">
          <OverallBandCard averageBand={averageBand} targetBand={targetBand} />
          <TodayPlanCard weeklyDone={weeklyDone} onContinue={() => startExam('reading')} />
          <SkillsBreakdownCard skills={skillScores} />
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
        </div>
      </main>
    </div>
  );
}
