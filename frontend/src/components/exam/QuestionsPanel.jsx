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
    <div className="bg-white rounded-2xl overflow-y-auto flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="p-8 flex-1">
        {groups.map(group => (
          <QuestionGroup
            key={group.id}
            group={group}
            answers={answers}
            saveAnswer={saveAnswer}
          />
        ))}
      </div>

      <div className="px-8 py-5 border-t border-gray-100 shrink-0">
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
