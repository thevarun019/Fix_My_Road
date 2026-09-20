import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Link } from 'react-router-dom';
import { AlertOctagon, Clock, ChevronRight, RefreshCw, Flame, Filter } from 'lucide-react';
import { CommandCenterInspectModal } from '../../components/CommandCenterInspectModal';

export const Escalations: React.FC = () => {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [inspectComplaint, setInspectComplaint] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    apiRequest('/dashboard/escalations').then(res => setEscalations(res.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? escalations : escalations.filter(e => String(e.escalationLevel) === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4" /><span>SLA Breach Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Active Escalations</h1>
          <p className="text-xs text-gray-300 mt-1">
            {escalations.length} complaint{escalations.length !== 1 ? 's' : ''} have exceeded statutory turnaround time
          </p>
        </div>
        <button onClick={load} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
        </button>
      </div>

      {/* Level Filter */}
      <div className="flex items-center space-x-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter by level:</span>
        <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {(['ALL', '1', '2', '3'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold border-r border-gray-200 last:border-0 transition-all ${
                filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'ALL' ? `All (${escalations.length})` : `Level ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /><span className="text-sm">Loading escalations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <AlertOctagon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">No escalations in this category</p>
          </div>
        ) : (
          filtered.map(item => {
            const overdueHours = Math.abs(Math.round((Date.now() - new Date(item.slaDeadline).getTime()) / 3600000));
            return (
              <div key={item.id} className="bg-white border-2 border-red-200 rounded-2xl p-5 shadow-sm hover:border-red-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-navy">{item.complaintCode}</span>
                      <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Escalation Level {item.escalationLevel}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                        {item.authority?.code || 'PWD'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{item.category} · {item.severity}</p>
                    <p className="text-xs text-gray-500">{item.address}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="flex items-center space-x-1 text-red-600 font-bold">
                        <Clock className="w-3.5 h-3.5" /><span>{overdueHours}h overdue</span>
                      </span>
                      <span className="text-gray-500">Assigned: {item.assignedOfficerName || 'Unassigned'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectComplaint(item)}
                    className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <span>Inspect Dossier</span><ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
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
