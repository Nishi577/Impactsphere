import React, { useEffect, useState } from 'react';
import { needsApi, volunteersApi } from '../utils/api';
import { useAppData } from '../context/AppDataContext';
import { UrgencyBadge, SourceBadge, CategoryBadge, TrustBadge, Card, SectionHeader, EmptyState, Skeleton, Toast } from '../components/common/UI';
import { Check, X, FolderOpen, ChevronDown, ChevronUp, AlertTriangle, Users, Briefcase, Activity } from 'lucide-react';

const HELP_TYPE_LABELS = {
  distribution: 'Distribution & Logistics', medical: 'Medical Support',
  teaching: 'Teaching & Training', rescue: 'Rescue Operations',
  counseling: 'Counseling & Support', general: 'General Help',
};

export default function ReviewQueue() {
  const { pendingNeeds, approveNeed, rejectNeed } = useAppData();
  const [backendNeeds, setBackendNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [suggestedVolunteers, setSuggestedVolunteers] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});
  const [editing, setEditing] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  const fetchMatches = async (needId) => {
    if (suggestedVolunteers[needId]) return;
    setLoadingMatches(prev => ({ ...prev, [needId]: true }));
    try {
      const { data } = await volunteersApi.matches(needId);
      setSuggestedVolunteers(prev => ({ ...prev, [needId]: data.slice(0, 1)[0] }));
    } catch (err) {
      console.error("Match fetch failed", err);
    } finally {
      setLoadingMatches(prev => ({ ...prev, [needId]: false }));
    }
  };

  useEffect(() => {
    if (expanded) fetchMatches(expanded);
  }, [expanded]);

  const fetchQueue = () => {
    setLoading(true);
    needsApi.reviewQueue()
      .then(r => setBackendNeeds(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const backendIds = new Set(backendNeeds.map(n => n.id));
  const contextOnly = pendingNeeds.filter(n => !backendIds.has(n.id));
  const needs = [...contextOnly, ...backendNeeds];

  const handleApprove = async (id) => {
    try { await needsApi.approve(id); } catch (_) {}
    approveNeed(id);
    setBackendNeeds(prev => prev.filter(n => n.id !== id));
    setToast({ msg: '✅ Need approved → Intervention auto-created and entered pipeline', type: 'success' });
  };

  const handleReject = async (id) => {
    try { await needsApi.reject(id); } catch (_) {}
    rejectNeed(id);
    setBackendNeeds(prev => prev.filter(n => n.id !== id));
    setConfirmReject(null);
    setToast({ msg: 'Need rejected and logged', type: 'info' });
  };

  const handleEdit = async (id) => {
    try { await needsApi.edit(id, editing[id] || {}); } catch (_) {}
    setToast({ msg: 'Need updated', type: 'success' });
    setEditing(e => ({ ...e, [id]: null }));
    fetchQueue();
  };

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {confirmReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto"><X size={20} className="text-red-500" /></div>
            <h3 className="text-gray-900 font-bold mb-2 text-center">Reject this need?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">This will be logged and the classifier will be updated.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReject(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => handleReject(confirmReject)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}

      <SectionHeader
        title="Review Queue"
        sub={`${needs.length} need${needs.length !== 1 ? 's' : ''} pending your review${contextOnly.length > 0 ? ` (${contextOnly.length} newly submitted)` : ''}`}
      />

      {needs.length === 0
        ? <Card className="p-12"><EmptyState icon="✅" title="Queue is clear" desc="All needs have been reviewed. Great work!" /></Card>
        : needs.map(n => (
          <Card key={n.id} className={`overflow-hidden ${contextOnly.some(c => c.id === n.id) ? 'ring-2 ring-amber-300' : ''}`}>
            {contextOnly.some(c => c.id === n.id) && (
              <div className="bg-amber-50 border-b border-amber-100 px-5 py-1.5 text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                🆕 Newly submitted — pending review
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <SourceBadge source={n.source} />
                    <TrustBadge trustWeight={n.trust_weight} />
                    <CategoryBadge category={n.category} />
                    {n.is_pattern && (
                      <span className="flex items-center gap-1 bg-red-100 border border-red-300 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                        <AlertTriangle size={12} /> Pattern Detected
                      </span>
                    )}
                    {n.confidence_score < 0.7 && (
                      <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        ⚠️ Low confidence ({(n.confidence_score * 100).toFixed(0)}%)
                      </span>
                    )}
                    {n.volunteer_request && (
                      <span className="flex items-center gap-1 bg-violet-100 border border-violet-300 text-violet-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        <Users size={12} /> Volunteer Request
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-semibold mb-2 leading-snug">{n.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">📍 {n.location_label}</span>
                    <span>👥 {n.affected_count} affected</span>
                    <span>🔥 Severity: <strong className="text-gray-700">{n.severity}/10</strong></span>
                    <span>⏰ Sensitivity: <strong className="text-gray-700">{n.time_sensitivity}/10</strong></span>
                    <span>🏢 {n.ngo_name || n.ngo}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <UrgencyBadge score={n.urgency_score} />
                  <div className="flex gap-2">
                    <button onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">
                      <FolderOpen size={14} /> Open Case {expanded === n.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <button onClick={() => setConfirmReject(n.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                      <X size={12} /> Reject
                    </button>
                    <button onClick={() => handleApprove(n.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                      <Check size={12} /> Approve
                    </button>
                  </div>
                </div>
              </div>

              {expanded === n.id && (
                <div className="mt-4 pt-5 border-t border-gray-100 bg-gray-50/50 -mx-5 px-5 pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1.5">Detailed Description</label>
                        <p className="text-sm text-gray-800 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">{n.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Category / Type</label>
                          <div className="text-sm font-semibold text-gray-900 capitalize">{n.category}</div>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Exact Location</label>
                          <div className="text-sm font-semibold text-gray-900">{n.location_label}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                        <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2.5">Required Resources (Estimated)</label>
                        <ul className="space-y-2.5 text-sm">
                          <li className="flex items-center gap-2.5 text-gray-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {Math.max(1, Math.ceil((n.affected_count || 10) / 10))} Volunteers needed
                          </li>
                          <li className="flex items-center gap-2.5 text-gray-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {n.affected_count || 10} units of {n.category === 'food' ? 'Ration kits' : n.category === 'health' ? 'Medical supplies' : 'Relief material'}
                          </li>
                        </ul>
                      </div>

                      {/* Volunteer Request Details */}
                      {n.volunteer_request && (
                        <div className="bg-violet-50 p-3.5 rounded-xl border border-violet-200">
                          <label className="text-violet-600 text-xs font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                            <Users size={12} /> Volunteer Support Request
                          </label>
                          <div className="space-y-1.5 text-sm">
                            {n.volunteer_count > 0 && (
                              <div className="flex items-center gap-2 text-gray-700"><span className="font-semibold">{n.volunteer_count}</span> volunteer{n.volunteer_count > 1 ? 's' : ''} requested</div>
                            )}
                            {n.volunteer_help_type && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Briefcase size={12} className="text-violet-500" />
                                <span>{HELP_TYPE_LABELS[n.volunteer_help_type] || n.volunteer_help_type}</span>
                              </div>
                            )}
                            {n.volunteer_notes && (
                              <p className="text-xs text-gray-500 italic mt-1 border-l-2 border-violet-200 pl-2">{n.volunteer_notes}</p>
                            )}
                            
                            {/* AI Match Suggestion */}
                            <div className="mt-4 pt-3 border-t border-violet-100">
                              <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Briefcase size={10} /> AI Assignment Preview
                              </div>
                              {loadingMatches[n.id] ? (
                                <div className="flex items-center gap-2 text-xs text-violet-400 animate-pulse">
                                  <div className="w-3 h-3 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" />
                                  Finding best matches...
                                </div>
                              ) : suggestedVolunteers[n.id] ? (
                                <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg border border-violet-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                                      {suggestedVolunteers[n.id].volunteer.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-gray-800">{suggestedVolunteers[n.id].volunteer.name}</div>
                                      <div className="text-[10px] text-gray-500">{suggestedVolunteers[n.id].score}/10 Match Score</div>
                                    </div>
                                  </div>
                                  <div className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                    Top Match
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">No available volunteers found in area</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status transition info */}
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                        <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <Activity size={12} /> Approval Flow
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pending</span>
                          <span className="text-gray-300">→</span>
                          <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Approved</span>
                          <span className="text-gray-300">→</span>
                          <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Intervention Active</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2">Approving will auto-create an Intervention and reflect in the Interventions tab in real-time.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-3">
                    <button onClick={() => setExpanded(null)}
                      className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors shadow-sm">
                      Close Case
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))
      }
    </div>
  );
}
