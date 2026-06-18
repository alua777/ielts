import { CheckCircle2, Headphones, Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function ListeningPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <section className="sticky top-0 z-20 h-28 shrink-0 border-b border-slate-200 bg-white px-4 sm:h-32 sm:px-6">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-end">
        <div className="absolute left-1/2 top-1/2 flex w-[calc(100%-32px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 flex-col items-center sm:w-[min(620px,72vw)] lg:w-[min(620px,48vw)]">
          <button
            type="button"
            onClick={togglePlayback}
            disabled={!audioUrl}
            aria-label={playing ? 'Pause listening audio' : 'Play listening audio'}
            className="grid h-16 w-16 place-items-center rounded-full border-0 bg-violet-600 text-white shadow-[0_10px_28px_rgba(124,58,237,0.28)] transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {playing ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" className="ml-1" />}
          </button>

          <div className="mt-3 flex w-full items-center gap-3">
            <span className="w-10 text-right text-[12px] font-semibold tabular-nums text-slate-500">
              {formatTime(currentTime)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-600 transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 text-[12px] font-semibold tabular-nums text-slate-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>        
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
        onDurationChange={event => setDuration(event.currentTarget.duration)}
        onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => {
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(audioRef.current?.duration || 0);
        }}
      />
    </section>
  );
}
