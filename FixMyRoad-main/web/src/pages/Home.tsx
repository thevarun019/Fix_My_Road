import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../components/BigButton';
import { AlertTriangle, Search, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, PhoneCall, TrendingUp } from 'lucide-react';
import { apiRequest } from '../lib/api';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalComplaints: 3,
    resolvedComplaints: 1,
    resolutionRate: 75,
    criticalCount: 1
  });

  useEffect(() => {
    apiRequest('/dashboard/metrics')
      .then((res) => {
        if (res.data) setMetrics(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-dark to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden lg:block">
          <img src="/emblem.svg" alt="Background Emblem" className="h-full object-cover invert" />
        </div>

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 bg-saffron/20 border border-saffron/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-saffron animate-ping"></span>
            <span>Government of India Grievance Redressal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Fix Our Roads with Guaranteed SLAs
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            Report road hazards, potholes, and broken asphalt directly to responsible local authorities. Track resolution against statutory deadlines with automatic officer escalation.
          </p>
        </div>
      </div>

      {/* 2 Big Core Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BigButton
          title={t('btn_report_big')}
          subtitle={t('btn_report_sub')}
          icon={AlertTriangle}
          variant="saffron"
          onClick={() => navigate('/report')}
        />

        <BigButton
          title={t('btn_track_big')}
          subtitle={t('btn_track_sub')}
          icon={Search}
          variant="navy"
          onClick={() => navigate('/track')}
        />
      </div>

      {/* Live SLA & Redressal Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Complaints Filed</span>
            <AlertTriangle className="w-5 h-5 text-saffron" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy mt-2">{metrics.totalComplaints}</div>
          <span className="text-[11px] text-gray-500 font-medium">Logged in national registry</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Resolved On-Time</span>
            <CheckCircle2 className="w-5 h-5 text-govgreen" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-govgreen mt-2">{metrics.resolvedComplaints}</div>
          <span className="text-[11px] text-gray-500 font-medium">Verified by citizen photos</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">SLA Success Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy mt-2">{metrics.resolutionRate}%</div>
          <span className="text-[11px] text-gray-500 font-medium">Compliance with citizen charter</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Critical Hazards</span>
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2">{metrics.criticalCount}</div>
          <span className="text-[11px] text-gray-500 font-medium">24-hour priority dispatch</span>
        </div>
      </div>

      {/* Emergency Helpline & Quick Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <PhoneCall className="w-6 h-6 text-saffron-dark" />
            <h3 className="text-base font-bold text-gray-900">Immediate Phone Helplines</h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed mb-4">
            For accidents, major cave-ins, or immediate road blockage, call national emergency response:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-orange-200/60 font-semibold">
              <span>National Highway Patrol (NHAI)</span>
              <span className="text-navy font-black">1033</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-orange-200/60 font-semibold">
              <span>Municipal Disaster Cell</span>
              <span className="text-navy font-black">1077</span>
            </div>
            <div className="flex justify-between py-1.5 font-semibold">
              <span>Municipal Corporation Toll Free</span>
              <span className="text-navy font-black">1913</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-navy" />
            <h3 className="text-base font-bold text-gray-900">How FixMyRoad Works</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700 leading-relaxed mt-3">
            <li><strong>Photo & GPS:</strong> Citizen snaps photo; faces & car numbers are automatically blurred.</li>
            <li><strong>GIS Routing:</strong> PostGIS spatial routing sends complaint to correct Ward/NHAI officer.</li>
            <li><strong>SLA Clock:</strong> A statutory resolution countdown starts immediately (12h to 72h).</li>
            <li><strong>Escalation:</strong> If overdue, it auto-escalates to Executive Engineer & Commissioner.</li>
          </ol>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-saffron uppercase tracking-wider">Public Accountability</span>
            <h3 className="text-base font-bold text-navy mt-1">Inter-Agency Road Leaderboard</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Compare MCD, NDMC, Delhi PWD, and NHAI on resolution speed, breach counts, and citizen ratings.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/leaderboard')}
            className="mt-4 w-full bg-navy hover:bg-navy-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>View Agency Rankings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
