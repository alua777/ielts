import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, FilePenLine, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { ExamError, ExamLoader } from '../components/exam/ExamLoader';
import AssessmentCriteria from '../components/exam/AssessmentCriteria';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Writing() {
  const { token } = useAuth();
  const {
    answers,
    saveAnswer,
    nextStage,
    passageIndex,
    setPassageIndex,
    setTotalPassages,
  } = useExam();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/passages?section=writing`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        if (data.passages?.length > 0) {
          setTasks(data.passages);
          setTotalPassages?.(data.passages.length);
        } else {
          setError('No writing tasks found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load writing tasks.');
        setLoading(false);
      });
  }, [setTotalPassages, token]);

  const currentIndex = passageIndex ?? 0;
  const task = tasks[currentIndex];
  const group = task?.groups?.[0];
  const question = group?.questions?.[0];
  const essayKey = question?.id;
  const response = answers[essayKey] || '';
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const isTaskOne = currentIndex === 0;
  const minimumWords = isTaskOne ? 150 : 250;
  const isLastTask = currentIndex === tasks.length - 1;
  const timeNote = isTaskOne
    ? 'You should spend about 20 minutes on this task.'
    : 'You should spend about 40 minutes on this task.';
  const progress = Math.min((wordCount / minimumWords) * 100, 100);

  if (loading) return <ExamLoader message="Loading writing task..." />;
  if (error) return <ExamError message={error} />;

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-slate-50">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
          {tasks.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPassageIndex(index)}
            className={`min-h-11 rounded-md border-0 px-3 text-[12px] font-bold transition sm:px-5 sm:text-[13px] ${
                currentIndex === index
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Task {index + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 place-items-center rounded-lg ${
            wordCount >= minimumWords
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-violet-50 text-violet-600'
          }`}>
            {wordCount >= minimumWords
              ? <CheckCircle2 size={18} />
              : <FilePenLine size={18} />}
          </span>
          <div>
            <p className="text-[13px] font-bold tabular-nums text-slate-900">
              {wordCount} words
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              Minimum {minimumWords}
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 py-3 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden lg:py-4">
        <section className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">
            <p className="mb-2 text-[11px] font-bold uppercase text-violet-600">
              Writing Task {currentIndex + 1}
            </p>
            <h1 className="text-[24px] font-bold leading-tight text-slate-950">
              {task?.title || `Task ${currentIndex + 1}`}
            </h1>



            <div className="my-6 flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3">
              <Info size={17} className="mt-0.5 shrink-0 text-violet-600" />
              <p className="text-[13px] font-medium leading-5 text-violet-800">
                {timeNote} Write at least {minimumWords} words.
              </p>
            </div>

            <div className="space-y-5">
              <p className="whitespace-pre-line text-[14px] font-bold leading-7 text-slate-900">
                {group?.instruction
                  ?.replace(timeNote, '')
                  .replace(`Write at least ${minimumWords} words.`, '')
                  .trim()}
              </p>
              <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
                {question?.question_text}
              </p>
            </div>

            <AssessmentCriteria className="mt-7" />

            {isTaskOne && (
              <div className="mt-7 flex min-h-52 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <p className="text-[12px] font-semibold text-slate-400">
                  Task chart or diagram
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-[65vh] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-slate-900">Your response</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  Organize your ideas into clear paragraphs.
                </p>
              </div>
              <p className={`text-[12px] font-bold tabular-nums ${
                wordCount >= minimumWords ? 'text-emerald-600' : 'text-violet-600'
              }`}>
                {Math.round(progress)}%
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  wordCount >= minimumWords ? 'bg-emerald-500' : 'bg-violet-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <textarea
            value={response}
            onChange={event => saveAnswer(essayKey, event.target.value)}
            placeholder="Write your response here..."
            className="min-h-0 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 p-5 text-[15px] leading-7 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />

          <div className="sticky bottom-0 mt-4 border-t border-slate-100 bg-white pt-4">
            {wordCount < minimumWords && (
              <p className="mb-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-amber-600">
                <AlertTriangle size={14} />
                {minimumWords - wordCount} words below the recommended minimum
              </p>
            )}

            <button
              type="button"
              onClick={isLastTask
                ? nextStage
                : () => setPassageIndex(currentIndex + 1)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-0 bg-violet-600 text-[14px] font-bold text-white transition hover:bg-violet-700"
            >
              {isLastTask ? 'Submit Writing' : 'Continue to Task 2'}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
