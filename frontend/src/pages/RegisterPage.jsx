import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError('Please fill in all fields.');
    }
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Registration failed.');
      login(data.user, data.token);
      navigate('/');
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-violet-50 flex items-center justify-center p-4"
      style={{ fontFamily: 'Plus Jakarta Sans, serif' }}
    >
      <div className="bg-white border border-purple-200 rounded-3xl p-8 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl">
            <img src="/ielts-buddy-logo.png" alt="IELTS Buddy" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-3">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">Start your IELTS preparation today</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handle}
              placeholder="Alua"
              className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              placeholder="Min. 6 characters"
              className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handle}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Repeat your password"
              className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
