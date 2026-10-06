import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../context/AppDataContext';
import {
  Globe, ArrowLeft, ArrowRight, CheckCircle, User, Mail, Phone,
  MapPin, Lock
} from 'lucide-react';
import { authApi } from '../utils/api';

function InputField({ label, icon: Icon, required, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white`}
          {...props}
        />
      </div>
    </div>
  );
}

export default function UserSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addUser } = useAppData();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
  });

  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    return form.name && form.email && form.location && form.password;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const payload = {
      email: form.email,
      password: form.password,
      role: 'user',
      name: form.name,
      phone: form.phone,
      location: form.location,
    };
    try {
      const { data } = await authApi.register(payload);
      // Also register in context so in-memory login works
      addUser({ ...payload, ...data });
      login(data);
      navigate('/user');
    } catch (err) {
      const isNetwork = !err.response;
      if (isNetwork) {
        // Backend down → register purely in-memory
        const memUser = addUser(payload);
        login(memUser);
        navigate('/user');
        return;
      }
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-200 mb-4">
            <Globe size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create an Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the community and stay informed</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Your Details</h2>
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            
            <InputField label="Full Name" icon={User} required placeholder="Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
            <InputField label="Email Address" icon={Mail} required type="email" placeholder="priya@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <InputField label="Password" icon={Lock} required type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            <InputField label="Phone Number" icon={Phone} placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <InputField label="Your Location (City/Area)" icon={MapPin} required placeholder="e.g. Koramangala, Bengaluru" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Back to home
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canNext()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              {submitting ? 'Creating profile...' : <><CheckCircle size={15} /> Sign Up</>}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-5">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-purple-600 hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
}
