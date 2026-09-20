import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Trophy, Medal, Award, TrendingUp, RefreshCw } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/dashboard/leaderboard').then(res => { if (res.data) setAgencies(res.data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const medals = [
    { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-50 border-amber-300', rank: '1st Rank' },
    { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-300', rank: '2nd Rank' },
    { icon: Award, color: 'text-amber-600', bg: 'bg-orange-50 border-orange-300', rank: '3rd Rank' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-saffron font-bold text-xs uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" /><span>Inter-Agency Public Accountability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">National Road Redressal Leaderboard</h1>
          <p className="text-xs text-gray-300 mt-1">
            Ranking civic road agencies by statutory turnaround time, breach mitigation, and verified repairs.
          </p>
        </div>
      </div>

      {/* Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agencies.slice(0, 3).map((agency, idx) => {
          const m = medals[idx];
          const Icon = m.icon;
          return (
            <div key={agency.id} className={`p-6 rounded-3xl border-2 shadow-sm ${m.bg} flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-gray-600">{m.rank}</span>
                <Icon className={`w-8 h-8 ${m.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-black text-navy leading-tight">{agency.name}</h3>
                <span className="text-xs text-gray-500 mt-0.5 block">{agency.nameHi}</span>
              </div>
              <div className="mt-5 pt-4 border-t border-black/10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">SLA Index Score</span>
                  <span className="text-3xl font-black text-navy">{agency.score}/100</span>
                </div>
                <div className="w-full bg-white/70 rounded-full h-2">
                  <div className={`h-full rounded-full ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-500'}`} style={{ width: `${Math.min(agency.score, 100)}%` }} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-gray-500">{agency.resolvedComplaints}/{agency.totalComplaints} resolved</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-navy shadow-sm">{agency.badge}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-saffron" />
          <h2 className="text-base font-black text-navy">Complete Departmental Standings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Agency / Department</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Total</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Breached</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-gray-300 mx-auto" /></td></tr>
              ) : agencies.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No agency data available.</td></tr>
              ) : (
                agencies.map((agency, idx) => (
                  <tr key={agency.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-navy">#{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <strong className="text-navy block">{agency.name}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">{agency.code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{agency.type}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{agency.totalComplaints}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-govgreen-dark">{agency.resolvedComplaints}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-red-600">{agency.breachedComplaints}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-sm font-black text-navy bg-gray-100 px-2.5 py-1 rounded-lg">{agency.score} pts</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
