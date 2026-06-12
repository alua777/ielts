import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import ExamHeader   from './ExamHeader';
import NormalHeader from './NormalHeader';

export default function Header() {
  const { examActive, stage, part, timeLeft, canGoBack, nextStage, prevStage, abandonExam } = useExam();
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quitOpen,    setQuitOpen]    = useState(false);

  useEffect(() => {
    if (!examActive || !stage) return undefined;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [examActive, stage]);

  if (examActive && stage) {
    return (
      <ExamHeader
        stage={stage}
        part={part}
        timeLeft={timeLeft}
        canGoBack={canGoBack}
        nextStage={nextStage}
        prevStage={prevStage}
        abandonExam={abandonExam}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        quitOpen={quitOpen}
        setQuitOpen={setQuitOpen}
      />
    );
  }

  if (['/', '/dashboard', '/results', '/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return <NormalHeader />;
}
