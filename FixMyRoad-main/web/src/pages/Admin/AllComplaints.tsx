import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList, Search, RefreshCw, Flame, ShieldCheck, Globe, AlertOctagon, Eye } from 'lucide-react';
import { CommandCenterInspectModal } from '../../components/CommandCenterInspectModal';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-gray-100 text-gray-600 border-gray-200',
  VERIFIED: 'bg-teal-100 text-teal-800 border-teal-200',
};

export const AllComplaints: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTier = (searchParams.get('tier') as 'escalated' | 'local' | 'all') || 'escalated';

  const [activeTier, setActiveTier] = useState<'escalated' | 'local' | 'all'>(initialTier);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [inspectComplaint, setInspectComplaint] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    const tierParam = activeTier !== 'all' ? `&tier=${activeTier}` : '';
    apiRequest(`/complaints?limit=100${tierParam}`)
      .then(res => { if (res.items) setComplaints(res.items); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [activeTier]);

  const handleTierChange = (tier: 'escalated' | 'local' | 'all') => {
    setActiveTier(tier);
    setSearchParams(tier === 'all' ? {} : { tier });
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.complaintCode?.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-saffron font-bold text-xs uppercase tracking-wider mb-2">
            <ClipboardList className="w-4 h-4" /><span>Hierarchical Grievance Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Complaints &amp; Escalations Registry</h1>
          <p className="text-xs text-gray-300 mt-1">
            {activeTier === 'escalated'
              ? 'Showing only complaints escalated to Command Center due to Local Authority SLA non-performance.'
              : activeTier === 'local'
              ? 'Showing active complaints currently managed by Local Authorities & Ward Engineers within SLA.'
              : 'Cross-authority view of all registered civic grievances.'}
          </p>
        </div>
        <button onClick={load} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
        </button>
      </div>

      {/* Tier Switcher Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 border border-gray-200 rounded-2xl shadow-inner">
        <button
          onClick={() => handleTierChange('escalated')}
          className={`flex-1 min-w-[220px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTier === 'escalated'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-600 hover:text-navy hover:bg-white/60'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Escalated to Command Center</span>
          {activeTier === 'escalated' && <span className="ml-1 bg-white text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black">{complaints.length}</span>}
        </button>

        <button
          onClick={() => handleTierChange('local')}
          className={`flex-1 min-w-[220px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTier === 'local'
              ? 'bg-blue-800 text-white shadow-md'
              : 'text-gray-600 hover:text-navy hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Local Authority Queue (Within SLA)</span>
          {activeTier === 'local' && <span className="ml-1 bg-white text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">{complaints.length}</span>}
        </button>

        <button
          onClick={() => handleTierChange('all')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTier === 'all'
              ? 'bg-navy text-white shadow-md'
              : 'text-gray-600 hover:text-navy hover:bg-white/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>All National Grievances</span>
          {activeTier === 'all' && <span className="ml-1 bg-white text-navy text-[10px] px-2 py-0.5 rounded-full font-black">{complaints.length}</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by code, address, category..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-navy focus:border-navy shadow-sm"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-300 rounded-xl text-xs text-gray-700 px-3 py-2.5 font-bold focus:ring-2 focus:ring-navy shadow-sm">
          {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'VERIFIED'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          className="bg-white border border-gray-300 rounded-xl text-xs text-gray-700 px-3 py-2.5 font-bold focus:ring-2 focus:ring-navy shadow-sm">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-bold">Code</th>
                <th className="py-3 px-4 font-bold">Custody / Authority</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Severity</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Address</th>
                <th className="py-3 px-4 font-bold text-center">Priority</th>
                <th className="py-3 px-4 font-bold">SLA Deadline</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10"><RefreshCw className="w-5 h-5 animate-spin text-gray-300 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">No complaints match your filters in this tier.</td></tr>
              ) : (
                filtered.map(item => {
                  const isOverdue = (new Date(item.slaDeadline).getTime() < Date.now() || item.slaBreached) && item.status !== 'RESOLVED' && item.status !== 'VERIFIED';
                  const isEscalated = item.custodyTier === 'COMMAND_CENTER' || item.escalationLevel > 0 || isOverdue;

                  return (
                    <tr key={item.id} className={`transition-colors ${isEscalated ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-gray-50'}`}>
                      <td className="py-3 px-4 font-mono font-black text-navy">{item.complaintCode}</td>
                      <td className="py-3 px-4">
                        {isEscalated ? (
                          <span className="inline-flex items-center space-x-1 bg-red-100 text-red-800 border border-red-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 text-red-600" />
                            <span>Command Center (L{item.escalationLevel || 1})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>{item.authority?.code || 'Local'} Field Control</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800">{item.category}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-200'
                          : item.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{item.severity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-600'}`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-[180px] truncate">{item.address}</td>
                      <td className="py-3 px-4 text-center font-bold text-navy">{item.priorityScore}/100</td>
                      <td className={`py-3 px-4 ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        {item.slaDeadline ? new Date(item.slaDeadline).toLocaleDateString('en-IN') : 'N/A'}
                        {isOverdue && <span className="ml-1 text-[10px] font-black text-red-600">BREACH</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectComplaint(item)}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-navy hover:text-white bg-gray-100 hover:bg-navy px-3 py-1.5 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
