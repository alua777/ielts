import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ban,
  BarChart3,
  CheckCircle2,
  FileAudio,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { apiRequest } from '../lib/api';

const tabs = [
  { id: 'tests', label: 'Practice Tests', icon: ShieldCheck },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const blankForm = () => ({
  id: '',
  section: 'reading',
  title: '',
  description: '',
  difficulty: 'Intermediate',
  duration_minutes: 30,
  question_types: '',
  published: true,
  content: '{\n  "questions": []\n}',
});

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-3 text-[32px] font-extrabold leading-none text-slate-950">{value}</p>
      {hint ? <p className="mt-2 text-[13px] font-medium text-slate-500">{hint}</p> : null}
    </div>
  );
}

function AdminTabs({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-[14px] font-bold transition ${
              active ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-950'
            }`}
          >
            <Icon size={17} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Admin() {
  const { token, user, logout } = useAuth();
  const { startExam } = useExam();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadAdminData = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const [testData, userData, summaryData] = await Promise.all([
        apiRequest(`/admin/practice-tests${query}`, token),
        apiRequest(`/admin/users${query}`, token),
        apiRequest('/admin/summary', token),
      ]);
      setTests(testData.tests || []);
      setUsers(userData.users || []);
      setSummary(summaryData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, token]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const contentMix = useMemo(() => {
    return tests.reduce((acc, test) => {
      acc[test.section] = (acc[test.section] || 0) + 1;
      return acc;
    }, {});
  }, [tests]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetForm = () => {
    setEditingId('');
    setForm(blankForm());
  };

  const editTest = test => {
    setEditingId(test.id);
    setForm({
      id: test.id,
      section: test.section || 'reading',
      title: test.title || '',
      description: test.description || '',
      difficulty: test.difficulty || 'Intermediate',
      duration_minutes: test.duration_minutes || 30,
      question_types: (test.question_types || []).join(', '),
      published: Boolean(test.published),
      content: JSON.stringify(test.content || {}, null, 2),
    });
  };

  const saveTest = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        duration_minutes: Number(form.duration_minutes) || 0,
        question_types: form.question_types.split(',').map(type => type.trim()).filter(Boolean),
        content: JSON.parse(form.content || '{}'),
      };
      await apiRequest(
        editingId ? `/admin/practice-tests/${editingId}` : '/admin/practice-tests',
        token,
        { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      );
      resetForm();
      await loadAdminData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async test => {
    await apiRequest(`/admin/practice-tests/${test.id}/publish`, token, {
      method: 'PATCH',
      body: JSON.stringify({ published: !test.published }),
    });
    await loadAdminData();
  };

  const deleteTest = async id => {
    if (!window.confirm('Delete this practice test?')) return;
    await apiRequest(`/admin/practice-tests/${id}`, token, { method: 'DELETE' });
    await loadAdminData();
  };

  const uploadAudio = async (id, file) => {
    if (!file) return;
    const data = new FormData();
    data.append('audio', file);
    await apiRequest(`/admin/practice-tests/${id}/audio`, token, { method: 'POST', body: data });
    await loadAdminData();
  };

  const updateUser = async (id, values) => {
    await apiRequest(`/admin/users/${id}`, token, { method: 'PATCH', body: JSON.stringify(values) });
    await loadAdminData();
  };

  const resetAttempts = async id => {
    if (!window.confirm('Reset all attempts and feedback for this user?')) return;
    await apiRequest(`/admin/users/${id}/attempts`, token, { method: 'DELETE' });
    await loadAdminData();
  };

  const deleteUser = async id => {
    if (!window.confirm('Delete this user account?')) return;
    await apiRequest(`/admin/users/${id}`, token, { method: 'DELETE' });
    await loadAdminData();
  };

  return (
    <div className="flex min-h-dvh bg-[#f7f9fd] text-slate-950 lg:h-dvh lg:overflow-hidden">
      <DashboardSidebar onStartExam={() => startExam('reading')} onLogout={handleLogout} onNavigate={navigate} />

      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-20 sm:px-6 lg:px-6 lg:py-5">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-violet-600">Admin Panel</p>
              <h1 className="mt-1 text-[32px] font-extrabold leading-tight tracking-normal text-slate-950">Manage IELTS Buddy</h1>
              <p className="mt-1 text-[15px] font-medium text-slate-500">Create content, manage learners, and watch what needs attention.</p>
            </div>
            {isAdmin ? <AdminTabs activeTab={activeTab} onChange={setActiveTab} /> : null}
          </div>

          {!isAdmin ? (
            <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-[14px] text-amber-900">
              <p className="font-bold">This page needs an admin account.</p>
              <p className="mt-2">Add your email to <span className="font-mono">ADMIN_EMAILS</span> in the backend environment, restart the backend, then log in again.</p>
            </section>
          ) : (
            <>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block max-w-md flex-1">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search tests or users"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-[14px] font-medium outline-none ring-violet-200 focus:border-violet-400 focus:ring-4"
                  />
                </label>
                <button type="button" onClick={loadAdminData} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-bold text-slate-600">
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>

              {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">{error}</div> : null}
              {loading ? (
                <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : activeTab === 'analytics' ? (
                <section className="mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <StatCard label="Total users" value={summary?.summary?.total_users || 0} />
                    <StatCard label="Active users" value={summary?.summary?.active_users || 0} hint="Last 7 days" />
                    <StatCard label="Tests" value={summary?.summary?.practice_tests || 0} />
                    <StatCard label="Published" value={summary?.summary?.published_tests || 0} />
                    <StatCard label="Attempts" value={summary?.summary?.attempts || 0} />
                    <StatCard label="AI feedback" value={summary?.summary?.ai_feedback || 0} />
                  </div>
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-[16px] font-extrabold">Most difficult question types</h2>
                      <div className="mt-4 space-y-3">
                        {(summary?.difficult_question_types || []).length ? summary.difficult_question_types.map(item => (
                          <div key={item.question_type} className="rounded-lg bg-slate-50 p-3">
                            <div className="flex items-center justify-between text-[14px] font-bold">
                              <span>{item.question_type}</span>
                              <span className="text-red-500">{item.incorrect_rate}% incorrect</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.min(100, Number(item.incorrect_rate || 0))}%` }} />
                            </div>
                          </div>
                        )) : <p className="text-[14px] font-medium text-slate-500">No graded question data yet.</p>}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-[16px] font-extrabold">Content mix</h2>
                      <div className="mt-4 space-y-3">
                        {['reading', 'listening', 'writing', 'speaking'].map(section => (
                          <div key={section} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-[14px]">
                            <span className="font-bold capitalize">{section}</span>
                            <span className="font-extrabold text-violet-600">{contentMix[section] || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ) : activeTab === 'users' ? (
                <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-[14px]">
                      <thead className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        <tr>
                          <th className="px-3 py-3">User</th>
                          <th className="px-3 py-3">Role</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-3 py-3">Attempts</th>
                          <th className="px-3 py-3">Avg band</th>
                          <th className="px-3 py-3">Last activity</th>
                          <th className="px-3 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(account => (
                          <tr key={account.id} className="border-t border-slate-100">
                            <td className="px-3 py-4">
                              <p className="font-extrabold text-slate-950">{account.name}</p>
                              <p className="text-[13px] font-medium text-slate-500">{account.email}</p>
                            </td>
                            <td className="px-3 py-4 capitalize">{account.role}</td>
                            <td className="px-3 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${account.status === 'banned' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {account.status}
                              </span>
                            </td>
                            <td className="px-3 py-4 font-bold">{account.attempts_count || 0}</td>
                            <td className="px-3 py-4 font-bold">{Number(account.average_band || 0).toFixed(1)}</td>
                            <td className="px-3 py-4 text-slate-500">{account.last_activity ? new Date(account.last_activity).toLocaleDateString('en-GB') : 'Never'}</td>
                            <td className="px-3 py-4">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => updateUser(account.id, { status: account.status === 'banned' ? 'active' : 'banned' })} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[13px] font-bold text-slate-600">
                                  <Ban size={14} />
                                  {account.status === 'banned' ? 'Unban' : 'Ban'}
                                </button>
                                <button type="button" onClick={() => resetAttempts(account.id)} className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] font-bold text-slate-600">Reset</button>
                                <button type="button" onClick={() => deleteUser(account.id)} className="flex h-9 items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 text-[13px] font-bold text-red-600">
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                <section className="mt-5 grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
                  <form onSubmit={saveTest} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[16px] font-extrabold">{editingId ? 'Edit test' : 'Create test'}</h2>
                      {editingId ? <button type="button" onClick={resetForm} className="text-[13px] font-bold text-violet-600">New test</button> : null}
                    </div>
                    <div className="mt-4 grid gap-3">
                      <input required disabled={Boolean(editingId)} value={form.id} onChange={event => setForm({ ...form, id: event.target.value })} placeholder="Unique test ID" className="h-11 rounded-lg border border-slate-200 px-3 text-[14px] outline-none focus:border-violet-400" />
                      <input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Title" className="h-11 rounded-lg border border-slate-200 px-3 text-[14px] outline-none focus:border-violet-400" />
                      <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={2} className="rounded-lg border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-violet-400" />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={form.section} onChange={event => setForm({ ...form, section: event.target.value })} className="h-11 rounded-lg border border-slate-200 px-3 text-[14px] outline-none">
                          <option value="reading">Reading</option>
                          <option value="listening">Listening</option>
                          <option value="writing">Writing</option>
                          <option value="speaking">Speaking</option>
                        </select>
                        <input type="number" min="1" value={form.duration_minutes} onChange={event => setForm({ ...form, duration_minutes: event.target.value })} className="h-11 rounded-lg border border-slate-200 px-3 text-[14px] outline-none" />
                      </div>
                      <input value={form.difficulty} onChange={event => setForm({ ...form, difficulty: event.target.value })} placeholder="Difficulty" className="h-11 rounded-lg border border-slate-200 px-3 text-[14px] outline-none focus:border-violet-400" />
                      <input value={form.question_types} onChange={event => setForm({ ...form, question_types: event.target.value })} placeholder="Question types, comma separated" className="h-11 rounded-lg border border-slate-200 px-3 text-[14px] outline-none focus:border-violet-400" />
                      <label className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                        <input type="checkbox" checked={form.published} onChange={event => setForm({ ...form, published: event.target.checked })} />
                        Published
                      </label>
                      <textarea value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} rows={11} className="rounded-lg border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-[12px] leading-5 text-slate-100 outline-none focus:border-violet-400" />
                      <button disabled={saving} type="submit" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-[15px] font-extrabold text-white disabled:opacity-60">
                        {saving ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
                        {editingId ? 'Save changes' : 'Create test'}
                      </button>
                    </div>
                  </form>

                  <div className="grid gap-3">
                    {tests.map(test => (
                      <article key={test.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[16px] font-extrabold">{test.title}</h3>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-bold capitalize text-slate-500">{test.section}</span>
                              <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${test.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {test.published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <p className="mt-1 text-[13px] font-medium text-slate-500">{test.id} • {test.difficulty} • {test.duration_minutes} min</p>
                            <p className="mt-2 max-w-3xl text-[14px] text-slate-600">{test.description || 'No description yet.'}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => editTest(test)} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[13px] font-bold text-slate-600"><Pencil size={14} /> Edit</button>
                            <button type="button" onClick={() => togglePublish(test)} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[13px] font-bold text-slate-600"><CheckCircle2 size={14} /> {test.published ? 'Unpublish' : 'Publish'}</button>
                            <button type="button" onClick={() => deleteTest(test.id)} className="flex h-9 items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 text-[13px] font-bold text-red-600"><Trash2 size={14} /> Delete</button>
                          </div>
                        </div>
                        {test.section === 'listening' ? (
                          <div className="mt-4 flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                              <FileAudio size={16} />
                              {test.content?.audio_url || 'No audio uploaded'}
                            </div>
                            <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-3 text-[13px] font-bold text-violet-600 shadow-sm">
                              <Upload size={14} />
                              Upload audio
                              <input type="file" accept="audio/*" className="hidden" onChange={event => uploadAudio(test.id, event.target.files?.[0])} />
                            </label>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
