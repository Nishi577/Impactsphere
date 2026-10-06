import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, ArrowRight, Users, Building2, BarChart3, Zap, MapPin,
  Shield, CheckCircle, Heart, ChevronRight, Star, TrendingUp,
  Cpu, Activity
} from 'lucide-react';

const STATS = [
  { value: '12,400+', label: 'People Helped', icon: Users },
  { value: '340+', label: 'Active NGOs', icon: Building2 },
  { value: '98%', label: 'Match Accuracy', icon: Star },
  { value: '2.4h', label: 'Avg Response Time', icon: Activity },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'NGOs Report Needs',
    desc: 'NGOs and field workers submit community needs in plain language. Our AI structures and prioritizes them instantly.',
    icon: Building2,
    color: 'emerald',
  },
  {
    step: '02',
    title: 'AI Scores & Classifies',
    desc: 'Gemini AI converts raw inputs into structured data — assigning urgency scores, categories, and resource requirements.',
    icon: Cpu,
    color: 'blue',
  },
  {
    step: '03',
    title: 'Smart Volunteer Matching',
    desc: 'Our algorithm matches volunteers by skills, proximity, and availability to the most impactful tasks.',
    icon: Users,
    color: 'violet',
  },
  {
    step: '04',
    title: 'Track Real Impact',
    desc: 'Live dashboards show how resources are deployed, who\'s helped, and where the next intervention is needed.',
    icon: BarChart3,
    color: 'orange',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Urgency Scoring',
    desc: 'Every need gets an urgency score based on severity, affected population, and time sensitivity.',
    color: 'emerald',
  },
  {
    icon: MapPin,
    title: 'Live Need Heatmaps',
    desc: 'Visual geographic overview of active needs, resource gaps, and volunteer coverage.',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Trust-Based NGO Verification',
    desc: 'NGOs earn trust scores based on their track record, enabling faster approvals for high-trust submissions.',
    color: 'violet',
  },
  {
    icon: TrendingUp,
    title: 'Impact Tracking',
    desc: 'Detailed reports showing people helped, resources deployed, and outcomes per intervention.',
    color: 'orange',
  },
  {
    icon: Users,
    title: 'Multi-Skill Volunteer Profiles',
    desc: 'Volunteers list skills, languages, and availability for accurate matching to the right needs.',
    color: 'pink',
  },
  {
    icon: Activity,
    title: 'Community Pulse Monitoring',
    desc: 'Automated signal detection from community data to catch emerging crises before they escalate.',
    color: 'teal',
  },
];

