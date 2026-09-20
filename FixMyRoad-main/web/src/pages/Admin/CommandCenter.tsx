import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Link } from 'react-router-dom';
import {
  BarChart3, AlertOctagon, Trophy, CheckCircle, TrendingUp,
  ArrowRight, RefreshCw, Flame, Users, ShieldAlert, Activity, ExternalLink
} from 'lucide-react';
import { CommandCenterInspectModal } from '../../components/CommandCenterInspectModal';

export const CommandCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspectComplaint, setInspectComplaint] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      apiRequest('/dashboard/metrics').then(res => setMetrics(res.data)),
      apiRequest('/dashboard/escalations').then(res => setEscalations(res.data || [])),
      apiRequest('/dashboard/leaderboard').then(res => setLeaderboard(res.data || [])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-saffron uppercase tracking-widest block mb-1">Ministry Level Executive Oversight</span>
          <h1 className="text-2xl sm:text-3xl font-black">National Civic Road Command Center</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Real-time inter-agency monitoring of NHAI, State PWDs, and Municipal Corporations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/admin/escalations" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow flex items-center space-x-1.5 transition-colors">
            <AlertOctagon className="w-4 h-4" /><span>Breach Monitor</span>
          </Link>
          <Link to="/admin/leaderboard" className="bg-saffron hover:bg-saffron-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow flex items-center space-x-1.5 transition-colors">
            <Trophy className="w-4 h-4" /><span>Leaderboard</span>
          </Link>
          <button onClick={load} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tier-2 Governance Protocol Alert */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-saffron/60 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-saffron/20 border border-saffron/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 text-saffron-dark" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-extrabold text-navy uppercase tracking-wider block text-[11px]">
            Hierarchical Escalation Protocol Enforced
          </span>
          <p className="text-gray-700 leading-relaxed font-medium">
            When a citizen reports a grievance, it is <strong>routed directly to the competent Local Authority &amp; Field Engineer</strong>.
            Grievances are <strong>only escalated to this National Command Center if the local authority fails to resolve them within statutory SLA deadlines</strong>.
          </p>
        </div>
      </div>

      {/* Stat Cards - Clickable Interactive Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Escalated to Command Center',
            value: metrics?.commandCenterEscalatedCount ?? metrics?.breachedCount ?? escalations.length,
            icon: Flame,
            color: 'text-red-600',
            bg: 'bg-red-50/60 border-red-200 hover:border-red-400 hover:shadow-md',
            note: 'Action Required: Local SLA exceeded',
            to: '/admin/complaints?tier=escalated'
          },
          {
            label: 'Active in Local Authority',
            value: metrics?.localAuthorityActiveCount ?? 0,
            icon: Users,
            color: 'text-blue-700',
            bg: 'bg-blue-50/60 border-blue-200 hover:border-blue-400 hover:shadow-md',
            note: 'Under field engineer care within SLA',
            to: '/admin/complaints?tier=local'
          },
          {
            label: 'National SLA Rate',
            value: `${metrics?.resolutionRate ?? 75}%`,
            icon: TrendingUp,
            color: 'text-navy',
            bg: 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md',
            note: 'Inter-agency compliance average',
            to: '/admin/sla-rules'
          },
          {
            label: 'Verified Closures',
            value: metrics?.resolvedComplaints ?? 0,
            icon: CheckCircle,
            color: 'text-govgreen-dark',
            bg: 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md',
            note: 'Citizen-inspected completions',
            to: '/admin/complaints?tier=all'
          },
        ].map(({ label, value, icon: Icon, color, bg, note, to }) => (
          <Link key={label} to={to} className={`p-5 rounded-2xl border shadow-sm transition-all group block ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide group-hover:text-navy transition-colors">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
              <span>{note}</span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 group-hover:text-navy transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/complaints?tier=escalated', icon: AlertOctagon, label: 'Command Center Queue', sub: `${metrics?.commandCenterEscalatedCount ?? escalations.length} escalated cases requiring HQ action`, color: 'text-red-600', border: 'border-red-200 hover:border-red-400', bg: 'bg-red-50' },
          { to: '/admin/complaints?tier=local', icon: ShieldAlert, label: 'Local Authority Field View', sub: `${metrics?.localAuthorityActiveCount ?? 0} cases progressing within SLA`, color: 'text-blue-700', border: 'border-blue-200 hover:border-blue-400', bg: 'bg-blue-50/40' },
          { to: '/admin/audit', icon: Activity, label: 'National Audit Trail', sub: 'Tamper-evident legal ledger', color: 'text-govgreen-dark', border: 'border-govgreen/20 hover:border-govgreen/50', bg: 'bg-govgreen-light/30' },
        ].map(({ to, icon: Icon, label, sub, color, border, bg }) => (
          <Link key={to} to={to} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${border} ${bg} hover:shadow-sm transition-all group bg-white`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-black text-navy">{label}</p>
                <p className="text-[11px] text-gray-500">{sub}</p>
              </div>
            </div>
            <ArrowRight className={`w-4 h-4 text-gray-300 group-hover:${color} transition-colors`} />
          </Link>
        ))}
      </div>

      {/* Escalations Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
            <h2 className="text-base font-black text-navy">Complaints Escalated from Local Authorities (SLA Overdue)</h2>
            {escalations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">{escalations.length} Active</span>
            )}
          </div>
          <Link to="/admin/escalations" className="text-xs font-bold text-navy hover:text-saffron flex items-center space-x-1 transition-colors">
            <span>View All Escalations</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Grievance Code</th>
                <th className="py-3 px-4">Local Authority</th>
                <th className="py-3 px-4">Escalation Stage</th>
                <th className="py-3 px-4">Hazard</th>
                <th className="py-3 px-4">Current Custody</th>
                <th className="py-3 px-4 text-right">HQ Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {escalations.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">
                  <CheckCircle className="w-9 h-9 mx-auto mb-2 text-govgreen/50" />
                  <p className="font-bold text-gray-700">No active escalations in Command Center.</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">All municipal corporations and PWD divisions are operating within statutory SLA limits.</p>
                </td></tr>
              ) : (
                escalations.slice(0, 6).map(item => (
                  <tr key={item.id} className="hover:bg-red-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-navy">{item.complaintCode}</td>
                    <td className="py-3 px-4 font-bold">{item.authority?.name || item.authority?.code || 'Local PWD'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-red-100 text-red-800 border border-red-200 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
                        Level {item.escalationLevel || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.category} ({item.severity})</td>
                    <td className="py-3 px-4 text-red-700 font-semibold truncate max-w-xs">{item.assignedOfficerName || 'National Command Center'}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setInspectComplaint(item)}
                        className="inline-flex items-center text-xs text-white bg-navy hover:bg-red-700 font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all group cursor-pointer"
                      >
                        <span>Inspect Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 text-saffron group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Agencies */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-saffron" />
              <h2 className="text-base font-black text-navy">Top Performing Agencies</h2>
            </div>
            <Link to="/admin/leaderboard" className="text-xs font-bold text-navy hover:text-saffron flex items-center space-x-1 transition-colors">
              <span>Full Ranking</span><ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 3).map((agency, idx) => (
              <div key={agency.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <span className={`text-lg font-black w-8 text-center ${idx === 0 ? 'text-saffron-dark' : idx === 1 ? 'text-gray-500' : 'text-orange-600'}`}>#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-navy truncate">{agency.name}</p>
                  <p className="text-[10px] text-gray-500">{agency.type}</p>
                </div>
                <span className="font-mono text-xl font-black text-navy">{agency.score}</span>
                <span className="text-[10px] text-gray-400 font-bold">pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Command Center Executive Inspection Modal */}
      {inspectComplaint && (
        <CommandCenterInspectModal
          complaint={inspectComplaint}
          onClose={() => setInspectComplaint(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
};
