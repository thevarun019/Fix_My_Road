import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { BookOpen, RefreshCw, User, Bot, Clock } from 'lucide-react';

const ACTOR_COLORS: Record<string, string> = {
  CITIZEN: 'bg-blue-100 text-blue-800 border-blue-200',
  OFFICER: 'bg-green-100 text-green-800 border-green-200',
  SYSTEM: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-saffron/20 text-saffron-dark border-saffron/30',
};
const ACTION_ICONS: Record<string, string> = {
  CREATED: '📝', STATUS_UPDATED: '🔄', ESCALATED: '🚨', RESOLVED: '✅', REJECTED: '❌', VERIFIED: '⭐',
};

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = () => {
    setLoading(true);
    apiRequest('/complaints?limit=50').then(res => {
      if (res.items) {
        const entries = res.items.flatMap((c: any) => [
          { id: `${c.id}-created`, complaintCode: c.complaintCode, action: 'CREATED', actorType: 'CITIZEN', details: `Complaint filed: ${c.category} at ${c.address}`, timestamp: c.createdAt },
          ...(c.status !== 'SUBMITTED' ? [{ id: `${c.id}-status`, complaintCode: c.complaintCode, action: 'STATUS_UPDATED', actorType: 'OFFICER', details: `Status changed to ${c.status}${c.resolutionRemarks ? ': ' + c.resolutionRemarks.substring(0, 60) : ''}`, timestamp: c.updatedAt }] : []),
          ...(c.escalationLevel > 0 ? [{ id: `${c.id}-escalated`, complaintCode: c.complaintCode, action: 'ESCALATED', actorType: 'SYSTEM', details: `Auto-escalated to Level ${c.escalationLevel} due to SLA breach`, timestamp: c.updatedAt }] : []),
        ]);
        entries.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(entries);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.actorType === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-saffron font-bold text-xs uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" /><span>System Activity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Audit Trail</h1>
          <p className="text-xs text-gray-300 mt-1">{filtered.length} events · Chronological activity log</p>
        </div>
        <button onClick={load} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
        </button>
      </div>

      {/* Actor Filter */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter by actor:</span>
        <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {['ALL', 'CITIZEN', 'OFFICER', 'SYSTEM', 'ADMIN'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-bold border-r border-gray-200 last:border-0 transition-all ${
                filter === f ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>{f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 space-y-0">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" /><span className="text-sm">Loading audit logs...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No log entries found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map(log => (
                <div key={log.id} className="flex items-start space-x-4 relative pl-10">
                  {/* Icon dot */}
                  <div className={`absolute left-2 top-3 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center ${
                    log.actorType === 'SYSTEM' ? 'bg-purple-100' : log.actorType === 'OFFICER' ? 'bg-govgreen-light' : 'bg-navy-light'
                  }`}>
                    {log.actorType === 'SYSTEM'
                      ? <Bot className="w-2.5 h-2.5 text-purple-600" />
                      : <User className="w-2.5 h-2.5 text-navy" />
                    }
                  </div>

                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-base">{ACTION_ICONS[log.action] || '📌'}</span>
                      <span className="font-mono text-xs font-black text-navy">{log.complaintCode}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${ACTOR_COLORS[log.actorType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {log.actorType}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide border border-gray-200 px-2 py-0.5 rounded-full bg-white">
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{log.details}</p>
                    <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleString('en-IN', { hour12: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
