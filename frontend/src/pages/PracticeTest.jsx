import { ArrowLeft, CheckCircle2, Mic, Pause, Play, Send, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PracticeShell from '../components/practice/PracticeShell';
import TestPageSkeleton from '../components/skeletons/TestPageSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { API, apiRequest } from '../lib/api';

function WritingPractice({ test, value, onChange }) {
  const minimum = test.content.minimum_words || 250;
  const count = value.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="border border-slate-200 bg-white p-6" style={{ borderRadius: 8 }}>
        <p className="text-[12px] font-bold uppercase text-violet-600">{test.content.task_type?.toUpperCase()}</p>
        <h2 className="mt-3 text-[20px] font-bold text-slate-950">{test.title}</h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-600">{test.content.prompt}</p>
        <p className="mt-5 text-[13px] font-semibold text-slate-500">Write at least {minimum} words.</p>
      </section>
      <section className="border border-slate-200 bg-white p-4" style={{ borderRadius: 8 }}>
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="Write your response here..."
          className="min-h-[55vh] w-full resize-none rounded-lg border border-slate-200 p-4 text-[15px] leading-7 outline-none focus:border-violet-400"
        />
        <p className={`mt-2 text-right text-[12px] font-semibold ${count >= minimum ? 'text-emerald-600' : 'text-slate-400'}`}>
          {count} words
        </p>
      </section>
    </div>
  );
}

function SpeakingPractice({ test, value, onChange }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = event => chunksRef.current.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach(track => track.stop());
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="border border-slate-200 bg-white p-6" style={{ borderRadius: 8 }}>
        <p className="text-[12px] font-bold uppercase text-violet-600">Speaking Part {test.content.speaking_part}</p>
        <h2 className="mt-3 text-[20px] font-bold text-slate-950">{test.title}</h2>
        <div className="mt-5 space-y-4">
          {test.content.prompts?.map(prompt => <p key={prompt} className="text-[15px] leading-7 text-slate-600">{prompt}</p>)}
        </div>
      </section>
      <section className="border border-slate-200 bg-white p-6" style={{ borderRadius: 8 }}>
        <div className="flex flex-col items-center border-b border-slate-100 pb-6">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-white ${recording ? 'bg-red-500' : 'bg-violet-600'}`}
            title={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording ? <Square size={22} fill="currentColor" /> : <Mic size={24} />}
          </button>
          <p className="mt-3 text-[13px] font-semibold text-slate-600">{recording ? 'Recording your answer' : 'Record your practice answer'}</p>
          {audioUrl && <audio className="mt-4 w-full" controls src={audioUrl} />}
        </div>
        <label className="mt-5 block text-[13px] font-bold text-slate-800">Transcript for AI feedback</label>
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="Type or paste what you said. The preview uses this transcript to estimate your band."
          className="mt-2 min-h-56 w-full resize-none rounded-lg border border-slate-200 p-4 text-[15px] leading-7 outline-none focus:border-violet-400"
        />
      </section>
    </div>
  );
}

function ObjectivePractice({ test, answers, onAnswer, playing, onPlaying }) {
  const isListening = test.section === 'listening';
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="border border-slate-200 bg-white p-6" style={{ borderRadius: 8 }}>
        <h2 className="text-[20px] font-bold text-slate-950">{test.title}</h2>
        <p className="mt-3 text-[14px] leading-6 text-slate-500">{test.description}</p>
        {isListening ? (
          <div className="mt-6">
            <audio
              id="practice-audio"
              src={`${API.replace('/api', '')}${test.content.audio_url}`}
              onPlay={() => onPlaying(true)}
              onPause={() => onPlaying(false)}
              onEnded={() => onPlaying(false)}
            />
            <button
              type="button"
              onClick={() => {
                const audio = document.getElementById('practice-audio');
                if (audio.paused) audio.play(); else audio.pause();
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-white"
            >
              {playing ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
            </button>
            <p className="mt-3 text-center text-[12px] font-semibold text-slate-500">Practice recording</p>
          </div>
        ) : (
          <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-700">{test.content.passage}</p>
        )}
      </section>
      <section className="space-y-3">
        {test.content.questions?.map(question => (
          <article key={question.number} className="border border-slate-200 bg-white p-5" style={{ borderRadius: 8 }}>
            <p className="text-[14px] font-semibold leading-6 text-slate-800">{question.number}. {question.text}</p>
            {question.options ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {question.options.map(option => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => onAnswer(question.number, option)}
                    className={`rounded-lg border px-3 py-2 text-[13px] font-semibold ${answers[question.number] === option ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={answers[question.number] || ''}
                onChange={event => onAnswer(question.number, event.target.value)}
                placeholder={question.answer_hint || 'Write your answer'}
                className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-[14px] outline-none focus:border-violet-400"
              />
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

export default function PracticeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [test, setTest] = useState(null);
  const [response, setResponse] = useState('');
  const [answers, setAnswers] = useState({});
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/practice-tests/${id}`, token)
      .then(data => setTest(data.test))
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (test.section === 'writing' || test.section === 'speaking') {
        const data = await apiRequest(`/ai-check/${test.section}`, token, {
          method: 'POST',
          body: JSON.stringify({ test_id: test.id, response }),
        });
        navigate(`/practice/feedback/${data.feedback.id}`);
      } else {
        await apiRequest(`/practice-tests/${test.id}`, token, {
          method: 'PUT',
          body: JSON.stringify({ status: 'completed' }),
        });
        navigate(`/practice/${test.section}`);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <TestPageSkeleton />;
  if (error && !test) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const isAiSection = test.section === 'writing' || test.section === 'speaking';
  const canSubmit = isAiSection ? response.trim().split(/\s+/).filter(Boolean).length >= 20 : Object.keys(answers).length > 0;

  return (
    <PracticeShell>
      <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button type="button" onClick={() => navigate(`/practice/${test.section}`)} className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
            <ArrowLeft size={16} /> Back to {test.section}
          </button>
          <h1 className="mt-3 text-[28px] font-bold text-slate-950">{test.title}</h1>
        </div>
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={submit}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isAiSection ? <Send size={16} /> : <CheckCircle2 size={16} />}
          {submitting ? 'Checking response' : isAiSection ? 'Get AI Feedback Preview' : 'Complete practice'}
        </button>
      </header>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">{error}</p>}
      {test.section === 'writing' && <WritingPractice test={test} value={response} onChange={setResponse} />}
      {test.section === 'speaking' && <SpeakingPractice test={test} value={response} onChange={setResponse} />}
      {(test.section === 'reading' || test.section === 'listening') && (
        <ObjectivePractice
          test={test}
          answers={answers}
          onAnswer={(number, value) => setAnswers(current => ({ ...current, [number]: value }))}
          playing={playing}
          onPlaying={setPlaying}
        />
      )}
    </PracticeShell>
  );
}
