import { CalendarDays, Clock3, Target } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const SECTIONS = ['reading', 'listening', 'writing', 'speaking'];

export default function OnboardingSurvey() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_band: '',
    target_band: '7',
    weak_sections: [],
    exam_date: '',
    study_hours: '6',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSection = section => {
    setForm(current => ({
      ...current,
      weak_sections: current.weak_sections.includes(section)
        ? current.weak_sections.filter(item => item !== section)
        : [...current.weak_sections, section],
    }));
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await apiRequest('/onboarding-survey', token, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Could not save your survey.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#f7f9fd] px-4 py-6 text-slate-900">
      <main className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="text-[12px] font-bold uppercase text-violet-600">Quick setup</p>
          <h1 className="mt-2 text-[28px] font-extrabold text-slate-950 sm:text-[34px]">Personalize your IELTS plan</h1>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">A few details help us make your dashboard more useful from day one.</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-700"><Target size={15} /> Current band</span>
            <input type="number" min="0" max="9" step="0.5" value={form.current_band} onChange={event => setForm({ ...form, current_band: event.target.value })} placeholder="6.0" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[14px] outline-none focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-700"><Target size={15} /> Target band</span>
            <input type="number" min="0" max="9" step="0.5" value={form.target_band} onChange={event => setForm({ ...form, target_band: event.target.value })} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[14px] outline-none focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-700"><CalendarDays size={15} /> Exam date</span>
            <input type="date" value={form.exam_date} onChange={event => setForm({ ...form, exam_date: event.target.value })} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[14px] outline-none focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-700"><Clock3 size={15} /> Study hours per week</span>
            <input type="number" min="1" max="80" value={form.study_hours} onChange={event => setForm({ ...form, study_hours: event.target.value })} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[14px] outline-none focus:border-violet-400" />
          </label>
        </div>

        <section className="mt-5">
          <p className="mb-3 text-[13px] font-bold text-slate-700">Weak sections</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SECTIONS.map(section => {
              const active = form.weak_sections.includes(section);
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => toggleSection(section)}
                  className={`min-h-11 rounded-lg border px-3 text-[13px] font-bold capitalize ${
                    active ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {section}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate('/dashboard')} className="min-h-11 rounded-lg border border-slate-200 bg-white px-5 text-[14px] font-bold text-slate-600">Skip for now</button>
          <button type="button" onClick={submit} disabled={saving} className="min-h-11 rounded-lg bg-violet-600 px-6 text-[14px] font-bold text-white disabled:bg-slate-300">
            {saving ? 'Saving' : 'Save and continue'}
          </button>
        </div>
      </main>
    </div>
  );
}
