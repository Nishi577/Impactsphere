import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../context/AppDataContext';
import { authApi } from '../utils/api';
import { Globe, Lock, Mail, ArrowRight, AlertCircle, Heart, Building2, Shield, User } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'NGO Coordinator', icon: Building2, email: 'coordinator@greenaid.org', password: 'ngo123', role: 'ngo_coordinator', color: 'blue' },
  { label: 'Volunteer',       icon: Heart,     email: 'vol1@volunteer.org',       password: 'vol123', role: 'volunteer',       color: 'emerald' },
  { label: 'Community User',  icon: User,      email: 'user@community.org',       password: 'user123', role: 'user',          color: 'orange' },
];

const demoColors = {
  violet:  'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100',
  blue:    'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  orange:  'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { findUser } = useAppData();
  const navigate = useNavigate();

  const navigateByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'ngo_coordinator') navigate('/ngo');
    else if (role === 'user' || role === 'anchor') navigate('/user');
    else navigate('/volunteer');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login(email, password);
      login(data);
      navigateByRole(data.role);
    } catch (err) {
      // ── In-memory fallback: check context users list ──────────────────────
      const memUser = findUser(email, password);
      if (memUser) {
        login(memUser);
        navigateByRole(memUser.role);
        return;
      }
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/40 flex flex-col">
      {/* Top nav */}
      <nav className="px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Globe size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">ImpactSphere</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">New to ImpactSphere?</span>
          <Link to="/signup/volunteer" className="text-emerald-600 hover:text-emerald-700 font-semibold">Join as Volunteer →</Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-200/60 mb-4">
              <Globe size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your ImpactSphere account</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            {/* Demo Accounts */}
            <div className="mb-6">
              <p className="text-gray-400 text-xs text-center mb-3 font-medium">Quick demo access</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(acc => {
                  const Icon = acc.icon;
                  return (
                    <button key={acc.email} onClick={() => quickLogin(acc)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${demoColors[acc.color]}`}>
                      <Icon size={15} />
                      <span className="leading-tight text-center">{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-300 text-xs">or sign in manually</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Email or Username</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com or admin"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-emerald-200">
                {loading ? 'Signing in...' : <>Sign In <ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          <div className="text-center mt-6 space-y-2">
            <p className="text-gray-400 text-sm">
              Just looking around?{' '}
              <Link to="/signup/user" className="text-emerald-600 hover:underline font-semibold">Join as User</Link>
            </p>
            <p className="text-gray-400 text-sm">
              Want to volunteer?{' '}
              <Link to="/signup/volunteer" className="text-emerald-600 hover:underline font-semibold">Create volunteer profile</Link>
            </p>
            <p className="text-gray-400 text-sm">
              Registering an NGO?{' '}
              <Link to="/signup/ngo" className="text-blue-600 hover:underline font-semibold">Register your organization</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
