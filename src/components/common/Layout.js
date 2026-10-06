import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, ClipboardList, PlusCircle, Upload, Activity,
  BarChart3, Map, Zap, FlaskConical, Users, LogOut, Menu, X,
  Globe, Shield, Heart, ChevronDown
} from 'lucide-react';

const NAV = {
  admin: [
    { path: '/admin',             label: 'Overview',      icon: LayoutDashboard },
    { path: '/heatmap',           label: 'Heatmap',       icon: Map },
    { path: '/ngo/impact',        label: 'Impact',        icon: BarChart3 },
    { path: '/admin/volunteers',  label: 'Volunteers',    icon: Users },
  ],
  ngo_coordinator: [
    { path: '/ngo',               label: 'Dashboard',     icon: LayoutDashboard },
    { path: '/ngo/review',        label: 'Review Queue',  icon: ClipboardList },
    { path: '/ngo/import',        label: 'Import',        icon: Upload },
    { path: '/ngo/interventions', label: 'Interventions', icon: Activity },
    { path: '/ngo/impact',        label: 'Impact',        icon: BarChart3 },
  ],
  user: [
    { path: '/user',              label: 'Dashboard',     icon: LayoutDashboard },
  ],
  volunteer: [
    { path: '/volunteer', label: 'My Tasks',  icon: Heart },
  ],
  anchor: [
    { path: '/user',              label: 'Dashboard',     icon: LayoutDashboard },
  ],
};

const roleConfig = {
  admin:           { label: 'Admin',     dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-200',   avatar: 'bg-violet-600' },
  ngo_coordinator: { label: 'NGO',       dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', avatar: 'bg-emerald-600' },
  volunteer:       { label: 'Volunteer', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200',          avatar: 'bg-blue-600' },
  anchor:          { label: 'Anchor',    dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200',    avatar: 'bg-orange-600' },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV[user?.role] || [];
  const role = roleConfig[user?.role] || roleConfig.volunteer;
  const initials = (user?.name || user?.email || '?')[0].toUpperCase();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ── TOP NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group mr-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Globe size={15} className="text-white" />
              </div>
              <span className="text-gray-900 font-bold text-sm tracking-tight hidden sm:block whitespace-nowrap">ImpactSphere</span>
            </Link>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-200 shrink-0 hidden md:block" />

            {/* Desktop Nav tabs — scrollable, no wrap */}
            <nav className="hidden md:flex items-center flex-1 overflow-x-auto no-scrollbar min-w-0">
              <div className="flex items-center gap-0.5">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium whitespace-nowrap rounded-lg transition-colors
                      ${isActive(path)
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={13} className={isActive(path) ? 'text-emerald-600' : 'text-gray-400'} />
                    {label}
                    {isActive(path) && (
                      <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right side — pushed to far right */}
            <div className="flex items-center gap-2 ml-auto shrink-0">

              {/* System status */}
              <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>

              {/* Role badge */}
              <div className={`hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${role.badge}`}>
                {user?.role === 'admin' && <Shield size={10} />}
                {role.label}
              </div>

              {/* User chip */}
              <div className="flex items-center gap-2 pl-1">
                <div className={`w-7 h-7 rounded-full ${role.avatar} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                  {initials}
                </div>
                <div className="hidden xl:block leading-none">
                  <div className="text-gray-800 text-xs font-semibold">{user?.name || 'User'}</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">{user?.email}</div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-medium"
              >
                <LogOut size={13} />
                <span className="hidden lg:inline">Sign out</span>
              </button>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {mobileOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-0.5 shadow-lg animate-fade-in">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive(path)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={15} className={isActive(path) ? 'text-emerald-600' : 'text-gray-400'} />
                {label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full ${role.avatar} text-white text-xs font-bold flex items-center justify-center`}>
                  {initials}
                </div>
                <div>
                  <div className="text-gray-800 text-xs font-semibold">{user?.name || user?.email}</div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${role.badge}`}>{role.label}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 bg-red-50 text-xs font-medium">
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
