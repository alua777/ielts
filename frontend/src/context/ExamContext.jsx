import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const API = 'http://localhost:5000/api';

// Stage order and their durations in seconds
const STAGES = ['reading', 'listening', 'writing', 'speaking'];
const STAGE_DURATION = {
  reading:   60 * 60,       // 60 min
  listening: 30 * 60,       // 30 min
  writing:   60 * 60,       // 60 min
  speaking:  15 * 60,       // 15 min
};
const STAGE_ROUTES = {
  reading:   '/reading',
  listening: '/listening',
  writing:   '/writing',
  speaking:  '/speaking',
};

const ExamContext = createContext();

export function ExamProvider({ children }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  // ── Core exam state ───────────────────────────────────────────
  const [examActive, setExamActive] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [stage, setStage] = useState(null);        // 'reading' | 'listening' | etc
  const [part, setPart] = useState(1);             // part within stage
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState({});      // { questionId: answer }
  const [finished, setFinished] = useState(false);
  const [passageIndex, setPassageIndex] = useState(0);
  const [totalPassages, setTotalPassages] = useState(1);

  const intervalRef = useRef(null);

  // ── Timer tick ────────────────────────────────────────────────
  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            handleTimeUp();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // ── When time runs out auto-advance ──────────────────────────
  const handleTimeUp = useCallback(() => {
    const idx = STAGES.indexOf(stage);
    if (idx < STAGES.length - 1) {
      goToStage(STAGES[idx + 1]);
    } else {
      finishExam();
    }
  }, [stage]);

  // ── Start a brand new exam ────────────────────────────────────
  const startExam = useCallback(async (startStage = 'reading') => {
    try {
      const res = await fetch(`${API}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section: 'full' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAttemptId(data.attempt_id);
      setAnswers({});
      setFinished(false);
      setExamActive(true);
      setPart(1);
      goToStage(startStage, data.attempt_id);
    } catch (err) {
      console.error('Failed to start exam:', err.message);
    }
  }, [token]);

  // ── Navigate to a stage ───────────────────────────────────────
  const goToStage = useCallback((newStage) => {
    setStage(newStage);
    setPart(1);
    setPassageIndex(0); 
    setTimeLeft(STAGE_DURATION[newStage]);
    setRunning(true);
    navigate(STAGE_ROUTES[newStage]);
  }, [navigate]);

  // ── Advance to next stage (Next button) ───────────────────────
  const nextStage = useCallback(async () => {
    // Save current answers before moving on
    await submitCurrentAnswers();

    const idx = STAGES.indexOf(stage);
    if (idx < STAGES.length - 1) {
      goToStage(STAGES[idx + 1]);
    } else {
      finishExam();
    }
  }, [stage, answers, attemptId]);

  // ── Go back to previous stage (Back button) ──────────────────
  const prevStage = useCallback(() => {
    const idx = STAGES.indexOf(stage);
    // Can't go back from speaking, can't go before reading
    if (idx <= 0 || stage === 'speaking') return;
    goToStage(STAGES[idx - 1]);
  }, [stage]);

  // ── Can user go back? ─────────────────────────────────────────
  const canGoBack = stage && STAGES.indexOf(stage) > 0 && stage !== 'speaking';

  // ── Save an answer ────────────────────────────────────────────
  const saveAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  // ── Submit answers for current stage to backend ───────────────
  const submitCurrentAnswers = useCallback(async () => {
    if (!attemptId || Object.keys(answers).length === 0) return;
    try {
      const payload = Object.entries(answers).map(([question_id, user_answer]) => ({
        question_id,
        user_answer,
      }));
      await fetch(`${API}/attempts/${attemptId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to submit answers:', err.message);
    }
  }, [attemptId, answers, token]);

  // ── Finish exam ───────────────────────────────────────────────
  const finishExam = useCallback(async () => {
    await submitCurrentAnswers();
    try {
      const elapsed = STAGE_DURATION[stage] - timeLeft;
      await fetch(`${API}/attempts/${attemptId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ time_taken_seconds: elapsed }),
      });
    } catch (err) {
      console.error('Failed to complete attempt:', err.message);
    }
    setRunning(false);
    setFinished(true);
    setExamActive(false);
    navigate('/results');
  }, [attemptId, answers, token, stage, timeLeft]);

  const abandonExam = useCallback(async () => {
    try {
      if (attemptId) {
        const res = await fetch(`${API}/attempts/${attemptId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok && res.status !== 404) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to abandon attempt');
        }
      }
    } catch (err) {
      console.error('Failed to abandon attempt:', err.message);
    } finally {
      clearInterval(intervalRef.current);
      setRunning(false);
      setExamActive(false);
      setFinished(false);
      setAttemptId(null);
      setStage(null);
      setPart(1);
      setTimeLeft(0);
      setAnswers({});
      setPassageIndex(0);
      setTotalPassages(1);
      navigate('/dashboard');
    }
  }, [attemptId, navigate, token]);

  // ── Advance part within a stage (e.g. Passage 1 → Passage 2) ─
  const nextPart = useCallback(() => setPart(p => p + 1), []);
  const prevPart = useCallback(() => setPart(p => Math.max(1, p - 1)), []);

  // ── Toggle timer pause ────────────────────────────────────────
  const toggleTimer = useCallback(() => setRunning(r => !r), []);

  return (
    <ExamContext.Provider value={{
      examActive,
      attemptId,
      stage,
      part,
      timeLeft,
      running,
      answers,
      finished,
      canGoBack,
      STAGES,
      STAGE_DURATION,
      passageIndex,
      setPassageIndex,    
      totalPassages,      
      setTotalPassages,   
      startExam,
      nextStage,
      prevStage,
      nextPart,
      prevPart,
      saveAnswer,
      toggleTimer,
      finishExam,
      abandonExam,
    }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  return useContext(ExamContext);
}
