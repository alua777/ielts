import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FeedbackReport from '../components/practice/FeedbackReport';
import PracticeShell from '../components/practice/PracticeShell';
import ResultsSkeleton from '../components/skeletons/ResultsSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

export default function PracticeFeedback() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/ai-feedback/${id}`, token)
      .then(data => setFeedback(data.feedback))
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  return (
    <PracticeShell>
      {loading ? <ResultsSkeleton /> : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <button type="button" onClick={() => navigate(`/practice/${feedback.section}`)} className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
              <ArrowLeft size={16} /> Back to {feedback.section} practice
            </button>
            <button type="button" onClick={() => navigate(`/practice/test/${feedback.test_id}`)} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-violet-700">
              <RotateCcw size={16} /> Try again
            </button>
          </header>
          <FeedbackReport feedback={feedback} />
        </>
      )}
    </PracticeShell>
  );
}
