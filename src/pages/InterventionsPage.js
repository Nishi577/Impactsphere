import React, { useEffect, useRef, useState } from 'react';
import { needsApi, interventionsApi, volunteersApi } from '../utils/api';
import { UrgencyBadge, CategoryBadge, StatusBadge, Card, SectionHeader, EmptyState, Skeleton, NodeStatusIcon, Toast } from '../components/common/UI';
import { Zap, ChevronRight, User, DollarSign, Building, Camera, CheckCircle2, Upload, X, FileText } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ─── ProofUploadPanel ─────────────────────────────────────── */
function ProofUploadPanel({ interv, onDone, onCancel }) {
  const [afterImg, setAfterImg] = useState(null);
  const [beforeImg, setBeforeImg] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const afterRef = useRef();
  const beforeRef = useRef();

  const pickImage = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setter(b64);
  };

  const handleSubmit = async () => {
    if (!afterImg) return;
    setSubmitting(true);
    try {
      await interventionsApi.complete(interv.id, {
        proof_image: afterImg,
        before_image: beforeImg || null,
        impact_note: note || null,
      });
      onDone();
    } catch {
      alert('Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-5 space-y-4">
      <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
        <Camera size={15} className="text-emerald-600" /> Submit Proof of Impact
      </div>

      {/* After image (required) */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">After Photo <span className="text-red-500">*</span></label>
        {afterImg ? (
          <div className="relative inline-block">
            <img src={afterImg} alt="after" className="h-28 w-44 object-cover rounded-xl border border-emerald-200 shadow-sm" />
            <button onClick={() => setAfterImg(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X size={10} /></button>
          </div>
        ) : (
          <button onClick={() => afterRef.current.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-emerald-300 rounded-xl text-sm text-emerald-700 font-medium hover:bg-emerald-50 transition-colors w-full justify-center">
            <Upload size={15} /> Upload After Photo
          </button>
        )}
        <input ref={afterRef} type="file" accept="image/*" className="hidden" onChange={e => pickImage(e, setAfterImg)} />
      </div>

      {/* Before image (optional) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Before Photo <span className="text-gray-400">(optional)</span></label>
        {beforeImg ? (
          <div className="relative inline-block">
            <img src={beforeImg} alt="before" className="h-20 w-36 object-cover rounded-xl border border-gray-200 shadow-sm opacity-80" />
            <button onClick={() => setBeforeImg(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs"><X size={10} /></button>
          </div>
        ) : (
          <button onClick={() => beforeRef.current.click()}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-colors">
            <Upload size={13} /> Add Before Photo
          </button>
        )}
        <input ref={beforeRef} type="file" accept="image/*" className="hidden" onChange={e => pickImage(e, setBeforeImg)} />
      </div>

      {/* Note (optional) */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5"><FileText size={12} /> Note <span className="text-gray-400">(optional)</span></label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Describe what was accomplished..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={handleSubmit} disabled={!afterImg || submitting}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={14} /> Submit Impact Proof</>}
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── VolunteerMatchCard ──────────────────────────────────── */
function VolunteerMatchCard({ match }) {
  const b = match.breakdown;
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-gray-900 font-bold">{match.volunteer.name}</div>
          <div className="text-gray-400 text-xs">{match.volunteer.skills?.join(', ')}</div>
        </div>
        <div className="text-right">
          <div className="text-emerald-600 text-2xl font-bold">{match.score}</div>
          <div className="text-gray-400 text-xs">/10 match</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { label: 'Skill match', val: b.skill_match, icon: '🎯' },
          { label: 'Proximity',   val: b.proximity,   icon: '📍', sub: `${b.distance_km}km` },
          { label: 'Availability',val: b.availability, icon: '⏰' },
          { label: 'Trust score', val: b.trust,        icon: '⭐' },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-2 text-xs">
            <span className="w-4">{row.icon}</span>
            <span className="text-gray-500 w-24">{row.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${row.val * 10}%` }} />
            </div>
            <span className="text-gray-700 w-10 text-right font-medium">{row.val}/10</span>
            {row.sub && <span className="text-gray-400">({row.sub})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ResourceChain ──────────────────────────────────────── */
function ResourceChain({ nodes, intervId, matches = [], onUpdate }) {
  const typeIcon = (type) => {
    if (type === 'volunteer') return <User size={14} />;
    if (type === 'donation')  return <DollarSign size={14} />;
    return <Building size={14} />;
  };
  const completed = nodes.filter(n => n.status === 'completed').length;
  const pct = Math.round((completed / nodes.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-500 text-sm font-medium">Chain Completion</div>
        <div className="text-gray-900 font-bold">{pct}%</div>
      </div>
      <div className="bg-gray-100 rounded-full h-2 mb-5">
        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap items-start gap-2">
        {nodes.map((node, i) => (
          <React.Fragment key={node.id}>
            <div className={`flex flex-col gap-1.5 p-3 rounded-xl border min-w-36 max-w-44 flex-1
              ${node.status === 'completed' ? 'bg-emerald-50 border-emerald-200'
              : node.status === 'assigned'  ? 'bg-yellow-50 border-yellow-200'
              : node.status === 'failed'    ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center gap-1.5">
                <NodeStatusIcon status={node.status} />
                <span className={`p-1 rounded ${node.resource_type === 'volunteer' ? 'text-blue-500' : node.resource_type === 'donation' ? 'text-amber-500' : 'text-purple-500'}`}>
                  {typeIcon(node.resource_type)}
                </span>
              </div>
              <div className="text-gray-900 text-xs font-medium leading-tight">{node.requirement_label}</div>
              {node.assigned_name && (
                <div className="text-emerald-600 text-xs font-bold truncate">→ {node.assigned_name}</div>
              )}
              {node.resource_type === 'volunteer' && matches.length > 0 && (
                <select 
                  className="text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 text-blue-600 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={node.assigned_name || ''}
                  onChange={async e => {
                    await interventionsApi.updateNode(node.id, { 
                      status: 'assigned',
                      assigned_name: e.target.value 
                    });
                    onUpdate();
                  }}
                >
                  <option value="">Assign Volunteer...</option>
                  {matches.map((m, i) => (
                    <option key={i} value={m.volunteer.name}>{m.volunteer.name} ({m.score}/10)</option>
                  ))}
                </select>
              )}
              {node.status === 'failed' && (
                <div className="text-red-500 text-[10px] animate-pulse font-bold">Reassigning...</div>
              )}
              <select className="text-xs bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-600 mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={node.status}
                onChange={async e => {
                  await interventionsApi.updateNode(node.id, { status: e.target.value });
                  onUpdate();
                }}>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            {i < nodes.length - 1 && <ChevronRight size={16} className="text-gray-300 mt-5 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function InterventionsPage() {
  const [needs, setNeeds] = useState([]);
  const [interventions, setInterventions] = useState({});
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(null);
  const [toast, setToast] = useState(null);
  const [proofPanel, setProofPanel] = useState(null); // interv id

  const fetchData = async () => {
    const { data: ns } = await needsApi.active();
    setNeeds(ns);
    const intervMap = {};
    for (const n of ns) {
      try {
        const { data: i } = await interventionsApi.byNeed(n.id);
        if (i) intervMap[n.id] = i;
      } catch {}
    }
    setInterventions(intervMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAllocate = async (needId) => {
    setAllocating(needId);
    try {
      const { data: interv } = await interventionsApi.allocate(needId);
      setInterventions(prev => ({ ...prev, [needId]: interv }));
      const { data: m } = await volunteersApi.matches(needId);
      setMatches(prev => ({ ...prev, [needId]: m.slice(0, 3) }));
      setToast({ msg: 'Resource chain assembled! Volunteers matched.', type: 'success' });
    } catch {
      setToast({ msg: 'Allocation failed', type: 'error' });
    }
    setAllocating(null);
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader title="Active Interventions" sub="Resource chains for each active need" />

      {needs.length === 0 ? (
        <Card className="p-12"><EmptyState icon="🎯" title="No active needs" desc="Approve needs from the review queue to trigger allocation" /></Card>
      ) : needs.map(n => {
        const interv = interventions[n.id];
        const isVerified = interv?.status === 'verified_impact';
        const isCompleted = interv?.status === 'completed';
        return (
          <Card key={n.id} className={`p-6 ${isVerified ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>
            {/* Need header */}
            <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <CategoryBadge category={n.category} />
                  <StatusBadge status={n.status} />
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      ✅ Verified Impact
                    </span>
                  )}
                  {isCompleted && !isVerified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      📋 Awaiting NGO Verification
                    </span>
                  )}
                </div>
                <div className="text-gray-900 font-semibold mb-1 leading-snug">{n.description}</div>
                <div className="text-gray-400 text-xs"><span className="font-medium text-gray-600">📍 {n.location_label}</span> · 👥 {n.affected_count} affected</div>
              </div>
              <UrgencyBadge score={n.urgency_score} />
            </div>

            {interv ? (
              <div className="space-y-5">
                <ResourceChain 
                  nodes={interv.chain_nodes} 
                  intervId={interv.id} 
                  matches={matches[n.id] || []}
                  onUpdate={fetchData} 
                />

                {matches[n.id] && matches[n.id].length > 0 && (
                  <div>
                    <div className="text-gray-600 text-sm font-semibold mb-3">Best Volunteer Matches</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {matches[n.id].map((m, i) => <VolunteerMatchCard key={i} match={m} />)}
                    </div>
                  </div>
                )}

                {!matches[n.id] && (
                  <button onClick={async () => {
                    const { data } = await volunteersApi.matches(n.id);
                    setMatches(prev => ({ ...prev, [n.id]: data.slice(0, 3) }));
                  }} className="text-sm text-blue-600 hover:underline font-medium">
                    Show volunteer match scores →
                  </button>
                )}

                {/* Proof of Impact section */}
                {isVerified ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-bold text-sm flex items-center gap-2">✅ Impact Verified by NGO</span>
                      <button
                        onClick={() => {
                          const win = window.open('', '_blank');
                          win.document.write(`
                            <html><head><title>Impact Certificate</title>
                            <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}
                            .badge{background:#d1fae5;color:#065f46;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:700;display:inline-block;margin-bottom:16px}
                            h1{color:#1f2937;font-size:24px}
                            .field{margin:8px 0;font-size:14px;color:#374151}
                            .label{color:#6b7280;font-weight:600;text-transform:uppercase;font-size:11px}
                            img{max-width:100%;border-radius:12px;margin-top:12px}
                            </style></head>
                            <body>
                              <div class="badge">✅ Verified Impact Certificate</div>
                              <h1>Proof of Impact</h1>
                              <div class="field"><div class="label">Category</div>${n.category}</div>
                              <div class="field"><div class="label">Location</div>${n.location_label}</div>
                              <div class="field"><div class="label">Affected</div>${n.affected_count} people</div>
                              <div class="field"><div class="label">Description</div>${n.description}</div>
                              ${interv.impact_note ? `<div class="field"><div class="label">Notes</div>${interv.impact_note}</div>` : ''}
                              ${interv.proof_image ? `<div class="label" style="margin-top:16px">After Photo</div><img src="${interv.proof_image}" />` : ''}
                              ${interv.before_image ? `<div class="label" style="margin-top:16px">Before Photo</div><img src="${interv.before_image}" />` : ''}
                            </body></html>
                          `);
                          win.document.close();
                          win.print();
                        }}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors"
                      >
                        🏆 Generate Certificate
                      </button>
                    </div>
                    {interv.proof_image && (
                      <div className="flex gap-3 flex-wrap">
                        <div>
                          <div className="text-xs text-emerald-700 font-semibold mb-1">After</div>
                          <img src={interv.proof_image} alt="proof" className="h-24 w-36 object-cover rounded-xl border border-emerald-200 shadow-sm" />
                        </div>
                        {interv.before_image && (
                          <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Before</div>
                            <img src={interv.before_image} alt="before" className="h-24 w-36 object-cover rounded-xl border border-gray-200 shadow-sm opacity-75" />
                          </div>
                        )}
                      </div>
                    )}
                    {interv.impact_note && <p className="text-sm text-emerald-800 bg-emerald-100 rounded-xl px-4 py-3 italic">"{interv.impact_note}"</p>}
                  </div>
                ) : interv.status === 'needs_revision' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800 font-medium flex items-center gap-2">
                    ⚠️ NGO requested revision. Please re-submit with better evidence.
                    <button onClick={() => setProofPanel(interv.id)} className="ml-auto text-xs bg-orange-200 text-orange-800 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-300 transition-colors">
                      Re-submit
                    </button>
                  </div>
                ) : interv.chain_completion_pct >= 50 && !interv.proof_image ? (
                  <div>
                    {proofPanel === interv.id ? (
                      <ProofUploadPanel
                        interv={interv}
                        onDone={() => { setProofPanel(null); fetchData(); setToast({ msg: 'Proof submitted! Awaiting NGO verification.', type: 'success' }); }}
                        onCancel={() => setProofPanel(null)}
                      />
                    ) : (
                      <button onClick={() => setProofPanel(interv.id)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                        <Camera size={14} /> Mark Complete — Upload Proof
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="text-gray-700 text-sm font-semibold">No resource chain assembled yet</div>
                  <div className="text-gray-400 text-xs mt-0.5">Trigger the allocation engine to auto-assemble</div>
                </div>
                <button
                  onClick={() => handleAllocate(n.id)}
                  disabled={allocating === n.id}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  <Zap size={14} />
                  {allocating === n.id ? 'Assembling...' : 'Allocate Resources'}
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
