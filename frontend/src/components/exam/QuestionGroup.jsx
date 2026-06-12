// Renders a single question group based on its type.
// Used by both Reading and Listening pages.

export default function QuestionGroup({ group, answers, saveAnswer }) {
  switch (group.question_type) {

    case 'matching':
      return (
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Questions {group.from_number}–{group.to_number}
            </span>
            <span className="text-[11px] text-gray-300 uppercase tracking-wide">Paragraph Matching</span>
          </div>
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{group.instruction}</p>
          <div className="space-y-3">
            {group.questions.map(q => (
              <div id={`question-${q.id}`} key={q.id} className="scroll-mt-6 flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {q.question_number}
                </span>
                <div className="flex-1 flex items-start gap-2">
                  <span className="text-[14px] text-gray-700 leading-6 flex-1">{q.question_text}</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={answers[q.id] || ''}
                    onChange={e => saveAnswer(q.id, e.target.value.toUpperCase())}
                    placeholder="—"
                    className="w-9 h-8 text-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'true_false':
      return (
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Questions {group.from_number}–{group.to_number}
            </span>
            <span className="text-[11px] text-gray-300 uppercase tracking-wide">True / False / Not Given</span>
          </div>
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{group.instruction}</p>
          <div className="space-y-5">
            {group.questions.map(q => (
              <div id={`question-${q.id}`} key={q.id} className="scroll-mt-6">
                <div className="flex items-start gap-3 mb-2.5">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {q.question_number}
                  </span>
                  <p className="text-[14px] text-gray-700 leading-6">{q.question_text}</p>
                </div>
                <div className="ml-9 grid grid-cols-3 gap-1.5">
                  {['True', 'False', 'Not Given'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => saveAnswer(q.id, opt)}
                      className={`py-2 rounded-xl text-[13px] font-semibold transition-all border-0 cursor-pointer ${
                        answers[q.id] === opt
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'fill_blank':
      return (
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Questions {group.from_number}–{group.to_number}
            </span>
            <span className="text-[11px] text-gray-300 uppercase tracking-wide">Fill in the Blank</span>
          </div>
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{group.instruction}</p>
          <div className="space-y-4">
            {group.questions.map(q => {
              const parts = q.question_text.split('________');
              return (
                <div id={`question-${q.id}`} key={q.id} className="scroll-mt-6 flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {q.question_number}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[14px] text-gray-700 leading-7 flex-1">
                    {parts[0] && <span>{parts[0]}</span>}
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={e => saveAnswer(q.id, e.target.value)}
                      placeholder="write answer"
                      className="border-b-2 border-violet-300 bg-transparent text-gray-900 text-[14px] focus:outline-none focus:border-violet-600 px-1 min-w-[130px] transition-colors"
                    />
                    {parts[1] && <span>{parts[1]}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'mcq':
      return (
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Questions {group.from_number}–{group.to_number}
            </span>
            <span className="text-[11px] text-gray-300 uppercase tracking-wide">Multiple Choice</span>
          </div>
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{group.instruction}</p>
          <div className="space-y-6">
            {group.questions.map(q => (
              <div id={`question-${q.id}`} key={q.id} className="scroll-mt-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {q.question_number}
                  </span>
                  <p className="text-[14px] text-gray-700 leading-6">{q.question_text}</p>
                </div>
                <div className="ml-9 space-y-2">
                  {(q.options || []).map(opt => (
                    <button
                      key={opt}
                      onClick={() => saveAnswer(q.id, opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[14px] transition-all border cursor-pointer ${
                        answers[q.id] === opt
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
