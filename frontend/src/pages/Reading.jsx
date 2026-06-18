import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { ExamError, ExamLoader } from '../components/exam/ExamLoader';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import PassagePanel from '../components/exam/PassagePanel';
import PassageTabs from '../components/exam/PassageTabs';
import QuestionsPanel from '../components/exam/QuestionsPanel';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ReadingPractice() {
  const { token } = useAuth();
  const {
    answers,
    saveAnswer,
    nextStage,
    attemptId,
    examActive,
    startExam,
    passageIndex,
    setPassageIndex,
    setTotalPassages,
  } = useExam();

  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [mobileView, setMobileView] = useState('passage');
  const pendingQuestionRef = useRef(null);

  useEffect(() => {
    if (!examActive && !attemptId) startExam('reading');
  }, [attemptId, examActive, startExam]);

  useEffect(() => {
    fetch(`${API}/passages?section=reading`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        if (data.passages?.length > 0) {
          setPassages(data.passages);
          setTotalPassages?.(data.passages.length);
        } else {
          setError('No passages found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load passage.');
        setLoading(false);
      });
  }, [setTotalPassages, token]);

  const currentIndex = passageIndex ?? 0;
  const passage = passages[currentIndex];
  const groups = passage?.groups || [];
  const isLastPassage = currentIndex === passages.length - 1;
  const allQuestions = passages
    .flatMap(item => item.groups || [])
    .flatMap(group => group.questions || [])
    .sort((a, b) => a.question_number - b.question_number);
  const selectedQuestionId = activeQuestionId || groups[0]?.questions?.[0]?.id || null;

  useEffect(() => {
    if (!pendingQuestionRef.current) return;
    const questionId = pendingQuestionRef.current;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`question-${questionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      pendingQuestionRef.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentIndex]);

  const selectQuestion = questionId => {
    setActiveQuestionId(questionId);
    setMobileView('questions');
    const targetPassageIndex = passages.findIndex(item =>
      (item.groups || []).some(group =>
        (group.questions || []).some(question => question.id === questionId)
      )
    );

    if (targetPassageIndex !== currentIndex) {
      pendingQuestionRef.current = questionId;
      setPassageIndex(targetPassageIndex);
      return;
    }

    document.getElementById(`question-${questionId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  if (loading) return <ExamLoader message="Loading passage..." />;
  if (error) return <ExamError message={error} />;

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0 space-y-3 px-4 pb-3 pt-3 sm:px-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-5 lg:space-y-0 lg:pt-4">
        <div className="grid grid-cols-2 rounded-lg bg-slate-200 p-1 lg:hidden">
          {['passage', 'questions'].map(view => (
            <button key={view} type="button" onClick={() => setMobileView(view)} className={`min-h-11 rounded-md text-[13px] font-bold capitalize ${mobileView === view ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>
              {view}
            </button>
          ))}
        </div>
        <PassageTabs
          passages={passages}
          currentIndex={currentIndex}
          onSelect={setPassageIndex}
          label="Passage"
        />
        <QuestionNavigator
          questions={allQuestions}
          answers={answers}
          activeQuestionId={selectedQuestionId}
          onQuestionSelect={selectQuestion}
        />
      </div>

      <div className="min-h-0 flex-1 px-4 pb-4 sm:px-6 lg:grid lg:grid-cols-[1.15fr_0.95fr] lg:gap-4">
        <div className={`h-full min-h-0 ${mobileView === 'passage' ? 'block' : 'hidden'} lg:block`}>
          <PassagePanel passage={passage} groups={groups} passageIndex={currentIndex} />
        </div>
        <div className={`h-full min-h-0 ${mobileView === 'questions' ? 'block' : 'hidden'} lg:block`}>
          <QuestionsPanel
            groups={groups}
            answers={answers}
            saveAnswer={saveAnswer}
            isLastPassage={isLastPassage}
            onNext={nextStage}
            onNextLabel="Submit Reading - Continue to Listening"
            onNextPassage={() => setPassageIndex(index => index + 1)}
            onNextPassageLabel="Next Passage"
          />
        </div>
      </div>
    </div>
  );
}
