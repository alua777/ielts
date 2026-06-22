import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { ExamError, ExamLoader } from '../components/exam/ExamLoader';
import QuestionGroup from '../components/exam/QuestionGroup';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import ListeningPlayer from '../components/listening/ListeningPlayer';
import ListeningNotesPanel from '../components/listening/ListeningNotesPanel';
import { API, resolveApiAssetUrl } from '../lib/api';

export default function Listening() {
  const { token } = useAuth();
  const { answers, saveAnswer, nextStage, setTotalPassages, attemptId } = useExam();
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [mobilePanel, setMobilePanel] = useState('questions');
  const questionsPaneRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/passages?section=listening`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        if (data.passages?.length > 0) {
          setPassages(data.passages);
          setTotalPassages?.(1);
        } else {
          setError('No listening sections found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load listening.');
        setLoading(false);
      });
  }, [setTotalPassages, token]);

  const allGroups = passages.flatMap(passage => passage.groups || []);
  const allQuestions = allGroups
    .flatMap(group => group.questions || [])
    .sort((a, b) => a.question_number - b.question_number);
  const audioUrl = resolveApiAssetUrl(passages.find(passage => passage.audio_url)?.audio_url);

  const selectedQuestionId = activeQuestionId || allQuestions[0]?.id || null;

  const selectQuestion = questionId => {
    setActiveQuestionId(questionId);
    const target = document.getElementById(`question-${questionId}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) return <ExamLoader message="Loading listening test..." />;
  if (error) return <ExamError message={error} />;

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-slate-50">
      <ListeningPlayer audioUrl={audioUrl} />

      <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
        <div className="mb-3 grid grid-cols-2 rounded-lg bg-slate-200 p-1 lg:hidden">
          {['questions', 'notes'].map(panel => (
            <button key={panel} type="button" onClick={() => setMobilePanel(panel)} className={`min-h-11 rounded-md text-[13px] font-bold capitalize ${mobilePanel === panel ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>
              {panel}
            </button>
          ))}
        </div>
        <QuestionNavigator
          questions={allQuestions}
          answers={answers}
          activeQuestionId={selectedQuestionId}
          onQuestionSelect={selectQuestion}
        />
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 grid-cols-1 gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-4">
        <main
          ref={questionsPaneRef}
          className={`${mobilePanel === 'questions' ? 'block' : 'hidden'} h-full min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm lg:block`}
        >
          <div className="p-4 sm:p-8">
            <div className="mb-8 flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3">
              <Info size={17} className="mt-0.5 shrink-0 text-violet-600" />
              <p className="text-[13px] font-medium leading-5 text-violet-800">
                You will hear the recording once only. Write your answers as you listen, then check them before submitting.
              </p>
            </div>

            {passages.map((passage, passageIndex) => (
              <section key={passage.id}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="px-2 text-[12px] font-bold uppercase text-slate-500">
                    Section {passageIndex + 1}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <p className="mb-6 text-[13px] font-medium italic text-slate-500">{passage.title}</p>
                {(passage.groups || []).map(group => (
                  <QuestionGroup
                    key={group.id}
                    group={group}
                    answers={answers}
                    saveAnswer={saveAnswer}
                  />
                ))}
              </section>
            ))}

            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={nextStage}
                className="ml-auto flex h-11 items-center justify-center gap-2 rounded-lg border-0 bg-violet-600 px-6 text-[14px] font-bold text-white transition hover:bg-violet-700"
              >
                Submit Listening
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </main>
        <div className={`${mobilePanel === 'notes' ? 'block' : 'hidden'} min-h-0 lg:block`}>
          <ListeningNotesPanel key={attemptId || 'practice'} attemptId={attemptId} />
        </div>
      </div>
    </div>
  );
}
