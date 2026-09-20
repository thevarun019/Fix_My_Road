import React, { useState } from 'react';
import { LocationPicker } from '../../components/LocationPicker';
import { useDraftStore } from '../../stores/draftStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useTranslation } from 'react-i18next';
import { MapPin, Building2 } from 'lucide-react';

interface Step2LocationProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step2Location: React.FC<Step2LocationProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const { draft, setDraft } = useDraftStore();
  const { getCurrentLocation, loading: gpsLoading } = useGeolocation();

  const handleLocationChange = (lat: number, lng: number, autoAddress?: string, autoPincode?: string) => {
    setDraft({
      latitude: lat,
      longitude: lng,
      ...(autoAddress ? { address: autoAddress } : {}),
      ...(autoPincode ? { pincode: autoPincode } : {})
    });
  };

  const handleGps = () => {
    getCurrentLocation();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setDraft({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-navy">{t('step2_title')}</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{t('step2_sub')}</p>
      </div>

      {draft.aiAnalysis?.geoCapture && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">
              📍 AI Auto-Captured: {draft.aiAnalysis.geoCapture.address}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
            {draft.aiAnalysis.geoCapture.detectionSource.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      <LocationPicker
        latitude={draft.latitude}
        longitude={draft.longitude}
        onLocationChange={handleLocationChange}
        onGpsClick={handleGps}
        gpsLoading={gpsLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
              Street Address / Landmark
            </label>
            {draft.address && (
              <span className="text-[10px] text-emerald-700 font-extrabold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span>✓ Selected from Map</span>
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={draft.address}
              onChange={(e) => setDraft({ address: e.target.value })}
              placeholder="e.g. Near Metro Pillar 142, Pusa Road"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-saffron focus:border-saffron bg-white"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          {!draft.address && (
            <p className="text-[11px] text-amber-700 mt-1 font-medium">
              💡 Tip: Click anywhere on the map or search above to auto-select this address.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
            PIN Code
          </label>
          <input
            type="text"
            value={draft.pincode}
            onChange={(e) => setDraft({ pincode: e.target.value })}
            placeholder="e.g. 6-digit PIN code"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-saffron focus:border-saffron bg-white"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-6 rounded-xl font-bold text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!draft.address || !draft.latitude || !draft.longitude}
          className={`py-3 px-8 rounded-xl font-bold text-sm shadow-md transition-all ${
            draft.address && draft.latitude && draft.longitude
              ? 'bg-saffron hover:bg-saffron-dark text-white cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next: Hazard Details (विवरण) →
        </button>
      </div>
    </div>
  );
};
