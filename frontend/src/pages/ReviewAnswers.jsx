import { createElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Headphones, Mic2, PenLine } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PassagePanel from '../components/exam/PassagePanel';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import ReviewQuestionGroup from '../components/review/ReviewQuestionGroup';
import { useAuth } from '../context/AuthContext';
import ResultsSkeleton from '../components/skeletons/ResultsSkeleton';
import MockFeedbackReview from '../components/review/MockFeedbackReview';
import { API } from '../lib/api';

export default function ReviewAnswers() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const [section, setSection] = useState(() => searchParams.get('section') || 'reading');
  const [passageIndex, setPassageIndex] = useState(0);
  const [passages, setPassages] = useState({ reading: [], listening: [] });
  const [answerRows, setAnswerRows] = useState([]);
  const [mockFeedback, setMockFeedback] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      navigate('/results', { replace: true });
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/attempts/${attemptId}`, { headers }).then(response => response.json()),
      fetch(`${API}/passages?section=reading`, { headers }).then(response => response.json()),
      fetch(`${API}/passages?section=listening`, { headers }).then(response => response.json()),
    ])
      .then(([attemptData, readingData, listeningData]) => {
        setAnswerRows(attemptData.answers || []);
        setMockFeedback(attemptData.mock_feedback || null);
        setPassages({
          reading: readingData.passages || [],
          listening: listeningData.passages || [],
        });
      })
      .finally(() => setLoading(false));
  }, [attemptId, navigate, token]);

  const results = useMemo(
    () => Object.fromEntries(answerRows.map(answer => [answer.question_id, answer])),
    [answerRows]
  );
  const sectionPassages = passages[section] || [];
  const currentPassages = section === 'reading'
    ? sectionPassages.slice(passageIndex, passageIndex + 1)
    : sectionPassages;
  const allQuestions = sectionPassages
    .flatMap(passage => passage.groups || [])
    .flatMap(group => group.questions || [])
    .sort((a, b) => a.question_number - b.question_number);
  const answerMap = Object.fromEntries(allQuestions.map(question => [
    question.id,
    results[question.id]?.user_answer || '',
  ]));
  const statusMap = Object.fromEntries(allQuestions.map(question => [
    question.id,
    results[question.id]?.is_correct === 1 || results[question.id]?.is_correct === true
      ? 'correct'
      : 'incorrect',
  ]));
  const selectedQuestionId = activeQuestionId || allQuestions[0]?.id || null;

  const selectQuestion = questionId => {
    setActiveQuestionId(questionId);
    if (section === 'reading') {
      const targetIndex = sectionPassages.findIndex(passage =>
        (passage.groups || []).some(group =>
          (group.questions || []).some(question => question.id === questionId)
        )
      );
      if (targetIndex !== passageIndex) {
        setPassageIndex(targetIndex);
        window.setTimeout(() => {
          document.getElementById(`review-question-${questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 0);
        return;
      }
    }
    document.getElementById(`review-question-${questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) {
    return <ResultsSkeleton />;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
      <header className="relative flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-6">
        <button type="button" onClick={() => navigate('/results')} className="flex items-center gap-2 bg-transparent text-[13px] font-bold text-slate-700">
          <ArrowLeft size={16} /> Back to Results
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-extrabold text-slate-950">Review Answers</h1>
      </header>

      <div className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {[
            ['reading', BookOpen],
            ['listening', Headphones],
            ['writing', PenLine],
            ['speaking', Mic2],
          ].map(([value, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSection(value);
                setPassageIndex(0);
                setActiveQuestionId(null);
              }}
              className={`flex h-9 items-center gap-2 rounded-md px-5 text-[12px] font-bold ${
                section === value ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              {createElement(Icon, { size: 15 })} {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
        {(section === 'reading' || section === 'listening') && (
          <QuestionNavigator
            questions={allQuestions}
            answers={answerMap}
            activeQuestionId={selectedQuestionId}
            onQuestionSelect={selectQuestion}
            statusMap={statusMap}
          />
        )}
      </div>

      {section === 'writing' || section === 'speaking' ? (
        <MockFeedbackReview section={section} feedback={mockFeedback?.[section]} />
      ) : section === 'reading' ? (
        <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_0.9fr] gap-4 p-4 px-6">
          <PassagePanel passage={currentPassages[0]} groups={currentPassages[0]?.groups || []} passageIndex={passageIndex} />
          <section className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            {(currentPassages[0]?.groups || []).map(group => <ReviewQuestionGroup key={group.id} group={group} results={results} />)}
          </section>
        </div>
      ) : (
        <div className="min-h-0 flex-1 p-4 px-6">
          <section className="mx-auto h-full max-w-[1100px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            {currentPassages.map(passage => (
              <div key={passage.id}>
                <h2 className="mb-5 text-[15px] font-bold text-slate-900">{passage.title}</h2>
                {(passage.groups || []).map(group => <ReviewQuestionGroup key={group.id} group={group} results={results} />)}
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
