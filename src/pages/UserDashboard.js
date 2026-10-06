import React, { useState } from 'react';
import { needsApi, donationsApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../context/AppDataContext';
import { DONATION_CATEGORY_SCHEMA } from '../context/AppDataContext';
import { Card, SectionHeader, Toast } from '../components/common/UI';
import { Heart, Send, PackagePlus, UploadCloud, MapPin, Users, HelpCircle, Info, X } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const { addNeed, addDonation } = useAppData();
  const [activeTab, setActiveTab] = useState('Donate');
  const [toast, setToast] = useState(null);
  
  // Submit Need State — includes volunteer request fields
  const [needForm, setNeedForm] = useState({
    category: 'food', description: '', severity: 5, affected_count: 10,
    time_sensitivity: 5, location_label: '', location_lat: 28.6139, location_lng: 77.2090,
    volunteer_request: false, volunteer_count: 1, volunteer_help_type: '', volunteer_notes: '',
  });
  const [needSubmitting, setNeedSubmitting] = useState(false);

  // Donate Items State — includes dynamic category fields
  const [donateForm, setDonateForm] = useState({
    category: 'food', quantity: '', description: '', is_bulk: false,
    target_ngo: 'general', condition: '', extra_fields: {}, images: [],
  });
  const [donateSubmitting, setDonateSubmitting] = useState(false);

  // History State
  const [history, setHistory] = useState([
    { id: 1, type: 'donation', title: 'Donated 50 Blankets', date: '2 days ago', status: 'Received' },
    { id: 2, type: 'need', title: 'Reported flooding in Sector 4', date: '1 week ago', status: 'Active' }
  ]);

  const handleNeedSubmit = async (e) => {
    e.preventDefault();
    setNeedSubmitting(true);
    const payload = { ...needForm, source: user?.role === 'anchor' ? 'anchor' : 'user_portal' };
    try {
      // Try backend (best-effort)
      await needsApi.submit(payload);
    } catch (_) { /* ignore — in-memory store handles it */ }
    // Always dispatch to global store → instantly shows in NGO Review Queue
    addNeed(payload, payload.source);
    setHistory(prev => [
      { id: Date.now(), type: 'need', title: `Reported: ${needForm.description.substring(0, 40)}...`, date: 'Just now', status: 'Pending Review' },
      ...prev,
    ]);
    setToast({ msg: '✅ Need submitted! It\'s now in the NGO Review Queue.', type: 'success' });
    setNeedForm({
      category: 'food', description: '', severity: 5, affected_count: 10,
      time_sensitivity: 5, location_label: '', location_lat: 28.6139, location_lng: 77.2090,
      volunteer_request: false, volunteer_count: 1, volunteer_help_type: '', volunteer_notes: '',
    });
    setNeedSubmitting(false);
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setDonateSubmitting(true);
    const donorName = user?.name || 'Anonymous Donor';
    const payload = { ...donateForm, donor_name: donorName };
    
    try {
      // Best-effort backend sync
      await donationsApi.submit(payload);
    } catch (err) {
      console.error("Backend donation failed, using local store:", err);
    }

    // Dispatch to global store → appears in NGO Donations tab immediately
    addDonation(donateForm, donorName);
    setHistory(prev => [
      { id: Date.now(), type: 'donation', title: `Donated ${donateForm.quantity} (${donateForm.category})`, date: 'Just now', status: 'Pending Pickup' },
      ...prev,
    ]);
    setToast({ msg: '🎁 Donation pledged! Visible in NGO Donations tab now.', type: 'success' });
    setDonateForm({ category: 'food', quantity: '', description: '', is_bulk: false, target_ngo: 'general', condition: '', extra_fields: {}, images: [] });
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

  // Get dynamic fields for current donate category
  const categorySchema = DONATION_CATEGORY_SCHEMA[donateForm.category];

  const updateExtraField = (key, value) => {
    setDonateForm(prev => ({
      ...prev,
      extra_fields: { ...prev.extra_fields, [key]: value },
    }));
  };

  // Reset extra fields when category changes
  const handleCategoryChange = (newCategory) => {
    setDonateForm(prev => ({ ...prev, category: newCategory, extra_fields: {}, condition: '' }));
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <SectionHeader 
        title="My Dashboard" 
        sub="Make an impact by donating resources or reporting community needs" 
      />

      <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        {['Donate', 'Submit Need', 'History'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-700' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* DONATE TAB — Enhanced with dynamic category fields */}
        {activeTab === 'Donate' && (
          <div className="max-w-2xl">
            <Card className="p-6">
              <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
                <PackagePlus size={18} className="text-blue-600" /> Donate Resources
              </h2>
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={donateForm.category} onChange={e => handleCategoryChange(e.target.value)}>
                      <option value="food">Food & Ration</option>
                      <option value="health">Medical Supplies</option>
                      <option value="disaster">Disaster Relief</option>
                      <option value="education">Education Materials</option>
                      <option value="clothing">Clothing</option>
                      <option value="electronics">Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity / Amount</label>
                    <input type="text" placeholder="e.g. 50 kg, 20 boxes" required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={donateForm.quantity} onChange={e => setDonateForm({...donateForm, quantity: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea placeholder="Describe the condition and specifics of the items..." required rows="3"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={donateForm.description} onChange={e => setDonateForm({...donateForm, description: e.target.value})} />
                </div>

                {/* Dynamic Category-Specific Fields */}
                {categorySchema && categorySchema.fields.length > 0 && (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Info size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        {categorySchema.label} — Additional Details
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categorySchema.fields.map(field => (
                        <div key={field.key} className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                            {field.label}
                            {field.required && <span className="text-red-400 text-xs">*</span>}
                            {field.tooltip && (
                              <span className="group relative">
                                <HelpCircle size={12} className="text-gray-400 cursor-help" />
                                <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-800 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-lg">
                                  {field.tooltip}
                                </span>
                              </span>
                            )}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              value={donateForm.extra_fields[field.key] || ''}
                              onChange={e => updateExtraField(field.key, e.target.value)}
                              required={field.required}
                            >
                              <option value="">Select...</option>
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'toggle' ? (
                            <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                              <div className="relative">
                                <input type="checkbox" className="sr-only peer"
                                  checked={donateForm.extra_fields[field.key] || false}
                                  onChange={e => updateExtraField(field.key, e.target.checked)} />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-500 transition-colors" />
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                              </div>
                              <span className="text-sm text-gray-600">{donateForm.extra_fields[field.key] ? 'Yes' : 'No'}</span>
                            </label>
                          ) : field.type === 'date' ? (
                            <input type="date"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={donateForm.extra_fields[field.key] || ''}
                              onChange={e => updateExtraField(field.key, e.target.value)}
                              required={field.required} />
                          ) : field.type === 'number' ? (
                            <input type="number" min="0"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={donateForm.extra_fields[field.key] || ''}
                              onChange={e => updateExtraField(field.key, e.target.value)}
                              required={field.required} />
                          ) : (
                            <input type="text"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder={field.tooltip || ''}
                              value={donateForm.extra_fields[field.key] || ''}
                              onChange={e => updateExtraField(field.key, e.target.value)}
                              required={field.required} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images (Optional)</label>
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
                    <UploadCloud size={24} className="mb-2 text-gray-400" />
                    <span className="text-sm font-medium">Click to upload photos</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={donateForm.target_ngo} onChange={e => setDonateForm({...donateForm, target_ngo: e.target.value})}>
                      <option value="general">General Pool (Auto-allocate)</option>
                      <option value="ngo1">Red Cross Society</option>
                      <option value="ngo2">Hope Foundation</option>
                    </select>
                  </div>
                  <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        checked={donateForm.is_bulk} onChange={e => setDonateForm({...donateForm, is_bulk: e.target.checked})} />
                      This is a bulk/corporate donation
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={donateSubmitting}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {donateSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Heart size={16} /> Pledge Donation</>}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* SUBMIT NEED TAB — with Volunteer Request Toggle */}
        {activeTab === 'Submit Need' && (
          <div className="max-w-2xl">
            <Card className="p-6">
              <h2 className="text-gray-900 font-semibold mb-5 flex items-center gap-2">
                <Send size={18} className="text-amber-600" /> Report a Community Need
              </h2>
              <form onSubmit={handleNeedSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    value={needForm.category} onChange={e => setNeedForm({...needForm, category: e.target.value})}>
                    <option value="food">Food & Nutrition</option>
                    <option value="health">Healthcare</option>
                    <option value="disaster">Disaster Relief</option>
                    <option value="education">Education</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Details</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Full address or landmark" required
                      className="w-full border border-gray-300 rounded-lg p-2.5 pl-9 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={needForm.location_label} onChange={e => setNeedForm({...needForm, location_label: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                  <textarea placeholder="Describe the situation clearly so NGOs can understand the requirement..." required rows="4"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    value={needForm.description} onChange={e => setNeedForm({...needForm, description: e.target.value})} />
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                  <div>
                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                      <span>Severity (1-10)</span> <span className="font-bold text-red-500">{needForm.severity}</span>
                    </label>
                    <input type="range" min="1" max="10" className="w-full accent-red-500"
                      value={needForm.severity} onChange={e => setNeedForm({...needForm, severity: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                      <span>People Affected</span> <span className="font-bold text-blue-600">{needForm.affected_count}</span>
                    </label>
                    <input type="range" min="1" max="1000" className="w-full accent-blue-600"
                      value={needForm.affected_count} onChange={e => setNeedForm({...needForm, affected_count: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                      <span>Time Sensitivity (1-10)</span> <span className="font-bold text-amber-500">{needForm.time_sensitivity}</span>
                    </label>
                    <input type="range" min="1" max="10" className="w-full accent-amber-500"
                      value={needForm.time_sensitivity} onChange={e => setNeedForm({...needForm, time_sensitivity: parseInt(e.target.value)})} />
                  </div>
                </div>

                {/* ── Volunteer Request Toggle ── */}
                <div className={`p-4 rounded-xl border transition-all ${
                  needForm.volunteer_request 
                    ? 'bg-violet-50 border-violet-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Users size={16} className={needForm.volunteer_request ? 'text-violet-600' : 'text-gray-400'} />
                      <span className="text-sm font-semibold text-gray-800">Request Volunteer Support</span>
                      <span className="group relative">
                        <HelpCircle size={12} className="text-gray-400 cursor-help" />
                        <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-800 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-lg">
                          Enable to request volunteer assistance for this need
                        </span>
                      </span>
                    </div>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer"
                        checked={needForm.volunteer_request}
                        onChange={e => setNeedForm({...needForm, volunteer_request: e.target.checked})} />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-violet-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                    </div>
                  </label>

                  {/* Expanded volunteer details */}
                  {needForm.volunteer_request && (
                    <div className="mt-4 pt-4 border-t border-violet-200/50 space-y-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Volunteers</label>
                          <input type="number" min="1" max="100"
                            className="w-full border border-violet-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-400 outline-none bg-white"
                            value={needForm.volunteer_count}
                            onChange={e => setNeedForm({...needForm, volunteer_count: parseInt(e.target.value) || 1})} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Type of Help Needed</label>
                          <select
                            className="w-full border border-violet-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-400 outline-none bg-white"
                            value={needForm.volunteer_help_type}
                            onChange={e => setNeedForm({...needForm, volunteer_help_type: e.target.value})}>
                            <option value="">Select...</option>
                            <option value="distribution">Distribution & Logistics</option>
                            <option value="medical">Medical Support</option>
                            <option value="teaching">Teaching & Training</option>
                            <option value="rescue">Rescue Operations</option>
                            <option value="counseling">Counseling & Support</option>
                            <option value="general">General Help</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Additional Notes for Volunteers</label>
                        <textarea
                          placeholder="Any specific skills, timing, or physical requirements..."
                          rows="2"
                          className="w-full border border-violet-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none bg-white"
                          value={needForm.volunteer_notes}
                          onChange={e => setNeedForm({...needForm, volunteer_notes: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={needSubmitting}
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {needSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Send size={16} /> Submit Need for Review</>}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'History' && (
          <div className="max-w-3xl">
            <Card className="p-6">
              <h2 className="text-gray-900 font-semibold mb-5">My Activity History</h2>
              <div className="space-y-3">
                {history.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'donation' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {item.type === 'donation' ? <PackagePlus size={18}/> : <Send size={18}/>}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.date}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
