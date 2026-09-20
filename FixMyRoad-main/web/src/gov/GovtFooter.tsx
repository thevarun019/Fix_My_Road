import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TricolorBar } from './TricolorBar';

export const GovtFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-16 text-xs">
      <TricolorBar />

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <img src="/emblem.svg" alt="Emblem" className="w-8 h-8 invert brightness-200" />
            <span className="text-white font-black text-sm tracking-wide">FixMyRoad | सड़क प्रहरी</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            A nationwide statutory civic grievance platform enforcing binding Service Level Agreements (SLAs) for pothole remediation, surface repairs, and citizen safety across India.
          </p>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-400 text-[11px] font-mono">Realtime SLA Engine Online</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs border-b border-gray-700 pb-1">
            24x7 Emergency Helplines
          </h4>
          <ul className="space-y-1.5 text-gray-400">
            <li><span className="text-white font-semibold">1033:</span> National Highways (NHAI)</li>
            <li><span className="text-white font-semibold">1913:</span> Municipal Corporation Toll Free</li>
            <li><span className="text-white font-semibold">1077:</span> District Disaster Relief</li>
            <li><span className="text-white font-semibold">112:</span> National Emergency Response</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs border-b border-gray-700 pb-1">
            Official Portals & Sign-In
          </h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <Link
                to="/login?portal=admin"
                className="hover:text-amber-400 flex items-center space-x-1.5 transition-colors font-semibold"
              >
                <span className="text-amber-400">🏛️</span>
                <span>Command Control HQ Login</span>
              </Link>
            </li>
            <li>
              <Link
                to="/login?portal=officer"
                className="hover:text-emerald-400 flex items-center space-x-1.5 transition-colors font-semibold"
              >
                <span className="text-emerald-400">🛠️</span>
                <span>Officer Field Portal Login</span>
              </Link>
            </li>
            <li>
              <Link
                to="/login?portal=citizen"
                className="hover:text-white flex items-center space-x-1.5 transition-colors"
              >
                <span>👤</span>
                <span>Citizen Sign-In (OTP)</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/sla-rules"
                className="hover:text-white flex items-center space-x-1.5 transition-colors text-gray-400"
              >
                <span>⚖️</span>
                <span>Statutory SLA Rules & Timelines</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs border-b border-gray-700 pb-1">
            Accessibility & Compliance
          </h4>
          <p className="text-gray-400 leading-relaxed mb-2">
            Right to Information (RTI) Act 2005 & Motor Vehicles Amendment Act 2019 compliant.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Optimized for ₹5,000 Indian smartphones and 2G connectivity with full offline sync.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 bg-black/40 py-4 px-4 text-center text-gray-500 text-[11px]">
        <p>© 2026 FixMyRoad National Portal · Ministry of Road Transport & Highways Partner · All Rights Reserved.</p>
      </div>
    </footer>
  );
};
