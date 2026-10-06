import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../context/AppDataContext';
import {
  Globe, ArrowLeft, ArrowRight, CheckCircle, User, Mail, Phone,
  MapPin, Clock, Languages, BookOpen, Heart, Lock
} from 'lucide-react';

const SKILLS = [
  { id: 'teaching', label: 'Teaching', emoji: '📚' },
  { id: 'medical', label: 'Medical', emoji: '🏥' },
  { id: 'logistics', label: 'Logistics', emoji: '🚚' },
  { id: 'rescue', label: 'Rescue & Relief', emoji: '🚨' },
  { id: 'general', label: 'General Help', emoji: '🤝' },
  { id: 'counseling', label: 'Counseling', emoji: '💬' },
  { id: 'it_tech', label: 'IT / Tech', emoji: '💻' },
  { id: 'construction', label: 'Construction', emoji: '🔨' },
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'];

const AVAILABILITY = [
  { id: 'weekdays', label: 'Weekdays', desc: 'Mon – Fri' },
  { id: 'weekends', label: 'Weekends', desc: 'Sat – Sun' },
  { id: 'evenings', label: 'Evenings', desc: 'After 6 PM' },
  { id: 'fulltime', label: 'Full-time', desc: 'Any time' },
  { id: 'emergency', label: 'Emergency only', desc: 'On-call basis' },
];

const STEPS = ['Personal Info', 'Skills & Availability', 'Review & Submit'];

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px max-w-12 transition-all ${i < step ? 'bg-emerald-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

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

export default function VolunteerSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addUser } = useAppData();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    skills: [],
    availability: [],
    languages: [],
    experience: '',
    bio: '',
  });

  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm(f => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v],
  }));

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.location && form.password;
    if (step === 1) return form.skills.length > 0 && form.availability.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const payload = {
      email: form.email,
      password: form.password,
      role: 'volunteer',
      name: form.name,
      phone: form.phone,
      location: form.location,
      skills: form.skills,
      availability: form.availability,
      languages: form.languages,
    };
    try {
      const { data } = await import('../utils/api').then(m => m.authApi.register(payload));
      // Register in context (adds to volunteers list too)
      addUser({ ...payload, ...data });
      login(data);
      navigate('/volunteer');
    } catch (err) {
      const isNetwork = !err.response;
      if (isNetwork) {
        // Backend down → register purely in-memory
        const memUser = addUser(payload);
        login(memUser);
        navigate('/volunteer');
        return;
      }
      setError(err.response?.data?.detail || 'Registration failed.');
      setStep(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-4">
            <Globe size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Join as a Volunteer</h1>
          <p className="text-gray-500 text-sm mt-1">Help communities that need you most</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8">
          <StepIndicator step={step} />

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Tell us about yourself</h2>
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              <InputField label="Full Name" icon={User} required placeholder="Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              <InputField label="Email Address" icon={Mail} required type="email" placeholder="priya@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              <InputField label="Password" icon={Lock} required type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              <InputField label="Phone Number" icon={Phone} placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              <InputField label="Your Location (City/Area)" icon={MapPin} required placeholder="e.g. Koramangala, Bengaluru" value={form.location} onChange={e => set('location', e.target.value)} />
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Brief Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Tell NGOs a bit about yourself and your motivation..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Skills & Availability</h2>

              {/* Skills */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-emerald-500" />
                  Your Skills <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILLS.map(skill => (
                    <button key={skill.id} type="button"
                      onClick={() => toggle('skills', skill.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        form.skills.includes(skill.id)
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-1 ring-emerald-300'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white'
                      }`}>
                      <span className="text-base">{skill.emoji}</span>
                      {skill.label}
                      {form.skills.includes(skill.id) && <CheckCircle size={13} className="ml-auto text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-500" />
                  Availability <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY.map(opt => (
                    <button key={opt.id} type="button"
                      onClick={() => toggle('availability', opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.availability.includes(opt.id)
                          ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white'
                      }`}>
                      <div className={`text-sm font-semibold ${form.availability.includes(opt.id) ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Languages size={14} className="text-violet-500" />
                  Languages you speak
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button key={lang} type="button"
                      onClick={() => toggle('languages', lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.languages.includes(lang)
                          ? 'bg-violet-50 border-violet-400 text-violet-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <InputField label="Years of Volunteering Experience" icon={Heart} type="number" placeholder="0" value={form.experience} onChange={e => set('experience', e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Review your profile</h2>
              <p className="text-gray-500 text-sm">Everything looks good? Submit to create your volunteer profile.</p>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
                {[
                  ['Name', form.name],
                  ['Email', form.email],
                  ['Phone', form.phone || '—'],
                  ['Location', form.location],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map(s => <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{SKILLS.find(sk => sk.id === s)?.label}</span>)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Availability</div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.availability.map(a => <span key={a} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{AVAILABILITY.find(av => av.id === a)?.label}</span>)}
                  </div>
                </div>
                {form.languages.length > 0 && (
                  <div>
                    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Languages</div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.languages.map(l => <span key={l} className="bg-violet-50 text-violet-700 border border-violet-200 text-xs px-2.5 py-1 rounded-full font-medium">{l}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
                ✨ Your profile will be used to match you with the most relevant volunteer opportunities near you.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              {step === 0 ? 'Back to home' : 'Back'}
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                {submitting ? 'Creating profile...' : <><CheckCircle size={15} /> Create My Profile</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-5">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-emerald-600 hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
}
