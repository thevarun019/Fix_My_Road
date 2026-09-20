import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { apiRequest } from '../../lib/api';
import {
  ShieldCheck, Phone, KeyRound, ArrowRight, LogOut, CheckCircle2,
  BarChart3, Building2, User, ChevronRight, Sparkles, RefreshCw
} from 'lucide-react';

interface LoginProps {
  defaultPortal?: 'admin' | 'officer' | 'citizen';
}

type PortalType = 'ADMIN' | 'OFFICER' | 'CITIZEN';

export const Login: React.FC<LoginProps> = ({ defaultPortal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setAuth, user, isAuthenticated, logout } = useAuthStore();

  // After login, redirect back to where user came from (or role default)
  const from = (location.state as any)?.from || searchParams.get('from') || null;

  // Determine initial active portal tab
  const portalParam = (searchParams.get('portal') || searchParams.get('role') || defaultPortal || '').toLowerCase();
  const initialPortal: PortalType =
    portalParam.includes('admin') || portalParam.includes('command') || from?.includes('admin')
      ? 'ADMIN'
      : portalParam.includes('officer') || portalParam.includes('authority') || from?.includes('authority')
      ? 'OFFICER'
      : 'ADMIN'; // Default to command center or citizen depending on context

  const [activePortal, setActivePortal] = useState<PortalType>(initialPortal);
  const [phone, setPhone] = useState(
    initialPortal === 'ADMIN' ? '9876543211' : initialPortal === 'OFFICER' ? '9876543210' : ''
  );
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When switching tabs, prefill demo numbers if empty or matching old tab demo
  const handleTabChange = (portal: PortalType) => {
    setActivePortal(portal);
    setStep('PHONE');
    setCode('');
    setError(null);
    if (portal === 'ADMIN') {
      setPhone('9876543211');
    } else if (portal === 'OFFICER') {
      setPhone('9876543210');
    } else {
      setPhone('9876543299');
    }
  };

  const redirectAfterLogin = (role: string) => {
    if (from) return navigate(from, { replace: true });
    if (role === 'OFFICER') return navigate('/authority', { replace: true });
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return navigate('/admin', { replace: true });
    navigate('/', { replace: true });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone })
      });
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, code, role: activePortal })
      });
      setAuth(res.user, res.token);
      redirectAfterLogin(res.user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoPhone: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: demoPhone, code: '123456', role })
      });
      setAuth(res.user, res.token);
      redirectAfterLogin(res.user.role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  // Already logged in — show account info and direct portal links
  if (isAuthenticated && user) {
    const isUserAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isUserOfficer = user.role === 'OFFICER';

    return (
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-300">
            <CheckCircle2 className="w-9 h-9 text-emerald-700" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
              Active Government Session
            </span>
            <h2 className="text-xl font-black text-navy">Signed In as {user.name || user.phone}</h2>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="text-xs text-gray-500 font-medium">Assigned Role:</span>
              <span className={`font-black px-2.5 py-0.5 rounded-full text-white text-xs ${
                isUserAdmin
                  ? 'bg-saffron-dark shadow-sm'
                  : isUserOfficer
                  ? 'bg-emerald-700 shadow-sm'
                  : 'bg-gray-600'
              }`}>
                {isUserAdmin ? '🏛️ COMMAND CONTROL (ADMIN)' : isUserOfficer ? '🛠️ FIELD OFFICER' : '👤 CITIZEN'}
              </span>
            </div>
          </div>

          {/* Quick Access to Portals */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => navigate(isUserAdmin ? '/admin' : isUserOfficer ? '/authority' : '/')}
              className="w-full bg-navy hover:bg-navy-dark text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <span>Launch {isUserAdmin ? 'Command Center Dashboard' : isUserOfficer ? 'Officer Field Portal' : 'Citizen Grievance Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Switch Button if they want to log into another role */}
            <button
              onClick={() => { logout(); setActivePortal('ADMIN'); }}
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch User or Role</span>
            </button>

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2.5 rounded-xl border border-red-200 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out completely</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-navy/10 border border-navy/20 px-3 py-1 rounded-full text-xs font-bold text-navy mb-1">
          <ShieldCheck className="w-4 h-4 text-navy" />
          <span>Government of India Grievance Redressal Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy">
          Official Government Sign-In
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Centralized authentication for Command Control Directors, Zonal Field Officers, and Citizens.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        {/* 3 Portal Tabs */}
        <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            className={`py-3.5 px-2 text-center transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 border-b-2 ${
              activePortal === 'ADMIN'
                ? 'bg-white border-saffron text-navy font-black shadow-sm'
                : 'border-transparent text-gray-500 hover:text-navy hover:bg-gray-100'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activePortal === 'ADMIN' ? 'text-saffron-dark' : 'text-gray-400'}`} />
            <span className="leading-tight">Command Control</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('OFFICER')}
            className={`py-3.5 px-2 text-center transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 border-b-2 ${
              activePortal === 'OFFICER'
                ? 'bg-white border-emerald-600 text-navy font-black shadow-sm'
                : 'border-transparent text-gray-500 hover:text-navy hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activePortal === 'OFFICER' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className="leading-tight">Field Officer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('CITIZEN')}
            className={`py-3.5 px-2 text-center transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 border-b-2 ${
              activePortal === 'CITIZEN'
                ? 'bg-white border-navy text-navy font-black shadow-sm'
                : 'border-transparent text-gray-500 hover:text-navy hover:bg-gray-100'
            }`}
          >
            <User className={`w-4 h-4 ${activePortal === 'CITIZEN' ? 'text-navy' : 'text-gray-400'}`} />
            <span className="leading-tight">Citizen</span>
          </button>
        </div>

        {/* Tab Context Banner */}
        <div className={`p-4 border-b text-xs ${
          activePortal === 'ADMIN'
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : activePortal === 'OFFICER'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-blue-50/80 border-blue-200 text-blue-950'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                activePortal === 'ADMIN'
                  ? 'bg-saffron text-navy font-black'
                  : activePortal === 'OFFICER'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-navy text-white'
              }`}>
                {activePortal === 'ADMIN'
                  ? 'CENTRAL COMMAND & SLA MONITORING HQ'
                  : activePortal === 'OFFICER'
                  ? 'ZONAL MUNICIPAL & NHAI FIELD DESK'
                  : 'PUBLIC CITIZEN REDRESSAL DESK'}
              </span>
              <p className="font-bold text-xs mt-1">
                {activePortal === 'ADMIN'
                  ? 'Restricted access for Ministry Directors, Commissioners & SLA Vigilance'
                  : activePortal === 'OFFICER'
                  ? 'Operational access for Assistant Executive Engineers & Ward Teams'
                  : 'Public access to register grievances and track resolution SLAs'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Context Alert if redirected from a protected page */}
          {from && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium rounded-xl flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-700" />
              <span>
                Authentication required to access <code className="font-mono font-bold">{from}</code>. Please sign in below.
              </span>
            </div>
          )}

          {/* 1-Click Fast Instant Login Box */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            activePortal === 'ADMIN'
              ? 'bg-amber-50/50 border-saffron/50'
              : activePortal === 'OFFICER'
              ? 'bg-emerald-50/50 border-emerald-300'
              : 'bg-blue-50/50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wide flex items-center space-x-1 text-gray-700">
                <Sparkles className="w-3.5 h-3.5 text-saffron-dark" />
                <span>Instant 1-Click {activePortal === 'ADMIN' ? 'Command Control' : activePortal === 'OFFICER' ? 'Officer' : 'Citizen'} Login</span>
              </span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-600">
                DEMO READY
              </span>
            </div>

            {activePortal === 'ADMIN' && (
              <button
                type="button"
                onClick={() => quickLogin('9876543211', 'ADMIN')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-navy via-navy-dark to-slate-900 hover:from-slate-900 hover:to-navy text-white p-3.5 rounded-xl shadow font-bold text-xs flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-amber-300 text-sm">Enter Command Control</span>
                    <span className="bg-saffron text-navy text-[10px] font-black px-1.5 py-0.5 rounded">DIRECTOR</span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-normal mt-0.5">
                    Director (Civic Works & SLA Monitoring) · MoRTH / NHAI Headquarters
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
              </button>
            )}

            {activePortal === 'OFFICER' && (
              <button
                type="button"
                onClick={() => quickLogin('9876543210', 'OFFICER')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-emerald-950 text-white p-3.5 rounded-xl shadow font-bold text-xs flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-emerald-200 text-sm">Enter Field Officer Portal</span>
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">AEE</span>
                  </div>
                  <div className="text-[11px] text-emerald-100 font-normal mt-0.5">
                    Er. Rajesh Sharma · Assistant Executive Engineer, Ward 42
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
              </button>
            )}

            {activePortal === 'CITIZEN' && (
              <button
                type="button"
                onClick={() => quickLogin('9876543299', 'CITIZEN')}
                disabled={loading}
                className="w-full bg-navy hover:bg-navy-dark text-white p-3.5 rounded-xl shadow font-bold text-xs flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-white text-sm">Enter as Demo Citizen</span>
                    <span className="bg-gray-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PUBLIC</span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-normal mt-0.5">
                    Grievance filing, geo-tagging & SMS SLA status updates
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
              </button>
            )}
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Or Sign in with Mobile OTP
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Standard OTP Form */}
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Registered Mobile Number (+91)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 border-r border-gray-200 pr-2.5 mr-1">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-16 pr-3 py-3 rounded-xl border-2 border-gray-300 font-mono text-sm focus:ring-2 focus:ring-saffron focus:border-saffron"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {activePortal === 'ADMIN' && 'Director official number: 9876543211'}
                  {activePortal === 'OFFICER' && 'AEE official number: 9876543210'}
                  {activePortal === 'CITIZEN' && 'Enter any 10-digit Indian mobile number'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-gradient-to-r from-saffron to-saffron-dark hover:from-saffron-dark hover:to-orange-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl p-3 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>OTP dispatched to +91-{phone}. Valid for 10 minutes.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 font-mono text-center text-2xl tracking-[0.5em] font-black focus:ring-2 focus:ring-saffron focus:border-saffron"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 text-center">
                  Standard Demo OTP: <span className="font-mono font-black text-navy">123456</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full bg-navy hover:bg-navy-dark text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : `Verify OTP & Access ${activePortal === 'ADMIN' ? 'Command Control' : activePortal === 'OFFICER' ? 'Officer Desk' : 'Citizen Portal'}`}
              </button>

              <button
                type="button"
                onClick={() => { setStep('PHONE'); setCode(''); setError(null); }}
                className="w-full text-xs text-gray-500 hover:text-navy font-semibold py-2"
              >
                ← Change mobile number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
