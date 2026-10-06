import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../context/AppDataContext';
import {
  Globe, ArrowLeft, ArrowRight, CheckCircle, Building2, Mail,
  Phone, MapPin, FileText, Shield, Users, Lock
} from 'lucide-react';

const NGO_TYPES = [
  { id: 'health', label: 'Health & Medical', emoji: '🏥', desc: 'Medical camps, health services' },
  { id: 'education', label: 'Education', emoji: '📚', desc: 'Schools, tutoring, literacy' },
  { id: 'disaster', label: 'Disaster Relief', emoji: '🚨', desc: 'Emergency response, rescue' },
  { id: 'food', label: 'Food Supply', emoji: '🍱', desc: 'Nutrition, food distribution' },
  { id: 'environment', label: 'Environment', emoji: '🌿', desc: 'Conservation, clean drives' },
  { id: 'women', label: "Women's Rights", emoji: '💜', desc: 'Empowerment, safety, welfare' },
  { id: 'elderly', label: 'Elderly Care', emoji: '👴', desc: 'Senior welfare, support' },
  { id: 'children', label: 'Child Welfare', emoji: '👶', desc: 'Child protection, care' },
];

const COMMON_NEEDS = [
  'Food Distribution', 'Medical Assistance', 'Shelter', 'Clothing',
  'Education Support', 'Legal Aid', 'Psychological Support', 'Vocational Training',
  'Rescue Operations', 'Livelihood Support',
];

const STEPS = ['Organization Info', 'Type & Needs', 'Verification', 'Review'];

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle size={13} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-px max-w-8 ${i < step ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function InputField({ label, icon: Icon, required, note, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
        {note && <span className="text-gray-400 font-normal ml-1 text-xs">({note})</span>}
      </label>
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

export default function NGOSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addUser } = useAppData();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orgName: '',
    contactName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    website: '',
    ngoType: '',
    commonNeeds: [],
    regNumber: '',
    yearFounded: '',
    teamSize: '',
    description: '',
  });

  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm(f => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v],
  }));

  const canNext = () => {
    if (step === 0) return form.orgName && form.email && form.password && form.location && form.contactName;
    if (step === 1) return form.ngoType && form.commonNeeds.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const payload = {
      email: form.email,
      password: form.password,
      role: 'ngo_coordinator',
      name: form.contactName,
      org: form.orgName,
      phone: form.phone,
      location: form.location,
      ngoType: form.ngoType,
    };
    try {
      const { data } = await import('../utils/api').then(m => m.authApi.register(payload));
      // Register in context so in-memory login works immediately
      addUser({ ...payload, ...data });
      login(data);
      navigate('/ngo');
    } catch (err) {
      const isNetwork = !err.response;
      if (isNetwork) {
        // Backend down → register purely in-memory
        const memUser = addUser(payload);
        login(memUser);
        navigate('/ngo');
        return;
      }
      setError(err.response?.data?.detail || 'Registration failed.');
      setStep(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-200 mb-4">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Register Your NGO</h1>
          <p className="text-gray-500 text-sm mt-1">Connect with the right volunteers for every need</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8">
          <StepIndicator step={step} />

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Organization Details</h2>
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              <InputField label="Organization Name" icon={Building2} required placeholder="GreenAid Foundation" value={form.orgName} onChange={e => set('orgName', e.target.value)} />
              <InputField label="Primary Contact Name" icon={Users} required placeholder="Arjun Mehta" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
              <InputField label="Official Email" icon={Mail} required type="email" placeholder="contact@greenaid.org" value={form.email} onChange={e => set('email', e.target.value)} />
              <InputField label="Password" icon={Lock} required type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              <InputField label="Phone Number" icon={Phone} required placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              <InputField label="Headquarters Location" icon={MapPin} required placeholder="e.g. Bangalore, Karnataka" value={form.location} onChange={e => set('location', e.target.value)} />
              <InputField label="Website" note="optional" placeholder="https://greenaid.org" value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Organization Type & Needs</h2>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">NGO Type <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {NGO_TYPES.map(type => (
                    <button key={type.id} type="button"
                      onClick={() => set('ngoType', type.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.ngoType === type.id
                          ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white'
                      }`}>
                      <div className="text-lg mb-1">{type.emoji}</div>
                      <div className={`text-xs font-semibold ${form.ngoType === type.id ? 'text-blue-700' : 'text-gray-700'}`}>{type.label}</div>
                      <div className="text-gray-400 text-xs">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Common Needs You Handle <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal ml-1 text-xs">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_NEEDS.map(need => (
                    <button key={need} type="button"
                      onClick={() => toggle('commonNeeds', need)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.commonNeeds.includes(need)
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {need}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Brief Description</label>
                <textarea
                  value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Tell us about your organization's mission and the communities you serve..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Verification Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <Shield size={14} className="inline mr-1" />
                This information helps us verify your organization and assign a trust score for faster approvals.
              </div>
              <InputField label="NGO Registration Number" icon={FileText} note="optional but recommended" placeholder="e.g. MH/2018/0012345" value={form.regNumber} onChange={e => set('regNumber', e.target.value)} />
              <InputField label="Year Founded" type="number" placeholder="e.g. 2015" value={form.yearFounded} onChange={e => set('yearFounded', e.target.value)} />
              <InputField label="Team Size (approx. volunteers/staff)" icon={Users} type="number" placeholder="e.g. 50" value={form.teamSize} onChange={e => set('teamSize', e.target.value)} />
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
                💡 Organizations with registration numbers get verified status and can submit needs directly to the active pipeline — bypassing manual review.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Review & Submit</h2>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
                {[
                  ['Organization', form.orgName],
                  ['Contact', form.contactName],
                  ['Email', form.email],
                  ['Location', form.location],
                  ['NGO Type', NGO_TYPES.find(t => t.id === form.ngoType)?.label || '—'],
                  ['Reg. Number', form.regNumber || 'Not provided'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Common Needs</div>
                <div className="flex flex-wrap gap-1.5">
                  {form.commonNeeds.map(n => <span key={n} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-medium">{n}</span>)}
                </div>
              </div>
              <div className={`rounded-xl p-4 text-sm border ${form.regNumber ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                {form.regNumber
                  ? '✅ Your organization will receive Verified status and immediate pipeline access.'
                  : '⏳ Your account will be reviewed manually within 24–48 hours.'}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              {step === 0 ? 'Back to home' : 'Back'}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                {submitting ? 'Registering...' : <><CheckCircle size={15} /> Register NGO</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-5">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
}
