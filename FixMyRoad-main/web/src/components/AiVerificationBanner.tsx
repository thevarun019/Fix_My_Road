import React from 'react';
import {
  Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  RefreshCw, MapPin, Zap, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AiGeoCaptureResult {
  latitude: number;
  longitude: number;
  address: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
  ward?: string;
  authorityName?: string;
  detectionSource: 'CAMERA_EXIF' | 'DEVICE_GPS' | 'AI_VISION_LANDMARK' | 'CIVIC_CENTER';
  landmarkClues?: string | null;
}

export interface AiAnalysisResult {
  isRoadHazard: boolean;
  rejectionReason: string | null;
  hazardType: 'POTHOLE' | 'CRACK' | 'WATERLOGGING' | 'BROKEN_SURFACE' | 'CAVE_IN';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  roadEstimatedHierarchy: 'NATIONAL_HIGHWAY' | 'STATE_HIGHWAY' | 'ARTERIAL' | 'RESIDENTIAL';
  technicalSummary: string;
  shouldAutoReject: boolean;
  isDuplicate: boolean;
  duplicateDistanceMeters?: number;
  existingComplaintCode?: string;
  engineUsed: 'gemini-3.6-flash' | 'gemini-1.5-flash' | 'local-heuristic';
  geoCapture?: AiGeoCaptureResult;
}

interface AiVerificationBannerProps {
  loading: boolean;
  analysis: AiAnalysisResult | null;
  onAutonomousFile: () => void;
  onProceedManual: () => void;
  onRetake: () => void;
  autonomousLoading?: boolean;
}

export const AiVerificationBanner: React.FC<AiVerificationBannerProps> = ({
  loading,
  analysis,
  onAutonomousFile,
  onProceedManual,
  onRetake,
  autonomousLoading
}) => {
  const navigate = useNavigate();

  // 1. Scanning State
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-navy via-navy-dark to-slate-900 text-white rounded-2xl p-5 border border-navy/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-saffron/20 border border-saffron/40 flex items-center justify-center text-amber-300 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Google Gemini Flash Vision
              </span>
              <h4 className="font-black text-sm">Inspecting Road Hazard & Damage Severity...</h4>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-300">
            Realtime AI
          </span>
        </div>

        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-saffron to-amber-300 w-2/3 animate-pulse rounded-full" />
        </div>

        <p className="text-[11px] text-gray-300 leading-tight">
          Checking for asphalt voids, surface cracks, standing water, and assessing statutory SLA priority.
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  // 2. Rejected / False Request State
  if (analysis.shouldAutoReject || !analysis.isRoadHazard) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 space-y-4 text-red-950 shadow-sm animate-fadeIn">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                AI Auto-Declined
              </span>
              <span className="text-[10px] font-mono text-red-700 font-bold">
                Confidence: {analysis.confidenceScore}%
              </span>
            </div>
            <h4 className="font-black text-sm text-red-900">Submission Ineligible for Statutory SLA Routing</h4>
            <p className="text-xs text-red-800 leading-relaxed">
              {analysis.rejectionReason ||
                'The uploaded image does not appear to show an active public road surface hazard (pothole, crack, or waterlogging). Statutory SLA deadlines only apply to authentic road defects.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-red-200">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Road Hazard Photo</span>
          </button>
          <button
            type="button"
            onClick={onProceedManual}
            className="sm:w-auto px-4 py-3 rounded-xl border border-red-300 text-red-900 bg-white hover:bg-red-50 font-bold text-xs"
          >
            Proceed Manually (Citizen Appeal) →
          </button>
        </div>
      </div>
    );
  }

  // 3. Verified Valid Road Hazard (Always show classification, even if nearby duplicate exists)
  const severityColor =
    analysis.severity === 'CRITICAL'
      ? 'bg-red-600 text-white'
      : analysis.severity === 'HIGH'
      ? 'bg-orange-600 text-white'
      : 'bg-amber-500 text-navy';

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-tight">
                AI Verified Road Hazard
              </span>
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                Gemini Flash
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">Authenticity confirmed · Real road hazard detected</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${severityColor}`}>
            {analysis.severity} SEVERITY
          </span>
          <span className="text-[10px] font-mono bg-white text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold">
            {analysis.confidenceScore}% Confidence
          </span>
        </div>
      </div>

      {/* Technical Damage Assessment */}
      <div className="bg-white/90 rounded-xl p-3.5 border border-emerald-200 text-xs space-y-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          AI Damage Assessment:
        </span>
        <p className="text-gray-800 font-medium leading-relaxed">{analysis.technicalSummary}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-600 font-semibold">
          <span>Hazard: <strong className="text-navy">{analysis.hazardType}</strong></span>
          <span>·</span>
          <span>Road: <strong className="text-navy">{(analysis.roadEstimatedHierarchy || 'ARTERIAL').replace('_', ' ')}</strong></span>
        </div>
      </div>

      {/* AI Automatic Geo-Location Badge */}
      {analysis.geoCapture && (
        <div className="bg-emerald-100/60 border border-emerald-300 rounded-xl p-3 text-xs space-y-1 text-emerald-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-[11px] text-emerald-900 font-black uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>AI Auto-Captured Location</span>
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
              {analysis.geoCapture.detectionSource === 'CAMERA_EXIF'
                ? 'Camera EXIF GPS'
                : analysis.geoCapture.detectionSource === 'DEVICE_GPS'
                ? 'Device GPS'
                : analysis.geoCapture.detectionSource === 'AI_VISION_LANDMARK'
                ? 'AI Landmark Vision'
                : 'Civic Jurisdiction'}
            </span>
          </div>
          <p className="font-bold text-gray-900 text-xs sm:text-[13px] leading-snug">
            {analysis.geoCapture.address}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-600 font-medium pt-0.5">
            <span>Coordinates: <strong className="font-mono text-navy">{analysis.geoCapture.latitude.toFixed(4)}° N, {analysis.geoCapture.longitude.toFixed(4)}° E</strong></span>
            <span>·</span>
            <span>PIN: <strong className="text-navy">{analysis.geoCapture.pincode}</strong></span>
            {analysis.geoCapture.authorityName && (
              <>
                <span>·</span>
                <span>Jurisdiction: <strong className="text-navy">{analysis.geoCapture.authorityName}</strong></span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Duplicate Alert (Informational Callout Only — Does Not Block Submission!) */}
      {analysis.isDuplicate && analysis.existingComplaintCode && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-950 font-bold">
                Nearby complaint ({analysis.existingComplaintCode}) was reported ~{analysis.duplicateDistanceMeters}m away.
              </p>
              <p className="text-amber-800 text-[11px]">
                Your photo will be recorded to accelerate work order resolution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/track/${analysis.existingComplaintCode}`)}
            className="flex-shrink-0 text-[11px] font-bold text-amber-900 hover:text-amber-950 underline flex items-center space-x-1"
          >
            <span>View Ticket</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Dual Action Buttons: Autonomous vs Manual */}
      <div className="pt-1 space-y-2">
        <button
          type="button"
          onClick={onAutonomousFile}
          disabled={autonomousLoading}
          className={`w-full bg-gradient-to-r from-saffron via-saffron-dark to-orange-700 hover:from-saffron-dark hover:to-orange-800 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md flex items-center justify-between group transition-all ${
            autonomousLoading ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          <div className="flex items-center space-x-2.5 text-left">
            {autonomousLoading ? (
              <RefreshCw className="w-5 h-5 text-amber-300 animate-spin flex-shrink-0" />
            ) : (
              <Zap className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform flex-shrink-0" />
            )}
            <div>
              <span>
                {autonomousLoading
                  ? '⏳ AI Dispatching to Ward Engineer... (Please wait)'
                  : '⚡ File Autonomously with AI (1-Click Instant Dispatch)'}
              </span>
              <span className="block text-[10px] font-normal text-amber-200">
                {autonomousLoading
                  ? 'Resolving jurisdiction, binding statutory SLA countdown & generating ticket...'
                  : 'AI auto-routes jurisdiction, sets statutory SLA timer & dispatches to Ward Engineer immediately'}
              </span>
            </div>
          </div>
          {!autonomousLoading && (
            <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
          )}
        </button>

        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-gray-500 font-medium">Prefer to review each step yourself?</span>
          <button
            type="button"
            onClick={onProceedManual}
            className="text-navy hover:text-saffron font-black underline flex items-center space-x-1"
          >
            <span>Proceed Manually (Step-by-Step) →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
