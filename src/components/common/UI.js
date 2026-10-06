import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

// ─── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
const statColors = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', iconBg: 'bg-emerald-100', icon: 'text-emerald-600' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100',    iconBg: 'bg-blue-100',    icon: 'text-blue-600'    },
  purple:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-100',  iconBg: 'bg-violet-100',  icon: 'text-violet-600'  },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-100',  iconBg: 'bg-orange-100',  icon: 'text-orange-600'  },
  red:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-100',     iconBg: 'bg-red-100',     icon: 'text-red-600'     },
};

export function StatCard({ label, value, color = 'emerald', icon, trend }) {
  const c = statColors[color] || statColors.emerald;
  return (
    <div className={`bg-white border ${c.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">{label}</div>
          <div className={`text-2xl font-extrabold ${c.text}`}>{value ?? '—'}</div>
          {trend && <div className="text-xs text-gray-400 mt-1">{trend}</div>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center text-xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
      <div>
        <h1 className="text-gray-900 font-bold text-xl tracking-tight">{title}</h1>
        {sub && <p className="text-gray-500 text-sm mt-0.5">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── UrgencyBadge ────────────────────────────────────────────────────────────
export function UrgencyBadge({ score }) {
  const s = Number(score);
  const cfg = s >= 80
    ? { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Critical' }
    : s >= 60
    ? { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', label: 'High' }
    : s >= 40
    ? { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', label: 'Medium' }
    : { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'Low' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {s} · {cfg.label}
    </span>
  );
}

// ─── CategoryBadge ───────────────────────────────────────────────────────────
const CAT_COLORS = {
  food:           'bg-amber-50 text-amber-700 border-amber-200',
  health:         'bg-red-50 text-red-700 border-red-200',
  education:      'bg-blue-50 text-blue-700 border-blue-200',
  disaster:       'bg-orange-50 text-orange-700 border-orange-200',
  elderly:        'bg-purple-50 text-purple-700 border-purple-200',
  environment:    'bg-green-50 text-green-700 border-green-200',
  infrastructure: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function CategoryBadge({ category }) {
  const cls = CAT_COLORS[category?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${cls}`}>
      {category}
    </span>
  );
}

// ─── SourceBadge ─────────────────────────────────────────────────────────────
export function SourceBadge({ source }) {
  const map = {
    ngo_direct:   { label: 'NGO',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    web_form:     { label: 'Web Form',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    user_portal:  { label: 'User',      cls: 'bg-gray-100 text-gray-700 border-gray-300' },
    volunteer:    { label: 'Volunteer', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    anchor:       { label: 'Anchor',    cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    social_media: { label: 'Social',    cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    government:   { label: 'Gov',       cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    whatsapp_bot: { label: 'WhatsApp',  cls: 'bg-green-50 text-green-700 border-green-200' },
  };
  const cfg = map[source] || { label: source || 'Unknown', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── TrustBadge ──────────────────────────────────────────────────────────────
export function TrustBadge({ trustWeight }) {
  if (trustWeight == null) return null;
  const cfg = trustWeight >= 0.9 
    ? { label: 'High Trust', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🛡️' }
    : trustWeight >= 0.7
    ? { label: 'Medium-High', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: '✅' }
    : trustWeight >= 0.5
    ? { label: 'Medium Trust', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '⚠️' }
    : { label: 'Low Trust', cls: 'bg-red-50 text-red-700 border-red-200', icon: '❓' };
    
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    active:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending:     'bg-yellow-50 text-yellow-700 border-yellow-200',
    resolved:    'bg-gray-100 text-gray-500 border-gray-200',
    rejected:    'bg-red-50 text-red-600 border-red-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    assigned:    'bg-violet-50 text-violet-700 border-violet-200',
    completed:   'bg-emerald-100 text-emerald-800 border-emerald-300',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

// ─── NodeStatusIcon ──────────────────────────────────────────────────────────
export function NodeStatusIcon({ status }) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-emerald-500" />;
  if (status === 'assigned')  return <Clock size={16} className="text-yellow-500" />;
  if (status === 'failed')    return <AlertCircle size={16} className="text-red-500" />;
  return <Circle size={16} className="text-gray-400" />;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />;
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-gray-800 font-semibold mb-1">{title}</div>
      {desc && <div className="text-gray-400 text-sm max-w-xs">{desc}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    error:   'bg-red-50 border-red-300 text-red-800',
    info:    'bg-blue-50 border-blue-300 text-blue-800',
  }[type] || 'bg-gray-50 border-gray-300 text-gray-800';

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg text-sm font-medium animate-fade-in ${cfg}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

// ─── GeminiPanel ─────────────────────────────────────────────────────────────
export function GeminiPanel({ result, loading }) {
  if (loading) return (
    <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-blue-700 text-sm font-semibold">Gemini AI is analyzing...</span>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
  if (!result) return null;
  return (
    <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        <span className="text-blue-800 text-sm font-bold">Gemini AI Analysis</span>
      </div>
      <div className="space-y-3">
        {result.category && (
          <div className="flex justify-between text-sm">
            <span className="text-blue-600 font-medium">Category</span>
            <span className="text-gray-800 font-semibold capitalize">{result.category}</span>
          </div>
        )}
        {result.severity && (
          <div className="flex justify-between text-sm">
            <span className="text-blue-600 font-medium">Severity</span>
            <span className={`font-semibold ${result.severity === 'High' || result.severity === 'Critical' ? 'text-red-600' : result.severity === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>
              {result.severity}
            </span>
          </div>
        )}
        {result.urgency && (
          <div className="flex justify-between text-sm">
            <span className="text-blue-600 font-medium">Urgency</span>
            <span className={`font-semibold ${result.urgency === 'High' || result.urgency === 'Immediate' ? 'text-red-600' : 'text-yellow-600'}`}>
              {result.urgency}
            </span>
          </div>
        )}
        {result.suggested_resources?.length > 0 && (
          <div>
            <div className="text-blue-600 font-medium text-sm mb-1.5">Suggested Resources</div>
            <div className="flex flex-wrap gap-1.5">
              {result.suggested_resources.map(r => (
                <span key={r} className="bg-white border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{r}</span>
              ))}
            </div>
          </div>
        )}
        {result.summary && (
          <p className="text-gray-600 text-sm leading-relaxed border-t border-blue-200 pt-3 mt-2">{result.summary}</p>
        )}
      </div>
    </div>
  );
}
