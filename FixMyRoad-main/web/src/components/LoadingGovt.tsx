import React from 'react';

interface LoadingGovtProps {
  message?: string;
}

export const LoadingGovt: React.FC<LoadingGovtProps> = ({
  message = 'Processing Government Grievance Data...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-16 h-16 mb-4">
        <img
          src="/emblem.svg"
          alt="Ashoka Emblem Loading"
          className="w-16 h-16 animate-pulse"
        />
        <div className="absolute inset-0 border-4 border-t-saffron border-r-transparent border-b-govgreen border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-sm font-bold text-navy animate-pulse">{message}</p>
      <span className="text-xs text-gray-500 mt-1">Verifying SLA and Department Security Protocols</span>
    </div>
  );
};