const TESTIMONIALS = [
  {
    quote: 'ImpactSphere cut our volunteer coordination time by 70%. What used to take days now happens in hours.',
    name: 'Priya Sharma',
    role: 'Director, GreenAid Foundation',
    initials: 'PS',
    color: 'emerald',
  },
  {
    quote: 'The AI matching is remarkable. Volunteers with exactly the right skills now reach the right places.',
    name: 'Arjun Mehta',
    role: 'Field Coordinator, CareNet India',
    initials: 'AM',
    color: 'blue',
  },
  {
    quote: 'Real-time heatmaps changed how we deploy resources. We can see gaps and act before situations worsen.',
    name: 'Sarah Thomas',
    role: 'Operations Head, ReliefBridge',
    initials: 'ST',
    color: 'violet',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', badge: 'bg-pink-100 text-pink-700', icon: 'text-pink-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', badge: 'bg-teal-100 text-teal-700', icon: 'text-teal-500' },
};

function Navbar({ navigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Globe size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">ImpactSphere</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['How it works', 'Features', 'Impact'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">
            Sign In
          </button>
          <button onClick={() => navigate('/signup/volunteer')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar navigate={navigate} />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Subtle bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap size={11} />
                Powered by Google Gemini AI
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
                Smart allocation of <span className="text-emerald-600">volunteers</span>, donations &{' '}
                <span className="text-blue-600">services</span> for real-world impact
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl lg:max-w-none">
                ImpactSphere helps NGOs coordinate resources intelligently — matching the right volunteers to the right needs at the right time, with AI-driven urgency scoring and live impact tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button onClick={() => navigate('/signup/volunteer')}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5">
                  <Heart size={16} />
                  Join as Volunteer
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/signup/ngo')}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3.5 rounded-xl border border-gray-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <Building2 size={16} />
                  Register NGO
                </button>
                <button onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 font-medium px-4 py-3.5 rounded-xl transition-colors text-sm">
                  Explore Dashboard
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="flex-1 w-full max-w-lg">
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
                {/* Mock dashboard header */}
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full max-w-40 mx-auto" />
                </div>
                <div className="p-5 space-y-3">
                  {/* Stat row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[['1,240', 'Helped', 'emerald'], ['18', 'Active Needs', 'blue'], ['94%', 'Match Rate', 'violet']].map(([v, l, c]) => (
                      <div key={l} className={`${colorMap[c].bg} rounded-xl p-3`}>
                        <div className={`text-xl font-bold ${colorMap[c].text}`}>{v}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Need cards */}
                  {[
                    { label: 'Food Distribution — Ward 5', urgency: 87, cat: 'Food', color: 'emerald' },
                    { label: 'Medical Camp Setup Needed', urgency: 74, cat: 'Health', color: 'blue' },
                    { label: 'School Supplies Shortage', urgency: 52, cat: 'Education', color: 'violet' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-10 rounded-full ${item.urgency >= 80 ? 'bg-red-400' : item.urgency >= 60 ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 text-sm font-medium truncate">{item.label}</div>
                        <div className={`text-xs mt-0.5 ${colorMap[item.color].text} font-medium`}>{item.cat}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${item.urgency >= 80 ? 'text-red-500' : item.urgency >= 60 ? 'text-orange-500' : 'text-yellow-600'}`}>
                          {item.urgency}
                        </div>
                        <div className="text-gray-400 text-xs">urgency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-gray-700 text-xs font-medium">3 matches found for Ward 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
              <div className="text-gray-500 text-sm font-medium flex items-center justify-center gap-1.5">
                <Icon size={13} className="text-emerald-500" />
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              How It Works
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">From need to impact in 4 steps</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">A seamless pipeline from field reporting to volunteer deployment to measurable outcomes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => {
              const colors = colorMap[item.color];
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-gray-200 z-0" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% - 1rem)' }} />
                  )}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-200 transition-all hover:-translate-y-1">
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.bg} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className={colors.icon} />
                    </div>
                    <div className={`text-xs font-bold ${colors.text} mb-2`}>STEP {item.step}</div>
                    <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Features
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything NGOs need, in one place</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built for real-world operations — from crisis detection to volunteer dispatch to impact reporting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => {
              const colors = colorMap[color];
              return (
                <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-gray-200 transition-all">
                  <div className={`inline-flex items-center justify-center w-10 h-10 ${colors.bg} rounded-xl mb-4`}>
                    <Icon size={18} className={colors.icon} />
                  </div>
                  <h3 className="text-gray-900 font-bold mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact / Testimonials */}
      <section id="impact" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Impact
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Trusted by NGOs across India</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Real coordinators, real results, real communities helped.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials, color }) => {
              const colors = colorMap[color];
              return (
                <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold`}>
                      {initials}
                    </div>
                    <div>
                      <div className="text-gray-900 text-sm font-semibold">{name}</div>
                      <div className="text-gray-400 text-xs">{role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to multiply your impact?</h2>
          <p className="text-emerald-100 text-lg mb-10">Join hundreds of NGOs already using ImpactSphere to deploy resources smarter and help more people.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup/volunteer')}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-base">
              <Heart size={18} />
              Join as Volunteer
            </button>
            <button onClick={() => navigate('/signup/ngo')}
              className="flex items-center justify-center gap-2 bg-emerald-500/30 border border-emerald-400/50 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-500/50 transition-colors text-base">
              <Building2 size={18} />
              Register Your NGO
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe size={13} className="text-white" />
            </div>
            <span className="text-white font-bold">ImpactSphere</span>
          </div>
          <div className="text-sm">Built for social good · Powered by Google Gemini AI</div>
          <div className="flex items-center gap-6 text-sm">
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/signup/volunteer')} className="hover:text-white transition-colors">Volunteer</button>
            <button onClick={() => navigate('/signup/ngo')} className="hover:text-white transition-colors">NGO</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
