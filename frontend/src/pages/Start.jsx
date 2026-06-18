import { createElement } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingPreview from '../components/landing/LandingPreview';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';

const features = [
  { icon: BrainCircuit, title: 'AI-Powered Feedback', text: 'Detailed feedback for Writing and Speaking to improve faster.', tone: 'bg-violet-50 text-violet-600' },
  { icon: BookOpen, title: 'Real Exam Practice', text: 'High-quality practice tests and full mock exams.', tone: 'bg-blue-50 text-blue-600' },
  { icon: BarChart3, title: 'Track Your Progress', text: 'Analyze performance and monitor your band score over time.', tone: 'bg-emerald-50 text-emerald-600' },
  { icon: Target, title: 'Personalized Study Plan', text: 'A focused study plan based on your weak areas.', tone: 'bg-orange-50 text-orange-600' },
];

export default function Start() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { startExam } = useExam();

  const beginPractice = () => {
    if (token) startExam('reading');
    else navigate('/register');
  };

  return (
    <div className="min-h-dvh bg-white text-slate-950">
      <header className="mx-auto flex h-20 max-w-[1480px] items-center px-4 sm:px-6">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 bg-transparent">
          <img src="/ielts-buddy-logo.png" alt="IELTS Buddy" className="h-10 w-10 rounded-lg object-cover" />
          <span className="hidden text-[20px] font-extrabold sm:block">IELTS Buddy</span>
        </button>
        <nav className="ml-24 hidden items-center gap-10 lg:flex">
          <a href="#home" className="border-b-2 border-violet-600 py-7 text-[14px] font-bold text-violet-600">Home</a>
          <a href="#features" className="text-[14px] font-semibold text-slate-600">Features</a>
          <button className="flex items-center gap-1 bg-transparent text-[14px] font-semibold text-slate-600">Practice <ChevronDown size={14} /></button>
          <a href="#pricing" className="text-[14px] font-semibold text-slate-600">Pricing</a>
          <a href="#resources" className="flex items-center gap-1 text-[14px] font-semibold text-slate-600">Resources <ChevronDown size={14} /></a>
          <a href="#about" className="text-[14px] font-semibold text-slate-600">About</a>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <button type="button" onClick={() => navigate(token ? '/dashboard' : '/login')} className="h-11 bg-transparent px-4 text-[14px] font-bold text-slate-700">
            {token ? 'Dashboard' : 'Log in'}
          </button>
          <button type="button" onClick={beginPractice} className="h-11 rounded-lg bg-violet-600 px-4 text-[13px] font-bold text-white hover:bg-violet-700 sm:px-6 sm:text-[14px]">
            Get Started Free
          </button>
        </div>
      </header>

      <main id="home">
        <section className="mx-auto grid min-h-[650px] max-w-[1480px] grid-cols-1 items-center gap-12 px-4 py-10 sm:px-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2 text-[13px] font-bold text-violet-700">
              <BrainCircuit size={16} /> Your Smart IELTS Prep Companion
            </div>
            <h1 className="mt-8 text-[44px] font-extrabold leading-[1.08] text-slate-950 sm:text-[64px]">
              Prepare Smarter.<br />
              <span className="text-violet-600">Score Higher.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[18px] leading-8 text-slate-600">
              AI-powered practice, personalized feedback, and real exam simulations to help you achieve your target band score.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={beginPractice} className="flex h-12 items-center gap-3 rounded-lg bg-violet-600 px-7 text-[14px] font-bold text-white hover:bg-violet-700">
                Start Free Practice <ArrowRight size={17} />
              </button>
              <button type="button" onClick={beginPractice} className="h-12 rounded-lg border border-slate-200 bg-white px-7 text-[14px] font-bold text-slate-800 hover:border-violet-300">
                Take a Free Mock Test
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['A', 'M', 'S'].map((letter, index) => (
                  <span key={letter} className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white text-[12px] font-extrabold text-white ${['bg-slate-800', 'bg-emerald-600', 'bg-violet-600'][index]}`}>{letter}</span>
                ))}
              </div>
              <div>
                <div className="flex gap-1 text-amber-400">{[0, 1, 2, 3, 4].map(item => <Star key={item} size={15} fill="currentColor" />)}</div>
                <p className="mt-1 text-[13px] text-slate-500">Loved by IELTS learners</p>
              </div>
            </div>
          </div>
          <LandingPreview />
        </section>

        <section id="features" className="mx-auto max-w-[1480px] px-6">
          <div className="grid grid-cols-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4 xl:p-7">
            {features.map(({ icon: Icon, title, text, tone }, index) => (
              <div key={title} className={`flex gap-4 px-5 py-4 xl:py-0 ${index ? 'xl:border-l xl:border-slate-200' : ''}`}>
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-lg ${tone}`}>
                  {createElement(Icon, { size: 25 })}
                </span>
                <div>
                  <p className="text-[14px] font-bold">{title}</p>
                  <p className="mt-2 text-[12px] leading-5 text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="my-8 grid grid-cols-2 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-7 md:grid-cols-4 md:px-8">
            {[
              [Users, '20,000+', 'Happy Students'],
              [Star, '4.9/5', 'Average Rating'],
              [Trophy, '95%', 'Achieve Their Target'],
              [ShieldCheck, '10,000+', 'Mock Tests Taken'],
            ].map(([Icon, value, label], index) => (
              <div key={label} className={`flex items-center justify-center gap-3 py-4 md:py-0 ${index ? 'md:border-l md:border-violet-200' : ''}`}>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-violet-600">
                  {createElement(Icon, { size: 23 })}
                </span>
                <div>
                  <p className="text-[21px] font-extrabold text-violet-600">{value}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
