import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const TrackById: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    navigate(`/track/${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  const sampleCodes = [
    { code: 'IN-MCD-2026-1042', label: 'In Progress (Active SLA)', status: 'IN_PROGRESS' },
    { code: 'IN-NHAI-2026-9021', label: 'Overdue & Escalated', status: 'ESCALATED' },
    { code: 'IN-NDMC-2026-3310', label: 'Resolved (Citizen Verified)', status: 'RESOLVED' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-black text-navy tracking-tight">
          Track Grievance Status & SLA
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
          Enter your official complaint reference number to view assigned engineers, live SLA countdowns, and escalation logs.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              Official Grievance Tracking Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('track_input_placeholder')}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-300 text-base font-mono font-bold uppercase focus:ring-2 focus:ring-saffron focus:border-saffron"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full bg-navy hover:bg-navy-dark text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{t('track_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Demo Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
            Instant Test Cases (Click to inspect live SLAs):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleCodes.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => navigate(`/track/${s.code}`)}
                className="p-3 text-left rounded-xl border border-gray-200 hover:border-saffron hover:bg-orange-50/40 transition-all group"
              >
                <div className="font-mono text-xs font-bold text-navy group-hover:text-saffron">
                  {s.code}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
