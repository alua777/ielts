import { TriangleAlert } from 'lucide-react';

export default function QuitModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <TriangleAlert size={26} strokeWidth={2.1} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Quit the exam?</p>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            If you leave now,{' '}
            <span className="font-semibold text-gray-700">all your progress will be lost</span>{' '}
            and this attempt won't be saved. You'll need to start from the beginning next time.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Keep going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Yes, quit
          </button>
        </div>
      </div>
    </div>
  );
}
