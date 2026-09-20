import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { BarChart2, Target, Zap } from 'lucide-react';

export const SlaScorecard: React.FC = () => {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/complaints?limit=200').then(res => { if (res.items) setComplaints(res.items); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'VERIFIED').length;
  const breached = complaints.filter(c => c.slaBreached).length;
  const onTime = Math.max(resolved - breached, 0);
  const slaRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
  const grade = slaRate >= 90 ? 'A+' : slaRate >= 75 ? 'A' : slaRate >= 60 ? 'B' : 'C';
  const gradeColor = slaRate >= 90 ? 'text-govgreen-dark' : slaRate >= 75 ? 'text-navy' : slaRate >= 60 ? 'text-saffron-dark' : 'text-red-600';
  const gradeBarColor = slaRate >= 90 ? 'bg-govgreen' : slaRate >= 75 ? 'bg-navy' : slaRate >= 60 ? 'bg-saffron' : 'bg-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-saffron font-bold text-xs uppercase tracking-wider mb-2">
            <BarChart2 className="w-4 h-4" /><span>Personal Performance Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">My SLA Scorecard</h1>
          <p className="text-xs text-gray-300 mt-1">Statutory compliance metrics for {user?.name?.split('(')[0].trim()}</p>
        </div>
        {/* Grade */}
        <div className="bg-white rounded-2xl px-8 py-4 text-center shadow">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Overall Grade</span>
          <span className={`text-6xl font-black ${gradeColor}`}>{grade}</span>
          <span className="text-xs text-gray-500 block mt-1">{slaRate}% compliance</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned', value: total, color: 'text-navy' },
          { label: 'Resolved', value: resolved, color: 'text-govgreen-dark' },
          { label: 'SLA Breached', value: breached, color: 'text-red-600' },
          { label: 'On-Time Rate', value: `${slaRate}%`, color: 'text-saffron-dark' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-2">{label}</span>
            <span className={`text-3xl font-black ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-navy flex items-center space-x-2">
            <Target className="w-4 h-4 text-saffron" /><span>SLA Compliance Rate</span>
          </span>
          <span className={`text-xl font-black ${gradeColor}`}>{slaRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
          <div className={`h-full rounded-full transition-all duration-1000 ${gradeBarColor}`} style={{ width: `${slaRate}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>0%</span>
          <span className="text-saffron-dark font-bold">60% threshold</span>
          <span className="text-govgreen-dark font-bold">90% target</span>
          <span>100%</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-black text-navy flex items-center space-x-2">
          <Zap className="w-4 h-4 text-saffron" /><span>Category-wise Breakdown</span>
        </h3>
        {['POTHOLE', 'CRACK', 'WATERLOGGING', 'BROKEN_SURFACE'].map(cat => {
          const catC = complaints.filter(c => c.category === cat);
          const catR = catC.filter(c => c.status === 'RESOLVED' || c.status === 'VERIFIED').length;
          const pct = catC.length > 0 ? Math.round(catR / catC.length * 100) : 0;
          if (catC.length === 0) return null;
          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>{cat.replace('_', ' ')}</span>
                <span className="text-gray-500">{catR}/{catC.length} · {pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 border border-gray-200">
                <div className={`h-full rounded-full ${pct >= 75 ? 'bg-govgreen' : pct >= 50 ? 'bg-saffron' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
