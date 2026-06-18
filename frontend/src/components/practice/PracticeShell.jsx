import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';

export default function PracticeShell({ children, activeLabel = 'Practice' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { startExam } = useExam();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-dvh bg-[#f7f9fd] text-slate-900">
      <DashboardSidebar
        activeLabel={activeLabel}
        onStartExam={() => startExam('reading')}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
      <main className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
