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
      <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-5 px-6 pb-3 pt-4">
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

      <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_0.95fr] gap-4 px-6 pb-4">
        <PassagePanel
          passage={passage}
          groups={groups}
          passageIndex={currentIndex}
        />
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
  );
}
