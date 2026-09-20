import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TricolorBar } from './TricolorBar';
import { FontSizeAdjuster } from './FontSizeAdjuster';
import { LanguageToggle } from './LanguageToggle';
import { useOnline } from '../hooks/useOnline';
import { ShieldAlert, WifiOff, Scale, PhoneCall } from 'lucide-react';
import { CitizenCharterModal } from '../components/CitizenCharterModal';

export const GovtHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isOnline = useOnline();
  const [showCharter, setShowCharter] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <TricolorBar />

      {/* Accessibility & Govt Top Strip */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-1 text-xs text-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-ashoka">{t('govt_of_india')}</span>
          <span className="text-gray-400">|</span>
          <span className="hidden sm:inline text-gray-600">Ministry of Road Transport & Highways Partner</span>
          <span className="hidden md:inline text-gray-400">|</span>
          <button
            type="button"
            onClick={() => setShowCharter(true)}
            className="hidden md:inline-flex items-center space-x-1 text-[11px] font-bold text-navy hover:text-saffron transition-colors cursor-pointer"
          >
            <Scale className="w-3 h-3 text-saffron" />
            <span>नागरिक अधिकार पत्र (Citizens Charter)</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {!isOnline && (
            <span className="inline-flex items-center text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium text-[11px] animate-pulse">
              <WifiOff className="w-3 h-3 mr-1" />
              2G Offline Mode
            </span>
          )}
          <FontSizeAdjuster />
          <LanguageToggle />
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/emblem.svg"
            alt="National Emblem of India"
            className="w-12 h-12 object-contain"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy">
                FixMyRoad <span className="text-saffron font-bold text-lg sm:text-xl">| सड़क प्रहरी</span>
              </h1>
              <span className="bg-saffron text-white text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide">
                Govt SLA
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-tight">
              {i18n.language.startsWith('hi')
                ? 'केंद्रीकृत लोक शिकायत एवं निगरानी प्रणाली'
                : 'Centralized Public Grievance Redress & Monitoring System'}
            </p>
          </div>
        </Link>

        {/* Emergency Helpline Banner */}
        <div className="hidden md:flex items-center space-x-4 text-right">
          <div className="border-r border-gray-200 pr-4">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">Toll Free 24x7 Helpline</span>
            <div className="flex items-center space-x-2 font-mono text-sm font-black text-ashoka">
              <a href="tel:1033" className="hover:text-saffron hover:underline" title="Call NHAI Road Safety Helpline">
                1033 (NHAI)
              </a>
              <span className="text-gray-300">/</span>
              <a href="tel:1913" className="hover:text-saffron hover:underline" title="Call Municipal Corporation Helpline">
                1913 (MCD)
              </a>
            </div>
          </div>
          <div className="text-left">
            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-green-50 text-govgreen-dark border border-govgreen/30 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-govgreen mr-1.5 animate-ping"></span>
              24x7 SLA Active
            </span>
          </div>
        </div>
      </div>

      {/* Citizen Charter Modal */}
      {showCharter && (
        <CitizenCharterModal
          onClose={() => setShowCharter(false)}
        />
      )}
    </header>
  );
};
