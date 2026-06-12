import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import GridLogo from './GridLogo';
import QuitModal from './QuitModal';
import ConfirmModal from './ConfirmModal';

const STAGE_LABELS = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
};
const STAGES = ['reading', 'listening', 'writing', 'speaking'];

export default function ExamHeader({
  stage, part, timeLeft, canGoBack,
  nextStage, prevStage, abandonExam,
  confirmOpen, setConfirmOpen,
  quitOpen, setQuitOpen,
}) {
  const fmt = (seconds) => {
    if (seconds == null) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const stageIndex = STAGES.indexOf(stage);
  const isFinish = stageIndex >= STAGES.length - 1;
  const nextStageName = !isFinish ? STAGE_LABELS[STAGES[stageIndex + 1]] : null;
  const nextLabel = isFinish ? 'Finish Exam' : STAGE_LABELS[STAGES[stageIndex + 1]];
  const prevLabel = stageIndex > 0 ? STAGE_LABELS[STAGES[stageIndex - 1]] : null;

  return (
    <>
      {confirmOpen && (
        <ConfirmModal
          stageName={nextStageName}
          isFinish={isFinish}
          onConfirm={() => { setConfirmOpen(false); nextStage(); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
      {quitOpen && (
        <QuitModal
          onConfirm={() => { setQuitOpen(false); abandonExam(); }}
          onCancel={() => setQuitOpen(false)}
        />
      )}

      <header
        className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-purple-100 bg-white px-6"
      >
        <div className="w-44 flex items-center gap-3">
          <button
            onClick={() => setQuitOpen(true)}
            className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50 transition-colors border-0 bg-transparent cursor-pointer group"
            title="Quit exam"
          >
            <GridLogo />
            <span className="text-[14px] font-bold text-gray-900 tracking-tight group-hover:text-violet-600 transition-colors">
              IELTS Buddy
            </span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-semibold text-purple-500 uppercase tracking-widest">
            {STAGE_LABELS[stage]}{part > 1 ? ` · Part ${part}` : ''}
          </span>
          <span className={`text-2xl font-bold tabular-nums ${
            timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'
          }`}>
            {fmt(timeLeft)}
          </span>
        </div>

        <div className="w-44 flex items-center justify-end gap-2">
          {canGoBack && (
            <button
              onClick={prevStage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-200 transition-colors border-0 cursor-pointer"
            >
              <ArrowLeft size={15} strokeWidth={2.3} />
              {prevLabel}
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors border-0 cursor-pointer"
          >
            {nextLabel}
            {isFinish ? <Flag size={15} strokeWidth={2.3} /> : <ArrowRight size={15} strokeWidth={2.3} />}
          </button>
        </div>
      </header>
    </>
  );
}
