import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: Array<'OFFICER' | 'ADMIN' | 'SUPER_ADMIN' | 'CITIZEN'>;
}

/**
 * Wraps protected pages (Officer Portal, Admin Command Center).
 * Redirects unauthenticated users to /login with a clear, bilingual
 * government-styled blocked access warning page showing the required role.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Not logged in at all
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border-2 border-amber-300 p-8 sm:p-10 text-center space-y-6">
          {/* Blocked Icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto border-4 border-amber-300">
            <ShieldAlert className="w-10 h-10 text-amber-600" />
          </div>

          {/* Bilingual Heading */}
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              अनधिकृत पहुंच / Restricted Access
            </span>
            <h2 className="text-2xl font-black text-navy">
              Authentication Required
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              This portal requires an official government staff login. Only authorized Field Engineers, Ward Officers, and Ministry Executives may access this section.
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              इस पोर्टल तक पहुंचने के लिए सरकारी अधिकारी लॉगिन आवश्यक है।
            </p>
          </div>

          {/* Required Role Badge */}
          <div className="bg-navy/5 border border-navy/20 rounded-xl px-4 py-3 text-xs text-navy font-bold">
            Required Access Level:{' '}
            <span className="text-saffron-dark">
              {requiredRoles.includes('ADMIN') || requiredRoles.includes('SUPER_ADMIN')
                ? 'Ministry Executive / Command Center Administrator'
                : 'Authorized Field Officer / Junior Engineer / AEE'}
            </span>
          </div>

          {/* Login CTA */}
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="w-full bg-gradient-to-r from-navy to-navy-dark text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center space-x-2 hover:from-navy-dark hover:to-slate-900 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Official Mobile OTP</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Quick Test Credentials Hint */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">Demo Access Credentials:</p>
            <div className="space-y-1 text-xs text-gray-700 font-medium">
              <div className="flex items-center space-x-2">
                <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-[11px]">9876543210</span>
                <span className="text-gray-500">→ Field Officer (AEE) · OTP: 123456</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-[11px]">9876543211</span>
                <span className="text-gray-500">→ Admin / Command Center · OTP: 123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but insufficient role
  if (!requiredRoles.includes(user.role as any)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border-2 border-red-300 p-8 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-red-300">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
              अपर्याप्त अनुमतियां / Insufficient Privileges
            </span>
            <h2 className="text-2xl font-black text-navy">
              Access Denied
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Your account role (<strong className="text-navy">{user.role}</strong>) does not have permission to access this restricted portal.
            </p>
          </div>

          <div className="bg-navy/5 border border-navy/20 rounded-xl px-4 py-3 text-xs text-navy font-bold">
            Logged in as: <span className="text-saffron-dark">{user.name || user.phone}</span>
            {' · '}Role: <span className="text-red-600">{user.role}</span>
          </div>

          <div className="flex gap-3">
            <Link
              to="/"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-navy font-bold text-sm py-3 rounded-2xl transition-colors"
            >
              Go to Home
            </Link>
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="flex-1 bg-navy hover:bg-navy-dark text-white font-bold text-sm py-3 rounded-2xl shadow transition-colors"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
};
