import React from 'react';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
  subtext?: string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected,
  onClick,
  icon,
  subtext
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 flex flex-col justify-between ${
        selected
          ? 'border-saffron bg-orange-50/70 text-navy shadow-sm ring-2 ring-saffron/20'
          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
      }`}
    >
      <div className="flex items-center space-x-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-sm font-bold">{label}</span>
      </div>
      {subtext && (
        <span className="text-[11px] text-gray-500 mt-1 font-medium leading-tight">
          {subtext}
        </span>
      )}
    </button>
  );
};
