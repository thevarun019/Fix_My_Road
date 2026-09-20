import React, { useState, useEffect } from 'react';

export const FontSizeAdjuster: React.FC = () => {
  const [level, setLevel] = useState<'sm' | 'md' | 'lg'>('md');

  useEffect(() => {
    const root = document.documentElement;
    if (level === 'sm') {
      root.style.fontSize = '14px';
    } else if (level === 'lg') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [level]);

  return (
    <div className="inline-flex items-center space-x-1 border border-gray-300 rounded bg-white px-1 py-0.5 text-xs font-semibold text-gray-700 shadow-sm">
      <button
        onClick={() => setLevel('sm')}
        className={`px-1.5 py-0.5 rounded ${level === 'sm' ? 'bg-navy text-white' : 'hover:bg-gray-100'}`}
        title="Decrease text size (A-)"
        aria-label="Decrease text size"
      >
        A-
      </button>
      <button
        onClick={() => setLevel('md')}
        className={`px-1.5 py-0.5 rounded ${level === 'md' ? 'bg-navy text-white' : 'hover:bg-gray-100'}`}
        title="Default text size (A)"
        aria-label="Default text size"
      >
        A
      </button>
      <button
        onClick={() => setLevel('lg')}
        className={`px-1.5 py-0.5 rounded ${level === 'lg' ? 'bg-navy text-white' : 'hover:bg-gray-100'}`}
        title="Increase text size (A+)"
        aria-label="Increase text size"
      >
        A+
      </button>
    </div>
  );
};
