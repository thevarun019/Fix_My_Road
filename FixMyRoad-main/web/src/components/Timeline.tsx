import React from 'react';
import { CheckCircle, AlertCircle, ArrowUpRight, Clock, FileCheck } from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  actorType: string;
  actorId?: string | null;
  details?: string | null;
  timestamp: string | Date;
}

interface TimelineProps {
  logs: AuditLogItem[];
  currentStatus: string;
}

export const Timeline: React.FC<TimelineProps> = ({ logs, currentStatus }) => {
  const getActionIcon = (action: string) => {
    if (action.includes('CREATED')) return <Clock className="w-4 h-4 text-blue-600" />;
    if (action.includes('ESCALATED')) return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    if (action.includes('RESOLVED') || action.includes('VERIFIED')) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <FileCheck className="w-4 h-4 text-purple-600" />;
  };

  const getActionLabel = (action: string) => {
    if (action === 'CREATED') return 'Complaint Filed by Citizen';
    if (action.includes('ESCALATED_LEVEL_1')) return 'Auto-Escalated to Assistant Executive Engineer (AEE)';
    if (action.includes('ESCALATED_LEVEL_2')) return 'Auto-Escalated to Superintending Engineer (SE)';
    if (action.includes('ESCALATED_LEVEL_3')) return 'Auto-Escalated to Chief Engineer / Commissioner';
    if (action === 'STATUS_IN_PROGRESS') return 'Work Order Dispatched & Repair In Progress';
    if (action === 'STATUS_RESOLVED') return 'Repair Work Completed with Evidence';
    if (action === 'CITIZEN_VERIFIED') return 'Citizen Confirmed Resolution';
    if (action === 'CITIZEN_REOPENED') return 'Citizen Reopened Complaint (Unsatisfied)';
    return action.replace(/_/g, ' ');
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, idx) => {
          let parsedDetails: any = {};
          try {
            parsedDetails = log.details ? JSON.parse(log.details) : {};
          } catch {}

          const isLast = idx === logs.length - 1;

          return (
            <li key={log.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div className="h-8 w-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-sm">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {getActionLabel(log.action)}
                      </p>
                      {parsedDetails.remarks && (
                        <p className="text-xs text-gray-600 mt-0.5 italic">
                          "{parsedDetails.remarks}"
                        </p>
                      )}
                      {parsedDetails.reason && (
                        <p className="text-xs text-red-600 mt-0.5 font-medium">
                          Reason: {parsedDetails.reason}
                        </p>
                      )}
                      {parsedDetails.rating && (
                        <p className="text-xs text-amber-600 mt-0.5 font-bold">
                          Rating: {'★'.repeat(parsedDetails.rating)} ({parsedDetails.rating}/5)
                        </p>
                      )}
                      <span className="text-[11px] font-semibold text-navy mt-1 inline-block">
                        Actor: {log.actorType} {log.actorId ? `(${log.actorId})` : ''}
                      </span>
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-gray-500 font-medium">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
