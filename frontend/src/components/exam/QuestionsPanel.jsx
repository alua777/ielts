import { ArrowRight } from 'lucide-react';
import QuestionGroup from './QuestionGroup';

export default function QuestionsPanel({
  groups,
  answers,
  saveAnswer,
  isLastPassage,
  onNext,
  onNextLabel = 'Submit & Continue',
  onNextPassage,
  onNextPassageLabel = 'Next Passage',
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-lg bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex-1 p-4 sm:p-8">
        {groups.map(group => (
          <QuestionGroup
            key={group.id}
            group={group}
            answers={answers}
            saveAnswer={saveAnswer}
          />
        ))}
      </div>

      <div className="sticky bottom-0 shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-8 sm:py-5">
        {isLastPassage ? (
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold text-[14px] hover:bg-violet-700 active:bg-violet-800 transition-colors border-0 cursor-pointer flex items-center justify-center gap-2"
          >
            {onNextLabel}
            <ArrowRight size={16} strokeWidth={2.3} />
          </button>
        ) : (
          <button
            onClick={onNextPassage}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-[14px] hover:bg-gray-800 transition-colors border-0 cursor-pointer flex items-center justify-center gap-2"
          >
            {onNextPassageLabel}
            <ArrowRight size={16} strokeWidth={2.3} />
          </button>
        )}
      </div>
    </div>
  );
}
