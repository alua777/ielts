import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Circle, Clock3, Mic2, RotateCcw, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import AssessmentCriteria from '../components/exam/AssessmentCriteria';
import { ExamError, ExamLoader } from '../components/exam/ExamLoader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PART_META = {
  0: { label: 'Part 1', sublabel: 'Introduction & Interview', duration: 5 * 60, hint: 'Answer each question naturally in 2–3 sentences. The examiner wants to hear your natural speaking voice.' },
  1: { label: 'Part 2', sublabel: 'Individual Long Turn', duration: 3 * 60, hint: 'You have 1 minute to prepare, then speak for 1–2 minutes. Use the bullet points on the card to structure your answer.' },
  2: { label: 'Part 3', sublabel: 'Two-way Discussion', duration: 5 * 60, hint: 'Develop your answers fully. The examiner expects detailed responses with reasons and examples.' },
};

function CircleTimer({ seconds, total }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, seconds / total);
  const dash = pct * circumference;
  const isLow = seconds < 60;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="5" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={isLow ? '#EF4444' : '#7C3AED'}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear' }}
        />
      </svg>
      <div className="text-center z-10">
        <span className={`text-xl font-bold tabular-nums ${isLow ? 'text-red-500' : 'text-gray-900'}`}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

export default function Speaking() {
  const { token } = useAuth();
  const { attemptId, nextStage } = useExam();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which part we're on (0, 1, 2)
  const [partIndex, setPartIndex] = useState(0);

  // Part 2 prep timer
  const [prepMode, setPrepMode] = useState(false);
  const [prepSeconds, setPrepSeconds] = useState(60);

  // Per-part timer
  const [partSeconds, setPartSeconds] = useState(0);
  const [partRunning, setPartRunning] = useState(false);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState({}); // { partIndex: true }
  const [audioURLs, setAudioURLs] = useState({}); // { partIndex: url }
  const [audioBlobs, setAudioBlobs] = useState({}); // { partIndex: Blob }
  const [submitting, setSubmitting] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Notes for Part 2
  const [notes, setNotes] = useState('');

  // Fetch speaking passages
  useEffect(() => {
    fetch(`${API}/passages?section=speaking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.passages?.length > 0) {
          setParts(data.passages);
        } else {
          setError('No speaking parts found.');
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load speaking.'); setLoading(false); });
  }, [token]);

  // Set part timer when part changes
  useEffect(() => {
    const meta = PART_META[partIndex];
    if (meta) {
      setPartSeconds(meta.duration);
      setPartRunning(false);
      setPrepMode(false);
      setPrepSeconds(60);
    }
  }, [partIndex]);

  // Part timer tick
  useEffect(() => {
    if (!partRunning || partSeconds <= 0) return;
    const id = setInterval(() => setPartSeconds(s => {
      if (s <= 1) { clearInterval(id); setPartRunning(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [partRunning, partSeconds]);

  // Prep timer tick (Part 2 only)
  useEffect(() => {
    if (!prepMode || prepSeconds <= 0) return;
    const id = setInterval(() => setPrepSeconds(s => {
      if (s <= 1) {
        clearInterval(id);
        setPrepMode(false);
        setPartRunning(true); // auto-start speaking timer after prep
        return 0;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [prepMode, prepSeconds]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURLs(prev => ({ ...prev, [partIndex]: url }));
        setAudioBlobs(prev => ({ ...prev, [partIndex]: blob }));
        setRecorded(prev => ({ ...prev, [partIndex]: true }));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setPartRunning(true);
    } catch {
      alert('Microphone access denied. Please allow microphone access to record.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setPartRunning(false);
  };

  const submitRecording = async (index = partIndex) => {
    const blob = audioBlobs[index];
    if (!blob || !attemptId) return;

    const formData = new FormData();
    formData.append('attempt_id', attemptId);
    formData.append('passage_id', parts[index]?.id || '');
    formData.append('part_index', String(index));
    formData.append('audio', blob, `speaking-part-${index + 1}.webm`);

    const res = await fetch(`${API}/speaking`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to submit speaking recording');
  };

  const continueAfterRecording = async () => {
    try {
      setSubmitting(true);
      await submitRecording();
      if (isLastPart) {
        await nextStage();
      } else {
        setPartIndex(i => i + 1);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastPart = partIndex === parts.length - 1;
  const meta = PART_META[partIndex];
  const part = parts[partIndex];
  const group = part?.groups?.[0];
  const questions = group?.questions || [];
  const isPartTwo = partIndex === 1;

  if (loading) return <ExamLoader message="Loading speaking test" />;
  if (error) return <ExamError message={error} />;

  if (loading && window.__useLegacySpeakingLoader) return (
    <div className="flex items-center justify-center bg-[#F8FAFC]" style={{ height: 'calc(100dvh - 64px)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-gray-400">Loading speaking test…</p>
      </div>
    </div>
  );

  if (error && window.__useLegacySpeakingLoader) return (
    <div className="flex items-center justify-center bg-[#F8FAFC]" style={{ height: 'calc(100dvh - 64px)' }}>
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  return (
    <div
      className="flex flex-col bg-slate-50"
      style={{ height: 'calc(100dvh - 64px)', overflow: 'hidden' }}
    >
      {/* ── Part tabs ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
          {parts.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (!recording) setPartIndex(i); }}
              disabled={recording}
              className={`min-h-11 rounded-md border-0 px-3 text-[12px] font-bold transition-all sm:px-5 sm:text-[13px] ${
                partIndex === i
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              } ${recording ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              Part {i + 1}
            </button>
          ))}
        </div>

        {/* Recording indicator */}
        {recording && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-red-600">Recording</span>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 py-3 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden lg:py-4">

        {/* Left — Part info + timer + recording */}
        <div className="flex min-h-[65vh] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          {/* Part header */}
          <div className="mb-6">
            <p className="mb-1 text-[11px] font-bold uppercase text-violet-600">
              {meta?.label}
            </p>
            <h2 className="text-[24px] font-bold leading-tight text-slate-950">{meta?.sublabel}</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">{meta?.hint}</p>
          </div>

          <div className="mb-6 h-px bg-slate-100" />

          {/* Timer + controls */}
          <div className="mb-7 flex items-center gap-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <CircleTimer
              seconds={prepMode ? prepSeconds : partSeconds}
              total={prepMode ? 60 : meta?.duration}
            />
            <div className="min-w-0">
              <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-600">
                {recording ? <Mic2 size={16} /> : <Clock3 size={16} />}
              </span>
              <p className="mb-0.5 text-[13px] font-bold text-slate-800">
                {prepMode ? 'Preparation time' : recording ? 'Speaking time' : 'Time available'}
              </p>
              <p className="text-[12px] leading-5 text-slate-500">
                {prepMode
                  ? 'Timer starts automatically when prep ends'
                  : `${Math.floor((meta?.duration || 0) / 60)} minutes for this part`}
              </p>
            </div>
          </div>

          {/* Part 2 prep + notes */}
          {isPartTwo && !recording && !recorded[partIndex] && (
            <div className="mb-6">
              {!prepMode ? (
                <button
                  onClick={() => setPrepMode(true)}
                  className="mb-3 h-10 w-full rounded-lg border border-slate-200 bg-white text-[13px] font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                >
                  Start 1-minute preparation ⏱
                </button>
              ) : (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[12px] text-amber-700 font-semibold">Preparation time — {prepSeconds}s remaining</p>
                  <p className="text-[12px] text-amber-600 mt-0.5">Recording starts automatically when time is up.</p>
                </div>
              )}
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Jot down your notes here during preparation…"
                className="h-28 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-700 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
          )}

          {/* Record / Stop button */}
          <div className="mt-auto">
            {!recorded[partIndex] ? (
              recording ? (
                <button
                  onClick={stopRecording}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-0 bg-red-500 text-[14px] font-bold text-white transition hover:bg-red-600"
                >
                  <Square size={14} fill="currentColor" />
                  Stop Recording
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isPartTwo && !prepMode && prepSeconds === 60}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-0 bg-violet-600 text-[14px] font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Circle size={14} fill="currentColor" />
                  {isPartTwo ? (prepMode ? 'Recording will start automatically…' : 'Start Preparation First') : 'Start Recording'}
                </button>
              )
            ) : (
              <div className="space-y-3">
                {/* Playback */}
                {audioURLs[partIndex] && (
                  <audio controls src={audioURLs[partIndex]} className="w-full rounded-xl" />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRecorded(p => ({ ...p, [partIndex]: false }));
                      setAudioURLs(p => ({ ...p, [partIndex]: null }));
                      setAudioBlobs(p => ({ ...p, [partIndex]: null }));
                    }}
                    disabled={submitting}
                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-white text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <RotateCcw size={14} strokeWidth={2.3} />
                      Re-record
                    </span>
                  </button>
                  {isLastPart ? (
                    <button
                      onClick={continueAfterRecording}
                      disabled={submitting}
                      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-violet-600 text-[13px] font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Finish Exam
                      <ArrowRight size={14} strokeWidth={2.3} />
                    </button>
                  ) : (
                    <button
                      onClick={continueAfterRecording}
                      disabled={submitting}
                      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-slate-900 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next Part
                      <ArrowRight size={14} strokeWidth={2.3} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Questions / Task card */}
        <div className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">
            <p className="mb-4 text-[11px] font-bold uppercase text-violet-600">
              {isPartTwo ? 'Task Card' : 'Questions'}
            </p>

            {isPartTwo ? (
              /* Part 2 task card style */
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                {questions[0] && (
                  <p className="text-[15px] text-gray-800 leading-8 whitespace-pre-line">
                    {questions[0].question_text}
                  </p>
                )}
              </div>
            ) : (
              /* Part 1 & 3 question list */
              <div className="space-y-5">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[11px] font-bold text-violet-600">
                      {i + 1}
                    </span>
                    <p className="text-[15px] text-gray-700 leading-7">{q.question_text}</p>
                  </div>
                ))}
              </div>
            )}

            <AssessmentCriteria className="mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
