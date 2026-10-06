import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import VolunteerSignup from './pages/VolunteerSignup';
import NGOSignup from './pages/NGOSignup';
import UserSignup from './pages/UserSignup';
import AdminDashboard from './pages/AdminDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ReviewQueue from './pages/ReviewQueue';
import ImportData from './pages/ImportData';
import HeatmapPage from './pages/HeatmapPage';
import InterventionsPage from './pages/InterventionsPage';
import UserDashboard from './pages/UserDashboard';
import ImpactPage from './pages/ImpactPage';
import VolunteerProfile from './pages/VolunteerProfile';
import Layout from './components/common/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppDataProvider } from './context/AppDataContext';
import 'leaflet/dist/leaflet.css';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  const getHome = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'ngo_coordinator') return '/ngo';
    if (user.role === 'user' || user.role === 'anchor') return '/user';
    return '/volunteer';
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={getHome()} /> : <Login />} />
      <Route path="/signup/volunteer" element={user ? <Navigate to={getHome()} /> : <VolunteerSignup />} />
      <Route path="/signup/ngo" element={user ? <Navigate to={getHome()} /> : <NGOSignup />} />
      <Route path="/signup/user" element={user ? <Navigate to={getHome()} /> : <UserSignup />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/volunteers" element={<ProtectedRoute roles={['admin']}><Layout><VolunteerProfile /></Layout></ProtectedRoute>} />

      {/* NGO Routes */}
      <Route path="/ngo" element={<ProtectedRoute roles={['ngo_coordinator', 'admin']}><Layout><NGODashboard /></Layout></ProtectedRoute>} />
      <Route path="/ngo/review" element={<ProtectedRoute roles={['ngo_coordinator', 'admin']}><Layout><ReviewQueue /></Layout></ProtectedRoute>} />
      <Route path="/ngo/import" element={<ProtectedRoute roles={['ngo_coordinator', 'admin']}><Layout><ImportData /></Layout></ProtectedRoute>} />
      <Route path="/ngo/interventions" element={<ProtectedRoute roles={['ngo_coordinator', 'admin']}><Layout><InterventionsPage /></Layout></ProtectedRoute>} />
      <Route path="/ngo/impact" element={<ProtectedRoute roles={['ngo_coordinator', 'admin']}><Layout><ImpactPage /></Layout></ProtectedRoute>} />

      {/* Admin-only Heatmap */}
      <Route path="/heatmap" element={<ProtectedRoute roles={['admin']}><Layout><HeatmapPage /></Layout></ProtectedRoute>} />

      {/* Generic User & Anchor Routes */}
      <Route path="/user" element={<ProtectedRoute roles={['user', 'anchor', 'admin']}><Layout><UserDashboard /></Layout></ProtectedRoute>} />

      {/* Volunteer Routes */}
      <Route path="/volunteer" element={<ProtectedRoute roles={['volunteer', 'admin']}><Layout><VolunteerDashboard /></Layout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={getHome()} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </Router>
      </AppDataProvider>
    </AuthProvider>
  );
}
