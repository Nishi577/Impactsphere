import React, { useEffect, useState } from 'react';
import { volunteersApi, needsApi, donationsApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../context/AppDataContext';
import { Card, SectionHeader, UrgencyBadge, CategoryBadge, StatusBadge, EmptyState, Skeleton, Toast } from '../components/common/UI';
import { Star, MapPin, Award, Heart, Send, PackagePlus, UploadCloud, Users, Briefcase, Clock, X } from 'lucide-react';

const BADGE_ICONS = {
  first_responder:       { icon: '🚀', label: 'First Responder' },
  consistent_contributor:{ icon: '⭐', label: 'Consistent Contributor' },
  skill_expert:          { icon: '🎯', label: 'Skill Expert' },
  community_champion:    { icon: '🏆', label: 'Community Champion' },
};

const HELP_TYPE_LABELS = {
  distribution: '📦 Distribution & Logistics',
  medical: '🏥 Medical Support',
  teaching: '📚 Teaching & Training',
  rescue: '🚨 Rescue Operations',
  counseling: '💬 Counseling & Support',
  general: '🤝 General Help',
};

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { addNeed, addDonation, volunteerOpportunities } = useAppData();
  const [activeTab, setActiveTab] = useState('My Portal');
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOpportunities, setBackendOpportunities] = useState([]);

  // Submit Need State
  const [needForm, setNeedForm] = useState({ category: 'food', description: '', severity: 5, affected_count: 10, time_sensitivity: 5, location_label: '', location_lat: 28.6139, location_lng: 77.2090 });
  const [needSubmitting, setNeedSubmitting] = useState(false);

  // Donate Items State
  const [donateForm, setDonateForm] = useState({ category: 'food', quantity: '', description: '', is_bulk: false, target_ngo: 'general', images: [] });
  const [donateSubmitting, setDonateSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (user?.volunteer_id && isMounted) {
          const [pRes, oppsRes] = await Promise.all([
            volunteersApi.profile(user.volunteer_id),
            needsApi.volunteerOpportunities()
          ]);
          if (isMounted) {
            setProfile(pRes.data);
            setBackendOpportunities(oppsRes.data);
          }
        }
      } catch (err) {
        if (err.response?.status === 404 && isMounted) {
          setToast({ msg: '⚠️ Session expired or User not found. Please log out and in again.', type: 'error' });
        }
        console.error("Data fetch failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Real-time polling every 5 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  const handleCompleteTask = async (nodeId) => {
    try {
      await interventionsApi.updateNode(nodeId, { status: 'completed' });
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          assigned_tasks: prev.assigned_tasks.map(t => t.node_id === nodeId ? { ...t, node_status: 'completed' } : t),
          active_task_count: Math.max(0, prev.active_task_count - 1),
          total_impact_points: prev.total_impact_points + 50
        };
      });
      setToast({ msg: '🎉 Task marked as completed! 50 Impact Points awarded.', type: 'success' });
    } catch (err) {
      setToast({ msg: 'Failed to update task status.', type: 'error' });
    }
  };

  const handleNeedSubmit = async (e) => {
    e.preventDefault();
    setNeedSubmitting(true);
    const payload = { ...needForm, source: 'volunteer' };
    try { await needsApi.submit(payload); } catch (_) {}
    addNeed(payload, 'volunteer');
    setToast({ msg: '✅ Need reported! Now visible in NGO Review Queue.', type: 'success' });
    setNeedForm({ category: 'food', description: '', severity: 5, affected_count: 10, time_sensitivity: 5, location_label: '', location_lat: 28.6139, location_lng: 77.2090 });
    setNeedSubmitting(false);
    setActiveTab('My Portal');
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setDonateSubmitting(true);
    const donorName = user?.name || 'Volunteer';
    const payload = { ...donateForm, donor_name: donorName };

    try {
      await donationsApi.submit(payload);
    } catch (err) {
      console.error("Backend donation failed:", err);
    }

    addDonation(donateForm, donorName);
    setToast({ msg: '🎁 Donation pledged! Now visible in NGO Donations tab.', type: 'success' });
    setDonateForm({ category: 'food', quantity: '', description: '', is_bulk: false, target_ngo: 'general', images: [] });
    setDonateSubmitting(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDonateForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setDonateForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;

  // Combined opportunities to display
  const allOppsIds = new Set(volunteerOpportunities.map(o => o.id));
  const combinedOpps = [...volunteerOpportunities, ...backendOpportunities.filter(o => !allOppsIds.has(o.id))];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader title="Volunteer Portal" sub="Your tasks, impact, and available assignments" />

      <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        {['My Portal', 'Opportunities', 'Report Need', 'Donate Items'].map(tab => {
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}>
              {tab}
              {tab === 'Opportunities' && combinedOpps.length > 0 && (
                <span className="ml-1.5 bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{combinedOpps.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {/* MY PORTAL TAB */}
        {activeTab === 'My Portal' && (
          <div className="max-w-2xl">
            {!profile ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔑</div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Session Sync Required</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  We've updated the platform. To see your volunteer info and assigned tasks, please log out and log back in.
                </p>
                <button 
                  onClick={() => { localStorage.removeItem('impactsphere_user'); window.location.reload(); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Log Out & Re-sync
                </button>
              </div>
            ) : (
              <>
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                      {profile.name?.[0]}
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold text-lg">{profile.name}</div>
                      <div className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5"><MapPin size={12} />{profile.location_label || 'Delhi'}</div>
                      <div className={`text-xs mt-1 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        profile.availability_status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${profile.availability_status === 'available' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                        {profile.availability_status}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Trust Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profile.trust_score * 10}%` }} /></div>
                        <span className="text-gray-900 font-bold">{profile.trust_score}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Completion Rate</span><span className="text-gray-900 font-bold">{(profile.completion_rate * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Impact Points</span><span className="text-emerald-600 font-bold">{profile.total_impact_points}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Active Tasks</span><span className="text-gray-900 font-semibold">{profile.active_task_count}</span></div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2.5">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills?.map(skill => (<span key={skill} className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium capitalize">{skill}</span>))}
                    </div>
                  </div>
                  {profile.badges?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2.5 flex items-center gap-1.5"><Award size={12} /> Badges</div>
                      <div className="flex flex-wrap gap-2">
                        {profile.badges.map((b, i) => {
                          const info = BADGE_ICONS[b.type] || { icon: '🎖️', label: b.type };
                          return (<div key={i} title={info.label} className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-lg cursor-help hover:border-amber-200 transition-colors">{info.icon}</div>);
                        })}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Assigned Tasks Section */}
                {profile.assigned_tasks?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                      <Briefcase size={20} className="text-blue-600" /> My Assigned Tasks
                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{profile.assigned_tasks.length}</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {profile.assigned_tasks.map((task) => (
                        <Card key={task.node_id} className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">

                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  Task #{task.node_id.slice(0,6)}
                                </span>
                                <StatusBadge status={task.node_status} />
                              </div>
                              <h4 className="text-gray-900 font-bold text-base flex items-center gap-2">
                                {task.need.category.charAt(0).toUpperCase() + task.need.category.slice(1)} Assistance
                                {task.need.volunteer_help_type && (
                                  <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">
                                    {HELP_TYPE_LABELS[task.need.volunteer_help_type] || task.need.volunteer_help_type}
                                  </span>
                                )}
                              </h4>
                            </div>
                            <UrgencyBadge score={task.need.urgency_score} />
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                            <p className="text-gray-700 text-sm italic mb-3">
                              "{task.need.description}"
                            </p>
                            {task.need.volunteer_notes && (
                              <div className="mb-3 text-xs bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200">
                                <span className="font-bold">NGO Instructions:</span> {task.need.volunteer_notes}
                              </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Location</div>
                                <div className="text-xs font-semibold flex items-center gap-1 text-gray-800"><MapPin size={12} className="text-red-400" /> {task.need.location_label}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Affected</div>
                                <div className="text-xs font-semibold flex items-center gap-1 text-gray-800"><Users size={12} className="text-blue-400" /> {task.need.affected_count} People</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Time Sensitivity</div>
                                <div className="text-xs font-semibold flex items-center gap-1 text-gray-800"><Clock size={12} className="text-orange-400" /> Level {task.need.time_sensitivity}/10</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-2 border-t border-gray-100">
                            {task.node_status === 'assigned' && (
                              <button 
                                onClick={() => handleCompleteTask(task.node_id)}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                              >
                                <Check size={14} /> Mark Task Completed
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* OPPORTUNITIES TAB — Volunteer Requests */}
        {activeTab === 'Opportunities' && (
          <div className="max-w-3xl">
            <Card className="p-6">
              <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
                <Users size={18} className="text-violet-600" /> Volunteer Opportunities
                {combinedOpps.length > 0 && (
                  <span className="ml-auto bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">{combinedOpps.length} available</span>
                )}
              </h2>
              {combinedOpps.length === 0 ? (
                <EmptyState icon="🔍" title="No opportunities yet" desc="Check back soon — community needs with volunteer requests will appear here" />
              ) : (
                <div className="space-y-3">
                  {combinedOpps.map(n => (
                    <div key={n.id} className="p-4 bg-violet-50/50 border border-violet-200 rounded-xl hover:border-violet-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-900 text-sm font-semibold mb-2 leading-snug">{n.description}</div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CategoryBadge category={n.category} />
                            <span className="text-gray-500 text-xs font-medium flex items-center gap-1"><MapPin size={11} /> {n.location_label}</span>
                            <span className="text-gray-400 text-xs">👥 {n.affected_count} affected</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {n.volunteer_help_type && (
                              <span className="bg-white border border-violet-200 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                <Briefcase size={11} /> {HELP_TYPE_LABELS[n.volunteer_help_type] || n.volunteer_help_type}
                              </span>
                            )}
                            {n.volunteer_count > 0 && (
                              <span className="bg-white border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                <Users size={11} /> {n.volunteer_count} volunteer{n.volunteer_count > 1 ? 's' : ''} needed
                              </span>
                            )}
                            {n.time_sensitivity >= 7 && (
                              <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                <Clock size={11} /> Urgent
                              </span>
                            )}
                          </div>
                          {n.volunteer_notes && (
                            <p className="text-xs text-gray-500 italic mt-2 border-l-2 border-violet-200 pl-2">{n.volunteer_notes}</p>
                          )}
                        </div>
                        <UrgencyBadge score={n.urgency_score} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* REPORT NEED TAB */}
        {activeTab === 'Report Need' && (
          <div className="max-w-2xl">
            <Card className="p-6">
              <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2"><Send size={18} className="text-amber-600" /> Report a Field Need</h2>
              <form onSubmit={handleNeedSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    value={needForm.category} onChange={e => setNeedForm({...needForm, category: e.target.value})}>
                    <option value="food">Food & Nutrition</option><option value="health">Healthcare</option>
                    <option value="disaster">Disaster Relief</option><option value="education">Education</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Details</label>
                  <div className="relative"><MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Full address or landmark" required className="w-full border border-gray-300 rounded-lg p-2.5 pl-9 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={needForm.location_label} onChange={e => setNeedForm({...needForm, location_label: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                  <textarea placeholder="Describe the situation clearly..." required rows="4" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    value={needForm.description} onChange={e => setNeedForm({...needForm, description: e.target.value})} />
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                  <div><label className="flex justify-between text-sm font-medium text-gray-700 mb-2"><span>Severity (1-10)</span><span className="font-bold text-red-500">{needForm.severity}</span></label>
                    <input type="range" min="1" max="10" className="w-full accent-red-500" value={needForm.severity} onChange={e => setNeedForm({...needForm, severity: parseInt(e.target.value)})} /></div>
                  <div><label className="flex justify-between text-sm font-medium text-gray-700 mb-2"><span>People Affected</span><span className="font-bold text-blue-600">{needForm.affected_count}</span></label>
                    <input type="range" min="1" max="1000" className="w-full accent-blue-600" value={needForm.affected_count} onChange={e => setNeedForm({...needForm, affected_count: parseInt(e.target.value)})} /></div>
                  <div><label className="flex justify-between text-sm font-medium text-gray-700 mb-2"><span>Time Sensitivity (1-10)</span><span className="font-bold text-amber-500">{needForm.time_sensitivity}</span></label>
                    <input type="range" min="1" max="10" className="w-full accent-amber-500" value={needForm.time_sensitivity} onChange={e => setNeedForm({...needForm, time_sensitivity: parseInt(e.target.value)})} /></div>
                </div>
                <button type="submit" disabled={needSubmitting} className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {needSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Send size={16} /> Submit Need for Review</>}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* DONATE ITEMS TAB */}
        {activeTab === 'Donate Items' && (
          <div className="max-w-2xl">
            <Card className="p-6">
              <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2"><PackagePlus size={18} className="text-blue-600" /> Donate Resources</h2>
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={donateForm.category} onChange={e => setDonateForm({...donateForm, category: e.target.value})}>
                      <option value="food">Food & Ration</option><option value="health">Medical Supplies</option>
                      <option value="disaster">Disaster Relief</option><option value="education">Education Materials</option>
                      <option value="clothing">Clothing</option>
                    </select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity / Amount</label>
                    <input type="text" placeholder="e.g. 50 kg, 20 boxes" required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={donateForm.quantity} onChange={e => setDonateForm({...donateForm, quantity: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea placeholder="Describe the condition and specifics..." required rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={donateForm.description} onChange={e => setDonateForm({...donateForm, description: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Images (Optional)</label>
                  <div 
                    onClick={() => document.getElementById('image-upload').click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <input 
                      id="image-upload"
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                    <UploadCloud size={24} className="mb-2 text-gray-400" /><span className="text-sm font-medium">Click to upload photos</span><span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                  {donateForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {donateForm.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={donateForm.target_ngo} onChange={e => setDonateForm({...donateForm, target_ngo: e.target.value})}>
                      <option value="general">General Pool (Auto-allocate)</option><option value="ngo1">Red Cross Society</option><option value="ngo2">Hope Foundation</option>
                    </select></div>
                  <div className="flex items-center h-full pt-6"><label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" checked={donateForm.is_bulk} onChange={e => setDonateForm({...donateForm, is_bulk: e.target.checked})} />
                    Bulk/corporate donation</label></div>
                </div>
                <button type="submit" disabled={donateSubmitting} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {donateSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Heart size={16} /> Pledge Donation</>}
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
