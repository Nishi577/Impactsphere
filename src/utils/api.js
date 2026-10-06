import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('impactsphere_user') || '{}');
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  getUsers: () => api.get('/api/auth/users'),
};

export const needsApi = {
  submit: (data) => api.post('/api/needs/submit', data),
  reviewQueue: () => api.get('/api/needs/review-queue'),
  active: () => api.get('/api/needs/active'),
  all: () => api.get('/api/needs/all'),
  heatmap: () => api.get('/api/needs/heatmap'),
  volunteerOpportunities: () => api.get('/api/needs/volunteer-opportunities'),
  approve: (id) => api.patch(`/api/needs/${id}/approve`),
  reject: (id) => api.patch(`/api/needs/${id}/reject`),
  edit: (id, data) => api.patch(`/api/needs/${id}/edit`, data),
  get: (id) => api.get(`/api/needs/${id}`),
};

export const donationsApi = {
  submit: (data) => api.post('/api/donations/submit', data),
  pending: () => api.get('/api/donations/pending'),
  approve: (id) => api.patch(`/api/donations/${id}/approve`),
  reject: (id) => api.patch(`/api/donations/${id}/reject`),
};

export const volunteersApi = {
  matches: (needId) => api.get(`/api/volunteers/matches/${needId}`),
  all: () => api.get('/api/volunteers/all'),
  profile: (id) => api.get(`/api/volunteers/${id}/profile`),
  leaderboard: () => api.get('/api/volunteers/leaderboard/top'),
};

export const interventionsApi = {
  allocate: (needId) => api.post(`/api/interventions/allocate/${needId}`),
  get: (id) => api.get(`/api/interventions/${id}`),
  byNeed: (needId) => api.get(`/api/interventions/by-need/${needId}`),
  all: () => api.get('/api/interventions/all/list'),
  updateNode: (nodeId, data) => api.patch(`/api/interventions/nodes/${nodeId}/status`, data),
  complete: (id, data) => api.post(`/api/interventions/${id}/complete`, data),
  verify: (id) => api.patch(`/api/interventions/${id}/verify`),
  rejectImpact: (id) => api.patch(`/api/interventions/${id}/reject-impact`),
};

export const pulseApi = {
  signals: () => api.get('/api/pulse/signals'),
  earlyWarnings: () => api.get('/api/pulse/early-warnings'),
  trigger: () => api.post('/api/pulse/trigger'),
};

export const impactApi = {
  dashboard: () => api.get('/api/impact/dashboard'),
  export: (ngoId) => api.get(`/api/impact/export/${ngoId}`),
};

export const simulationApi = {
  scenarios: () => api.get('/api/simulate/scenarios'),
  run: (data) => api.post('/api/simulate', data),
};

export const importApi = {
  csvPreview: (file, ngoId) => {
    const form = new FormData();
    form.append('file', file);
    form.append('ngo_id', ngoId);
    return api.post('/api/import/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  csvConfirm: (file, ngoId) => {
    const form = new FormData();
    form.append('file', file);
    form.append('ngo_id', ngoId);
    return api.post('/api/import/csv/confirm', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  pdf: (file, ngoId) => {
    const form = new FormData();
    form.append('file', file);
    form.append('ngo_id', ngoId);
    return api.post('/api/import/pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
