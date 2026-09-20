import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BigButtonProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'saffron' | 'navy' | 'green';
  onClick?: () => void;
}

export const BigButton: React.FC<BigButtonProps> = ({
  title,
  subtitle,
  icon: Icon,
  variant = 'saffron',
  onClick
}) => {
  const colorStyles = {
    saffron: 'bg-gradient-to-r from-[#FF9933] to-[#E67E00] hover:from-[#E67E00] hover:to-[#CC6600] text-white border-[#B35900] shadow-orange-200',
    navy: 'bg-gradient-to-r from-[#000080] to-[#00005C] hover:from-[#000066] hover:to-[#000040] text-white border-[#000033] shadow-blue-200',
    green: 'bg-gradient-to-r from-[#138808] to-[#0D6005] hover:from-[#0D6005] hover:to-[#094003] text-white border-[#062B02] shadow-green-200'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 sm:p-8 rounded-2xl border-2 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 group relative overflow-hidden ${colorStyles[variant]}`}
    >
      <div className="flex items-center space-x-5">
        <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
          <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
};
