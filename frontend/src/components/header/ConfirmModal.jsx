import { ArrowRight, Flag } from 'lucide-react';

export default function ConfirmModal({ stageName, isFinish, onConfirm, onCancel }) {
  const Icon = isFinish ? Flag : ArrowRight;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
          <Icon size={26} strokeWidth={2.1} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            {isFinish ? 'Finish the exam?' : `Move to ${stageName}?`}
          </p>
          <p className="mt-1.5 text-sm text-gray-500">
            {isFinish
              ? "You won't be able to return to any section once you finish."
              : `Make sure you've completed this section. You're about to start ${stageName}.`}
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            {isFinish ? 'Finish' : "Yes, I'm ready"}
          </button>
        </div>
      </div>
    </div>
  );
}
