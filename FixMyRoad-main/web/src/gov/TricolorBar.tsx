import React from 'react';

export const TricolorBar: React.FC = () => {
  return (
    <div className="w-full flex h-1.5 shadow-sm" aria-hidden="true">
      <div className="flex-1 bg-[#FF9933]"></div>
      <div className="flex-1 bg-white border-y border-gray-100"></div>
      <div className="flex-1 bg-[#138808]"></div>
    </div>
  );
};
