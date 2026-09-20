import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Sparkles, Key, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface AiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const AiKeyModal: React.FC<AiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiRequest('/ai/status')
        .then((res) => setStatus(res))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await apiRequest('/ai/set-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      setMsg({ type: 'success', text: res.message || 'Gemini API Key activated successfully!' });
      setStatus((s: any) => ({ ...s, geminiConfigured: true }));
      setApiKey('');
      if (onKeySaved) onKeySaved();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save key' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-navy via-navy-dark to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-saffron/20 border border-saffron/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">Google Gemini 1.5 Flash Engine</h3>
              <p className="text-[11px] text-gray-300">Autonomous Civic Hazard Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status?.geminiConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-gray-800">
                {status?.geminiConfigured ? 'Gemini Flash API Active' : 'Offline / Smart Heuristic Mode'}
              </span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-bold">
              v1.5 Flash
            </span>
          </div>

          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Form to set API key */}
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Enter Gemini API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-saffron focus:border-saffron"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Free key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy font-bold underline"
                >
                  aistudio.google.com
                </a>
                . Keys are securely kept in memory for processing road photos.
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="flex-1 bg-navy hover:bg-navy-dark text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-all disabled:opacity-50"
              >
                {loading ? 'Activating...' : 'Activate Gemini Key'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </form>

          {/* Feature List */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Integrated Capabilities:
            </span>
            <ul className="text-xs text-gray-600 space-y-1.5 font-medium">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Auto-Rejects non-road / spam / selfie uploads</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Classifies Potholes, Cracks, Waterlogging & Severity</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>50m Spatial Proximity Duplicate Detection</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>1-Click Autonomous Filing & Ward Engineer Dispatch</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
