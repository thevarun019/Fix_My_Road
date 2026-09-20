import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs: Record<string, { label: string; bg: string; text: string; border: string }> = {
    SUBMITTED: {
      label: 'Submitted (दर्ज)',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300'
    },
    ASSIGNED: {
      label: 'Assigned to Ward (आवंटित)',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-300'
    },
    IN_PROGRESS: {
      label: 'In Progress (प्रगति पर)',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300'
    },
    RESOLVED: {
      label: 'Work Completed (समाधान हुआ)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300'
    },
    VERIFIED: {
      label: 'Citizen Verified (सत्यापित)',
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400'
    },
    REJECTED: {
      label: 'Closed / Rejected',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-300'
    }
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} shadow-sm`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {config.label}
    </span>
  );
};
