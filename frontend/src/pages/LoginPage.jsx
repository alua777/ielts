import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed.');
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
          <h1 className="text-xl font-bold text-gray-900 mt-3">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue practising</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="you@example.com"
              className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
              style={{ fontFamily: 'Plus Jakarta Sans, serif' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Enter your password"
              className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
              style={{ fontFamily: 'Plus Jakarta Sans, serif' }}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
          style={{ fontFamily: 'Plus Jakarta Sans, serif' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
