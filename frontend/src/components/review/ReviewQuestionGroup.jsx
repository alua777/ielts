import { Check, X } from 'lucide-react';

function isCorrect(result) {
  return result?.is_correct === 1 || result?.is_correct === true;
}

function optionMatches(option, answer) {
  if (!answer) return false;
  const normalizedOption = option.trim().toLowerCase();
  const normalizedAnswer = answer.trim().toLowerCase();
  return normalizedOption === normalizedAnswer
    || normalizedOption.startsWith(`${normalizedAnswer}.`)
    || normalizedOption.startsWith(`${normalizedAnswer})`);
}

export default function ReviewQuestionGroup({ group, results }) {
  return (
    <section className="mb-10">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="text-[11px] font-bold uppercase text-slate-400">
          Questions {group.from_number}-{group.to_number}
        </span>
        <span className="text-[11px] font-semibold uppercase text-slate-300">
          {group.question_type.replace('_', ' ')}
        </span>
      </div>
      <p className="mb-5 text-[13px] leading-5 text-slate-500">{group.instruction}</p>

      <div className="space-y-4">
        {(group.questions || []).map(question => {
          const result = results[question.id] || {
            user_answer: '',
            correct_answer: question.correct_answer,
            is_correct: false,
          };
          const correct = isCorrect(result);
          return (
            <div
              id={`review-question-${question.id}`}
              key={question.id}
              className={`scroll-mt-24 rounded-lg border p-4 ${
                correct ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white ${
                  correct ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {question.question_number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-6 text-slate-800">{question.question_text}</p>

                  {group.question_type === 'mcq' ? (
                    <div className="mt-3 space-y-2">
                      {(question.options || []).map(option => {
                        const selected = optionMatches(option, result?.user_answer);
                        const rightOption = optionMatches(option, result?.correct_answer);
                        return (
                          <div key={option} className={`rounded-lg border px-4 py-2.5 text-[13px] ${
                            rightOption
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : selected
                                ? 'border-red-300 bg-red-50 text-red-800'
                                : 'border-slate-200 bg-white text-slate-500'
                          }`}>
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  ) : group.question_type === 'true_false' ? (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {['True', 'False', 'Not Given'].map(option => {
                        const selected = option === result?.user_answer;
                        const rightOption = option === result?.correct_answer;
                        return (
                          <div key={option} className={`rounded-lg border py-2 text-center text-[12px] font-bold ${
                            rightOption
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : selected
                                ? 'border-red-300 bg-red-50 text-red-800'
                                : 'border-slate-200 bg-white text-slate-500'
                          }`}>
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`mt-3 rounded-lg border px-4 py-3 text-[13px] font-bold ${
                      correct
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-red-300 bg-red-50 text-red-800'
                    }`}>
                      Your answer: {result?.user_answer || 'No answer'}
                    </div>
                  )}

                  <div className={`mt-2 flex items-center gap-2 text-[12px] font-semibold ${
                    correct ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {correct ? <Check size={14} /> : <X size={14} />}
                    {correct ? 'Correct answer' : `Correct answer: ${result?.correct_answer || 'Not available'}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
