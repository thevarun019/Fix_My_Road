import React from 'react';
import { useSlaCountdown } from '../hooks/useSlaCountdown';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SlaCountdownProps {
  deadline: string | Date;
  status: string;
}

export const SlaCountdown: React.FC<SlaCountdownProps> = ({ deadline, status }) => {
  const { formatted, hours, minutes, seconds, isBreached, isWarning } = useSlaCountdown(deadline);

  if (status === 'RESOLVED' || status === 'VERIFIED') {
    return (
      <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-2 rounded-xl text-sm font-bold">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span>SLA Satisfied: Resolved within statutory deadline</span>
      </div>
    );
  }

  if (isBreached) {
    return (
      <div className="bg-red-50 border-2 border-red-400 text-red-900 p-4 rounded-xl shadow-md">
        <div className="flex items-center space-x-2 text-red-700 font-extrabold text-sm uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
          <span>SLA Breached & Escalated to Higher Authority</span>
        </div>
        <p className="text-xs text-red-700 mt-1 font-medium">
          The resolution deadline elapsed. Complaint has automatically escalated up the administrative chain.
        </p>
        <div className="mt-2 text-lg font-black text-red-600 font-mono">
          {formatted}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border-2 shadow-sm ${
        isWarning
          ? 'bg-amber-50 border-amber-400 text-amber-900'
          : 'bg-blue-50 border-blue-200 text-navy'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>SLA Countdown (समय सीमा)</span>
        </div>
        {isWarning && (
          <span className="text-[11px] bg-amber-200 text-amber-800 font-black px-2 py-0.5 rounded">
            Urgent Warning (&lt; 6h)
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline space-x-3">
        <div className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-navy">
          {formatted}
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-1 font-medium">
        Target resolution within statutory timeframe before automated escalation to Executive Engineer.
      </p>
    </div>
  );
};
