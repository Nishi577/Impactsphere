import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { needsApi, impactApi, volunteersApi, interventionsApi, donationsApi } from '../utils/api';
import { StatCard, UrgencyBadge, SourceBadge, TrustBadge, StatusBadge, CategoryBadge, Card, SectionHeader, EmptyState, Skeleton, Toast } from '../components/common/UI';
import { ClipboardList, ArrowRight, Check, X, Shield, MapPin, Star, Package, User, AlertTriangle, Camera, Eye, ChevronDown, ChevronUp, Info, HelpCircle, Users } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { DONATION_CATEGORY_SCHEMA } from '../context/AppDataContext';
import PulsePage from './PulsePage';
import SimulationPage from './SimulationPage';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Heatmap View Component ──────────────────────────────────────────────────

function HeatmapView({ data }) {
  // Ensure data is a valid array before attempting to render
  const safeData = Array.isArray(data) ? data : [];
  
  // Default center for India/Delhi if no data
  const center = safeData.length > 0 && safeData[0].location_lat ? [safeData[0].location_lat, safeData[0].location_lng] : [28.6139, 77.2090];

  // Create a reliable CSS-based pin icon
  const createPinIcon = (urgency) => {
    const color = urgency > 80 ? '#ef4444' : urgency > 60 ? '#f97316' : '#3b82f6';
    return L.divIcon({
      className: 'custom-pin-wrapper',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20]
    });
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {safeData.map((point, idx) => {
          if (!point.location_lat || !point.location_lng) return null;
          return (
            <Marker 
              key={idx}
              position={[point.location_lat, point.location_lng]}
              icon={createPinIcon(point.urgency_score || 50)}
            >
              <Tooltip>
                <div className="font-bold text-xs">{point.category} Case</div>
              </Tooltip>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm capitalize">{point.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${point.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {point.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 italic line-clamp-3">"{point.description}"</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-1.5 rounded border border-gray-100">
                      <div className="text-gray-400 font-semibold text-[9px] uppercase">Urgency</div>
                      <div className={`font-bold ${point.urgency_score > 80 ? 'text-red-600' : point.urgency_score > 60 ? 'text-orange-500' : 'text-blue-600'}`}>{point.urgency_score || 50}/100</div>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded border border-gray-100">
                      <div className="text-gray-400 font-semibold text-[9px] uppercase">Affected</div>
                      <div className="font-bold text-gray-800">{point.affected_count || 0}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default function NGODashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const {
    pendingNeeds, activeNeeds, pendingDonations, allVolunteers,
    acceptDonation, rejectDonation, allInterventions,
  } = useAppData();

  // Backend-sourced states
  const [backendNeeds, setBackendNeeds] = useState([]);
  const [backendQueue, setBackendQueue] = useState([]);
  const [impact, setImpact] = useState(null);
  const [backendDonations, setBackendDonations] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Volunteers state
  const [backendVolunteers, setBackendVolunteers] = useState([]);
  const [volsLoading, setVolsLoading] = useState(false);

  // Verification state
  const [verifyList, setVerifyList] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Donation detail viewer
  const [expandedDonation, setExpandedDonation] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([needsApi.active(), needsApi.reviewQueue(), impactApi.dashboard(), needsApi.heatmap()])
      .then(([a, q, i, h]) => {
        setBackendNeeds(a.data.slice(0, 8));
        setBackendQueue(q.data);
        setImpact(i.data);
        setHeatmapData(h.data);
      }).catch(() => {
        // Backend offline — context data will still be shown
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'Volunteers' && backendVolunteers.length === 0) {
      setVolsLoading(true);
      volunteersApi.all()
        .then(res => setBackendVolunteers(res.data))
        .catch(() => { })
        .finally(() => setVolsLoading(false));
    }
    if (activeTab === 'Donations' && backendDonations.length === 0) {
      donationsApi.pending()
        .then(res => setBackendDonations(res.data))
        .catch(() => { });
    }
    if (activeTab === 'Verify Impact') {
      setVerifyLoading(true);
      interventionsApi.all()
        .then(res => setVerifyList(res.data.filter(i => i.status === 'completed' || i.status === 'needs_revision')))
        .catch(() => { })
        .finally(() => setVerifyLoading(false));
    }
  }, [activeTab]);

  const handleDonation = async (id, action) => {
    try {
      if (action === 'accepted') {
        await donationsApi.approve(id);
        acceptDonation(id);
      } else {
        await donationsApi.reject(id);
        rejectDonation(id);
      }
      setBackendDonations(prev => prev.filter(d => d.id !== id));
      setToast({ msg: `Donation ${action} successfully`, type: action === 'accepted' ? 'success' : 'info' });
    } catch (err) {
      // Fallback to local context if backend fails
      if (action === 'accepted') acceptDonation(id);
      else rejectDonation(id);
      setToast({ msg: `Donation ${action} locally`, type: 'info' });
    }
  };

  // Merge: context active needs (new) on top, then backend needs (deduped by id)
  const backendActiveIds = new Set(backendNeeds.map(n => n.id));
  const contextActiveOnly = activeNeeds.filter(n => !backendActiveIds.has(n.id));
  const mergedNeeds = [...contextActiveOnly, ...backendNeeds];

  // Review queue: context pending needs on top, then backend queue (deduped)
  const backendQueueIds = new Set(backendQueue.map(n => n.id));
  const contextPendingOnly = pendingNeeds.filter(n => !backendQueueIds.has(n.id));
  const mergedQueue = [...contextPendingOnly, ...backendQueue];

  // Volunteers: new context-only on top, then backend
  const backendVolIds = new Set(backendVolunteers.map(v => v.id));
  const contextVolsOnly = allVolunteers.filter(v => !backendVolIds.has(v.id));
  const mergedVolunteers = [...contextVolsOnly, ...backendVolunteers];

  // Donations: new context-only on top, then backend
  const backendDonIds = new Set(backendDonations.map(d => d.id));
  const contextDonOnly = pendingDonations.filter(d => !backendDonIds.has(d.id));
  const mergedDonations = [...contextDonOnly, ...backendDonations];

  // Helper: get readable extra field labels
  const getExtraFieldLabel = (category, key) => {
    const schema = DONATION_CATEGORY_SCHEMA[category];
    if (!schema) return key;
    const field = schema.fields.find(f => f.key === key);
    return field ? field.label : key;
  };

  const renderOverview = () => {
    if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Needs" value={impact?.active_needs ?? mergedNeeds.length} color="blue" icon="📋" />
          <StatCard label="Pending Review" value={mergedQueue.length} color="orange" icon="⏳" />
          <StatCard label="Completed" value={impact?.tasks_completed} color="emerald" icon="✅" />
          <StatCard label="People Helped" value={impact?.total_people_helped?.toLocaleString()} color="purple" icon="👥" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 h-[800px] flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-gray-900 font-semibold flex items-center gap-2">
                  <MapPin size={18} className="text-red-500" /> Community Needs Density Map
                </h2>
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Urgency</span>
                  <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Standard</span>
                </div>
              </div>
              <div className="flex-1 w-full relative min-h-0">
                <HeatmapView data={mergedNeeds} />
              </div>
              <p className="text-[10px] text-gray-400 mt-3 italic text-right shrink-0">
                Live geospatial visualization weighted by urgency score
              </p>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-6 h-[800px] flex flex-col">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h2 className="text-gray-900 font-semibold">Active Needs</h2>
                <Link to="/ngo/interventions" className="text-blue-600 text-xs flex items-center gap-1 hover:underline font-medium">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              {mergedNeeds.length === 0
                ? <EmptyState icon="📭" title="No active needs" desc="Wait for community needs to be reported" />
                : <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                  {mergedNeeds.map(n => (
                    <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${contextActiveOnly.some(cn => cn.id === n.id)
                        ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-white'
                      }`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 text-sm font-semibold mb-1.5 leading-snug">{n.description}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryBadge category={n.category} />
                          <SourceBadge source={n.source} />
                          <TrustBadge trustWeight={n.trust_weight} />
                          {n.is_pattern && (
                            <span className="flex items-center gap-1 bg-red-100 border border-red-300 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                              <AlertTriangle size={10} /> Pattern
                            </span>
                          )}
                          {n.volunteer_request && (
                            <span className="flex items-center gap-1 bg-violet-100 border border-violet-300 text-violet-800 text-xs px-2 py-0.5 rounded-full font-bold">
                              <Users size={10} /> Vol. Requested
                            </span>
                          )}
                          <StatusBadge status={n.status} />
                          <span className="text-gray-400 text-xs font-medium">📍 {n.location_label}</span>
                          <span className="text-gray-400 text-xs">👥 {n.affected_count} affected</span>
                        </div>
                      </div>
                      <UrgencyBadge score={n.urgency_score} />
                    </div>
                  ))}
                </div>
              }

            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderDonations = () => (
    <Card className="p-6">
      <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
        <Package size={18} className="text-emerald-600" /> Pending Donations
        {mergedDonations.length > 0 && (
          <span className="ml-auto bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {mergedDonations.length}
          </span>
        )}
      </h2>
      {mergedDonations.length === 0 ? (
        <EmptyState icon="✨" title="All caught up" desc="No pending donations to review" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mergedDonations.map(d => {
            const isExpanded = expandedDonation === d.id;
            const schema = DONATION_CATEGORY_SCHEMA[d.category];
            return (
              <div key={d.id} className={`border rounded-xl bg-white shadow-sm flex flex-col transition-all ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
                }`}>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-2xl">
                        {d.image}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{d.quantity}</h3>
                        <div className="text-xs text-gray-500 capitalize">{d.category} category</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedDonation(isExpanded ? null : d.id)}
                      className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Eye size={12} />
                      {isExpanded ? 'Less' : 'Details'}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {d.description && (
                    <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2">{d.description}</p>
                  )}

                  {/* Condition badge if available */}
                  {d.condition && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Condition:</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {d.condition}
                      </span>
                    </div>
                  )}

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="mt-1 pt-3 border-t border-gray-100 space-y-3 animate-fade-in">
                      {/* Images placeholder */}
                      {d.images && d.images.length > 0 ? (
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Photos</div>
                          <div className="flex gap-2 overflow-x-auto">
                            {d.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`donation-${idx}`} className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic flex items-center gap-1.5">
                          <Camera size={12} /> No images provided
                        </div>
                      )}

                      {/* Extra category-specific fields */}
                      {d.extra_fields && Object.keys(d.extra_fields).length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Info size={10} /> {schema?.label || d.category} Details
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(d.extra_fields).map(([key, val]) => (
                              <div key={key} className="bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-semibold uppercase">{getExtraFieldLabel(d.category, key)}</div>
                                <div className="text-sm font-medium text-gray-800">
                                  {typeof val === 'boolean' ? (val ? '✅ Yes' : '❌ No') : val || '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bulk/Target info */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {d.is_bulk && (
                          <span className="bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                            📦 Bulk Donation
                          </span>
                        )}
                        {d.target_ngo && d.target_ngo !== 'general' && (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
                            🏢 Directed to: {d.target_ngo}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600 flex justify-between items-center">
                    <div className="flex items-center gap-1.5"><User size={12} /> {d.donor}</div>
                    <div className="text-gray-400">{d.date}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleDonation(d.id, 'accepted')} className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 rounded-lg text-xs font-bold transition-colors">Accept</button>
                    <button onClick={() => handleDonation(d.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-xs font-bold transition-colors">Reject</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );

  const renderVolunteers = () => {
    if (volsLoading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
    return (
      <Card className="p-6">
        <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
          <User size={18} className="text-blue-600" /> Active Volunteers
          {contextVolsOnly.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {contextVolsOnly.length} new
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {mergedVolunteers.map(v => (
            <div key={v.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${contextVolsOnly.some(cv => cv.id === v.id)
                ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-white'
              }`}>
              <div>
                <div className="font-bold text-gray-900 text-sm mb-1">{v.name}</div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {v.location_label || v.location}</span>
                  <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-500" /> {v.active_task_count} active tasks</span>
                </div>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {v.skills?.map(s => <span key={s} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize border border-blue-100">{s}</span>)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-gray-900 flex items-center justify-end gap-1"><Star size={16} className="text-amber-400 fill-amber-400" /> {v.trust_score?.toFixed(1)}</div>
                <div className="text-xs text-gray-400 mt-0.5">Trust Score</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <SectionHeader
        title="NGO Dashboard"
        sub="Manage your community needs and resource allocation"
        action={
          <div className="flex gap-2">
            <Link to="/ngo/review" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors shadow-sm">
              <ClipboardList size={14} />
              Review Queue
              {mergedQueue.length > 0 && <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{mergedQueue.length}</span>}
            </Link>
          </div>
        }
      />

      <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        {['Overview', 'Donations', 'Volunteers', 'Verify Impact', 'Live Pulse', 'Simulation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Donations' && renderDonations()}
        {activeTab === 'Volunteers' && renderVolunteers()}
        {activeTab === 'Verify Impact' && (
          <Card className="p-6">
            <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
              <Camera size={18} className="text-violet-600" /> Impact Verification Queue
            </h2>
            {verifyLoading
              ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}</div>
              : verifyList.length === 0
                ? <EmptyState icon="✅" title="All clear" desc="No interventions pending verification" />
                : <div className="space-y-4">
                  {verifyList.map(interv => (
                    <div key={interv.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="flex items-start gap-4 p-4">
                        {interv.proof_image && (
                          <img src={interv.proof_image} alt="proof" className="w-20 h-16 object-cover rounded-xl border border-gray-200 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 mb-1">Intervention #{interv.id.slice(0, 8)}</div>
                          {interv.impact_note && <p className="text-xs text-gray-500 italic mb-2">"{interv.impact_note}"</p>}
                          {interv.before_image && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-400 font-semibold">Before:</span>
                              <img src={interv.before_image} alt="before" className="h-10 w-16 object-cover rounded-lg border border-gray-100 opacity-75" />
                            </div>
                          )}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${interv.status === 'needs_revision' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
                            }`}>{interv.status === 'needs_revision' ? '⚠️ Needs Revision' : '📋 Pending Verification'}</span>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={async () => {
                              await interventionsApi.verify(interv.id);
                              setVerifyList(prev => prev.filter(i => i.id !== interv.id));
                              setToast({ msg: '✅ Impact verified! Certificate enabled.', type: 'success' });
                            }}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                            <Check size={12} /> Quick Verify
                          </button>
                          <button
                            onClick={async () => {
                              await interventionsApi.rejectImpact(interv.id);
                              setVerifyList(prev => prev.filter(i => i.id !== interv.id));
                              setToast({ msg: 'Revision requested from volunteer.', type: 'info' });
                            }}
                            className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
                            <X size={12} /> Request Revision
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </Card>
        )}
        {activeTab === 'Live Pulse' && <div className="-mt-6"><PulsePage /></div>}
        {activeTab === 'Simulation' && <div className="-mt-6"><SimulationPage /></div>}
      </div>
    </div>
  );
}
