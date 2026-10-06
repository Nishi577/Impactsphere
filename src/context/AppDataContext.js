/**
 * AppDataContext.js
 * -----------------
 * Global in-memory data store for ImpactSphere.
 * Initialised with demo seed data; new user actions append to the top.
 * Resets on page refresh (by design — no database).
 */

import React, { createContext, useContext, useReducer } from 'react';
import { MOCK_VOLUNTEERS, MOCK_NEEDS } from '../data/mockData';

// ─── Donation Category Schema ─────────────────────────────────────────────────
// Dynamic suggestive questions based on product category
export const DONATION_CATEGORY_SCHEMA = {
  food: {
    label: 'Food & Ration',
    fields: [
      { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true, tooltip: 'Best-before or use-by date' },
      { key: 'packaging_type', label: 'Packaging Type', type: 'select', options: ['Sealed', 'Open', 'Canned', 'Frozen', 'Vacuum-packed'], tooltip: 'How is the food packaged?' },
      { key: 'diet_type', label: 'Dietary Type', type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Mixed'], tooltip: 'Dietary classification' },
      { key: 'storage_req', label: 'Storage Requirement', type: 'select', options: ['Room Temperature', 'Refrigerated', 'Frozen'], tooltip: 'Required storage conditions' },
    ],
  },
  health: {
    label: 'Medical Supplies',
    fields: [
      { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true, tooltip: 'Expiry date of medical supplies' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['New/Sealed', 'Unopened', 'Sterilized'], required: true, tooltip: 'Condition of medical items' },
      { key: 'prescription_required', label: 'Prescription Required?', type: 'toggle', tooltip: 'Does this item require a prescription?' },
      { key: 'batch_number', label: 'Batch Number', type: 'text', tooltip: 'Manufacturer batch/lot number' },
    ],
  },
  clothing: {
    label: 'Clothing',
    fields: [
      { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Kids', 'Mixed'], required: true, tooltip: 'Garment size range' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['New with Tags', 'Like New', 'Gently Used', 'Worn'], required: true, tooltip: 'Current condition of clothing' },
      { key: 'gender', label: 'Target Gender', type: 'select', options: ['Men', 'Women', 'Unisex', 'Kids - Boys', 'Kids - Girls'], tooltip: 'Intended demographic' },
      { key: 'season', label: 'Season', type: 'select', options: ['Summer', 'Winter', 'All-Season', 'Monsoon/Rain'], tooltip: 'Seasonal suitability' },
      { key: 'material', label: 'Material', type: 'text', tooltip: 'e.g. Cotton, Polyester, Wool' },
    ],
  },
  education: {
    label: 'Education Materials',
    fields: [
      { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Used - Good', 'Used - Fair'], required: true, tooltip: 'Condition of educational materials' },
      { key: 'age_group', label: 'Target Age Group', type: 'select', options: ['Pre-school (3-5)', 'Primary (6-10)', 'Secondary (11-14)', 'Senior (15-18)', 'Adult'], tooltip: 'Appropriate age group' },
      { key: 'material_type', label: 'Material Type', type: 'select', options: ['Textbooks', 'Notebooks/Stationery', 'Digital Devices', 'Lab Equipment', 'Sports Equipment'], tooltip: 'Type of educational material' },
    ],
  },
  disaster: {
    label: 'Disaster Relief',
    fields: [
      { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Functional', 'Needs Minor Repair'], required: true, tooltip: 'Condition of relief items' },
      { key: 'item_type', label: 'Item Type', type: 'select', options: ['Shelter/Tents', 'Blankets/Bedding', 'Water Purifiers', 'First Aid Kits', 'Tarps/Covers', 'Flashlights/Batteries', 'Other'], tooltip: 'Type of disaster relief item' },
      { key: 'waterproof', label: 'Waterproof?', type: 'toggle', tooltip: 'Is the item waterproof?' },
    ],
  },
  electronics: {
    label: 'Electronics',
    fields: [
      { key: 'working_condition', label: 'Working Condition', type: 'select', options: ['Fully Functional', 'Minor Issues', 'Needs Repair', 'For Parts Only'], required: true, tooltip: 'Current working state' },
      { key: 'accessories', label: 'Accessories Included', type: 'text', tooltip: 'e.g. Charger, cables, manual' },
      { key: 'warranty', label: 'Warranty Active?', type: 'toggle', tooltip: 'Is warranty still active?' },
      { key: 'age_years', label: 'Age (years)', type: 'number', tooltip: 'How old is the device?' },
    ],
  },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    id: 'user_demo_001',
    email: 'coordinator@greenaid.org',
    password: 'ngo123',
    role: 'ngo_coordinator',
    name: 'NGO Coordinator',
    access_token: 'demo_ngo_token',
    volunteer_id: null,
  },
  {
    id: 'user_demo_002',
    email: 'vol1@volunteer.org',
    password: 'vol123',
    role: 'volunteer',
    name: 'Priya Sharma',
    access_token: 'demo_vol_token',
    volunteer_id: 'vol_001',
  },
  {
    id: 'user_demo_003',
    email: 'user@community.org',
    password: 'user123',
    role: 'user',
    name: 'Community User',
    access_token: 'demo_user_token',
    volunteer_id: null,
  },
];

const DEMO_DONATIONS = [
  {
    id: 'don_001',
    category: 'food',
    quantity: '50 Ration Kits',
    image: '📦',
    donor: 'Arjun Mehta',
    date: '2 hours ago',
    description: 'Mixed ration kits for flood relief.',
    status: 'pending',
    condition: 'New/Sealed',
    extra_fields: { packaging_type: 'Sealed', diet_type: 'Vegetarian', storage_req: 'Room Temperature' },
    submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'don_002',
    category: 'health',
    quantity: '100 Medical Masks',
    image: '🏥',
    donor: 'Priya Clinic',
    date: '5 hours ago',
    description: 'N95 masks for medical volunteers.',
    status: 'pending',
    condition: 'New/Sealed',
    extra_fields: { condition: 'New/Sealed', prescription_required: false },
    submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'don_003',
    category: 'disaster',
    quantity: '20 Tents',
    image: '⛺',
    donor: 'ReliefCorp Ltd',
    date: '1 day ago',
    description: 'Emergency shelter tents for displaced families.',
    status: 'pending',
    condition: 'New',
    extra_fields: { item_type: 'Shelter/Tents', waterproof: true },
    submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

// Normalise mock volunteers to match backend shape
const SEED_VOLUNTEERS = MOCK_VOLUNTEERS.map(v => ({
  ...v,
  location_label: v.location,
}));

// Normalise mock needs to have status = 'pending' for review queue
const SEED_NEEDS = MOCK_NEEDS.map(n => ({
  ...n,
  trust_weight: 8,
  confidence_score: 0.85,
  is_pattern: false,
  ngo_name: n.ngo || 'GreenAid Foundation',
  urgency_score: n.urgency_score || 70,
  volunteer_request: false,
  volunteer_count: 0,
  volunteer_help_type: null,
  volunteer_notes: null,
}));

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  users: DEMO_USERS,
  volunteers: SEED_VOLUNTEERS,
  needs: SEED_NEEDS,          // all needs (active + pending)
  donations: DEMO_DONATIONS,
  interventions: [],          // auto-created on approve
  auditLogs: [],              // approval → intervention audit trail
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'ADD_NEED':
      return {
        ...state,
        needs: [action.payload, ...state.needs],
      };

    case 'ADD_DONATION':
      return {
        ...state,
        donations: [action.payload, ...state.donations],
      };

    case 'ADD_USER': {
      // Avoid duplicate emails
      const exists = state.users.some(u => u.email === action.payload.email);
      if (exists) return state;
      const newVolunteers =
        action.payload.role === 'volunteer'
          ? [buildVolunteerProfile(action.payload), ...state.volunteers]
          : state.volunteers;
      return {
        ...state,
        users: [action.payload, ...state.users],
        volunteers: newVolunteers,
      };
    }

    case 'APPROVE_NEED': {
      const needId = action.payload;
      const needToApprove = state.needs.find(n => n.id === needId);
      // Auto-create intervention entry
      const newIntervention = needToApprove ? {
        id: `interv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        need_id: needId,
        status: 'active',
        chain_completion_pct: 0,
        verified_by_ngo: false,
        proof_image: null,
        before_image: null,
        impact_note: null,
        created_at: new Date().toISOString(),
        category: needToApprove.category,
        description: needToApprove.description,
        location_label: needToApprove.location_label,
      } : null;
      // Audit log entry
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'need_approved_intervention_created',
        entity_type: 'need',
        entity_id: needId,
        details: {
          intervention_id: newIntervention?.id,
          previous_status: 'pending',
          new_status: 'active',
        },
        created_at: new Date().toISOString(),
      };
      return {
        ...state,
        needs: state.needs.map(n =>
          n.id === needId ? { ...n, status: 'active' } : n,
        ),
        interventions: newIntervention
          ? [newIntervention, ...state.interventions]
          : state.interventions,
        auditLogs: [auditEntry, ...state.auditLogs],
      };
    }

    case 'REJECT_NEED':
      return {
        ...state,
        needs: state.needs.map(n =>
          n.id === action.payload ? { ...n, status: 'rejected' } : n,
        ),
      };

    case 'ACCEPT_DONATION':
      return {
        ...state,
        donations: state.donations.filter(d => d.id !== action.payload),
      };

    case 'REJECT_DONATION':
      return {
        ...state,
        donations: state.donations.filter(d => d.id !== action.payload),
      };

    default:
      return state;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildVolunteerProfile(user) {
  return {
    id: user.volunteer_id || `vol_${Date.now()}`,
    name: user.name,
    email: user.email,
    location: user.location || 'India',
    location_label: user.location || 'India',
    lat: 28.6139,
    lng: 77.209,
    skills: user.skills || ['general'],
    languages: user.languages || ['English'],
    availability: user.availability || ['weekdays'],
    trust_score: 5.0,
    completion_rate: 0,
    total_impact_points: 0,
    active_task_count: 0,
    badges: [],
    availability_status: 'available',
  };
}

function generateId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Action creators ──────────────────────────────────────────────────────

  const addNeed = (formData, submittedBy = 'user_portal') => {
    const now = new Date().toISOString();
    const need = {
      id: generateId('need'),
      description: formData.description,
      category: formData.category || 'general',
      urgency_score: Math.min(100, Math.round(
        (formData.severity || 5) * 7 + (formData.time_sensitivity || 5) * 3,
      )),
      severity: formData.severity || 5,
      affected_count: formData.affected_count || 10,
      location_label: formData.location_label || 'Unknown',
      location_lat: formData.location_lat || 28.6139,
      location_lng: formData.location_lng || 77.209,
      source: formData.source || submittedBy,
      status: 'pending',
      time_sensitivity: formData.time_sensitivity || 5,
      ngo: 'Pending Assignment',
      ngo_name: 'Pending Assignment',
      trust_weight: 6,
      confidence_score: 0.75,
      is_pattern: false,
      created_at: now,
      submittedAt: now,
      // Volunteer request fields
      volunteer_request: formData.volunteer_request || false,
      volunteer_count: formData.volunteer_count || 0,
      volunteer_help_type: formData.volunteer_help_type || null,
      volunteer_notes: formData.volunteer_notes || null,
    };
    dispatch({ type: 'ADD_NEED', payload: need });
    return need;
  };

  const addDonation = (formData, donorName = 'Anonymous') => {
    const EMOJI_MAP = {
      food: '📦', health: '🏥', disaster: '⛺',
      education: '📚', clothing: '👗', electronics: '💻',
    };
    const now = new Date().toISOString();
    const donation = {
      id: generateId('don'),
      category: formData.category || 'food',
      quantity: formData.quantity || 'Various items',
      image: EMOJI_MAP[formData.category] || '🎁',
      donor: donorName,
      date: 'Just now',
      description: formData.description || '',
      is_bulk: formData.is_bulk || false,
      target_ngo: formData.target_ngo || 'general',
      status: 'pending',
      condition: formData.condition || null,
      extra_fields: formData.extra_fields || {},
      images: formData.images || [],
      submittedAt: now,
    };
    dispatch({ type: 'ADD_DONATION', payload: donation });
    return donation;
  };

  const addUser = (userData) => {
    const now = new Date().toISOString();
    const user = {
      id: generateId('user'),
      access_token: `token_${generateId()}`,
      createdAt: now,
      volunteer_id: userData.role === 'volunteer' ? generateId('vol') : null,
      ...userData,
    };
    dispatch({ type: 'ADD_USER', payload: user });
    return user;
  };

  const approveNeed = (id) => dispatch({ type: 'APPROVE_NEED', payload: id });
  const rejectNeed  = (id) => dispatch({ type: 'REJECT_NEED',  payload: id });

  const acceptDonation = (id) => dispatch({ type: 'ACCEPT_DONATION', payload: id });
  const rejectDonation = (id) => dispatch({ type: 'REJECT_DONATION', payload: id });

  /** Find a user in the in-memory store by email + password (login fallback) */
  const findUser = (email, password) =>
    state.users.find(u => u.email === email && u.password === password) || null;

  // ── Derived selectors ─────────────────────────────────────────────────────

  /** Needs that are in the review queue (status = pending) */
  const pendingNeeds = state.needs.filter(n => n.status === 'pending');

  /** Active (approved) needs */
  const activeNeeds  = state.needs.filter(n => n.status === 'active');

  /** All pending donations */
  const pendingDonations = state.donations.filter(d => d.status === 'pending');

  /** Active needs with volunteer request enabled — for volunteer dashboard */
  const volunteerOpportunities = state.needs.filter(
    n => n.volunteer_request && (n.status === 'active' || n.status === 'pending'),
  );

  return (
    <AppDataContext.Provider value={{
      // raw state
      state,
      // action creators
      addNeed,
      addDonation,
      addUser,
      approveNeed,
      rejectNeed,
      acceptDonation,
      rejectDonation,
      findUser,
      // selectors
      pendingNeeds,
      activeNeeds,
      pendingDonations,
      volunteerOpportunities,
      allNeeds: state.needs,
      allVolunteers: state.volunteers,
      allDonations: state.donations,
      allInterventions: state.interventions,
      auditLogs: state.auditLogs,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
