import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Search, Map, ShieldCheck, BarChart3, Info, Home,
  LogIn, LogOut, User, ChevronDown, ClipboardList, MapPin,
  CheckSquare, Award, AlertOctagon, Trophy, BookOpen, Settings
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const GovtNav: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isOfficer = isAuthenticated && user?.role === 'OFFICER';
  const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');

  // ── Citizen nav links ───────────────────────────────────────────────
  const citizenLinks = [
    { to: '/', label: t('home'), icon: Home, end: true },
    { to: '/report', label: t('report_problem'), icon: AlertTriangle, highlight: true },
    { to: '/track', label: t('track_status'), icon: Search },
    { to: '/map', label: t('public_map'), icon: Map },
    { to: '/about', label: t('about'), icon: Info },
  ];

  // ── Officer nav links ───────────────────────────────────────────────
  const officerLinks = [
    { to: '/authority', label: 'My Queue', icon: ClipboardList, end: true },
    { to: '/authority/map', label: 'Field Map', icon: MapPin },
    { to: '/authority/resolved', label: 'Completed Work', icon: CheckSquare },
    { to: '/authority/scorecard', label: 'My SLA Score', icon: Award },
  ];

  // ── Admin nav links ─────────────────────────────────────────────────
  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
    { to: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/admin/escalations', label: 'Breach Monitor', icon: AlertOctagon },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/sla-rules', label: 'SLA Rules', icon: Settings },
    { to: '/admin/audit', label: 'Audit Log', icon: BookOpen },
  ];

  const navLinks = isOfficer ? officerLinks : isAdmin ? adminLinks : citizenLinks;

  // Role accent colour for active tab underline
  const activeAccent = isOfficer
    ? 'border-govgreen text-govgreen'
    : isAdmin
    ? 'border-saffron text-saffron'
    : 'border-saffron text-saffron';

  // Portal label shown in the nav bar
  const portalLabel = isOfficer
    ? 'Officer Field Portal'
    : isAdmin
    ? 'Command Center'
    : null;

  return (
    <nav className="bg-navy text-white shadow-md border-b-2 border-saffron">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between">

        {/* Left: portal label divider + nav links */}
        <div className="flex items-center overflow-x-auto scrollbar-none">
          {/* Portal context badge — shown only for officer/admin */}
          {portalLabel && (
            <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest mr-3 px-2.5 py-1 rounded-full border ${
              isOfficer
                ? 'bg-govgreen/20 text-govgreen border-govgreen/30'
                : 'bg-saffron/20 text-saffron border-saffron/30'
            }`}>
              {portalLabel}
            </span>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={(link as any).end}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? `border-saffron bg-navy-dark ${isOfficer ? 'text-govgreen' : 'text-saffron'}`
                      : (link as any).highlight
                      ? 'border-transparent text-amber-300 hover:bg-navy-dark hover:text-white'
                      : 'border-transparent text-gray-200 hover:bg-navy-dark hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Right: auth section */}
        <div className="flex-shrink-0 pl-2 relative">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center space-x-2 text-xs font-bold py-2 px-3 rounded-lg bg-navy-dark hover:bg-slate-800 border border-white/10 transition-all"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isAdmin ? 'bg-saffron' : isOfficer ? 'bg-govgreen' : 'bg-amber-400'
                }`} />
                <User className="w-4 h-4 text-gray-300" />
                <span className="max-w-[80px] truncate text-white">{user.name?.split(' ')[0] || user.phone}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white text-navy rounded-xl shadow-xl border border-gray-200 min-w-[210px] py-2 overflow-hidden">
                  {/* Identity */}
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-black truncate">{user.name || user.phone}</p>
                    <p className="text-[11px] text-gray-500">
                      <span className={`font-bold uppercase ${
                        isAdmin ? 'text-saffron-dark' : isOfficer ? 'text-govgreen-dark' : 'text-gray-600'
                      }`}>{user.role}</span>
                      {' · '}+91-{user.phone}
                    </p>
                  </div>

                  {/* Quick navigation to other portals (if applicable) */}
                  {isOfficer && (
                    <div className="px-4 py-1.5 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Officer Portal</p>
                      {officerLinks.map(l => (
                        <button key={l.to} onClick={() => { setMenuOpen(false); navigate(l.to); }}
                          className="flex items-center space-x-2 w-full text-left text-xs py-1 text-navy hover:text-govgreen font-medium transition-colors">
                          <l.icon className="w-3.5 h-3.5" />
                          <span>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="px-4 py-1.5 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Command Center</p>
                      {adminLinks.slice(0, 4).map(l => (
                        <button key={l.to} onClick={() => { setMenuOpen(false); navigate(l.to); }}
                          className="flex items-center space-x-2 w-full text-left text-xs py-1 text-navy hover:text-saffron-dark font-medium transition-colors">
                          <l.icon className="w-3.5 h-3.5" />
                          <span>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sign out */}
                  <button
                    onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <NavLink
                to="/login?portal=officer"
                className="flex items-center space-x-1.5 py-1.5 px-2.5 sm:px-3 text-xs font-bold text-emerald-300 border border-emerald-500/40 bg-emerald-950/40 rounded-lg hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                title="Field Officer & Engineer Portal Login"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Officer Login</span>
                <span className="sm:hidden">Officer</span>
              </NavLink>

              <NavLink
                to="/login?portal=admin"
                className="flex items-center space-x-1.5 py-1.5 px-2.5 sm:px-3 text-xs font-bold text-amber-300 border border-saffron/60 bg-saffron/20 rounded-lg hover:bg-saffron hover:text-navy-dark transition-all whitespace-nowrap shadow-sm shadow-saffron/20"
                title="Ministry & SLA Command Control Center Login"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Command Control</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
