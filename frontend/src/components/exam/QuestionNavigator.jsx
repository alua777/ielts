import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

function hasAnswer(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

export default function QuestionNavigator({
  questions,
  answers,
  activeQuestionId,
  onQuestionSelect,
  statusMap,
}) {
  const railRef = useRef(null);
  const sortedQuestions = [...questions].sort(
    (a, b) => a.question_number - b.question_number
  );

  const moveRail = direction => {
    railRef.current?.scrollBy({
      left: direction * Math.max(240, railRef.current.clientWidth * 0.7),
      behavior: 'smooth',
    });
  };

  return (
    <nav
      aria-label="Question navigation"
      className="min-w-0 flex-1"
    >
      <div className="mx-auto flex max-w-[1060px] items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => moveRail(-1)}
          aria-label="Show previous questions"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={railRef}
          className="flex min-w-0 gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sortedQuestions.map(question => {
            const answered = hasAnswer(answers[question.id]);
            const active = activeQuestionId === question.id;
            const reviewStatus = statusMap?.[question.id];

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => onQuestionSelect(question.id)}
                aria-label={`Go to question ${question.question_number}`}
                className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-md border text-[11px] font-bold transition ${
                  active
                    ? reviewStatus === 'correct'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : reviewStatus === 'incorrect'
                        ? 'border-red-600 bg-red-600 text-white shadow-sm'
                        : 'border-violet-600 bg-violet-600 text-white shadow-sm'
                    : reviewStatus === 'correct'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : reviewStatus === 'incorrect'
                        ? 'border-red-200 bg-red-50 text-red-700'
                    : answered
                      ? 'border-violet-100 bg-violet-50 text-violet-700 hover:border-violet-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                }`}
              >
                {question.question_number}
                {answered && !active && !reviewStatus && (
                  <Check
                    size={7}
                    strokeWidth={3}
                    className="absolute right-px top-px text-violet-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => moveRail(1)}
          aria-label="Show next questions"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
