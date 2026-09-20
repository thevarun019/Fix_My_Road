import React, { useEffect, useState, useRef } from 'react';
import {
  X, MapPin, Clock, AlertTriangle, ShieldCheck, CheckCircle2,
  Calendar, Wrench, Camera, ExternalLink, PauseCircle, PlayCircle, Eye, HardHat
} from 'lucide-react';
import L from 'leaflet';
import { WorkOrderModal } from './WorkOrderModal';

interface OfficerInspectModalProps {
  complaint: any;
  onClose: () => void;
  onOpenUpdate: (complaint: any) => void;
}

export const OfficerInspectModal: React.FC<OfficerInspectModalProps> = ({
  complaint,
  onClose,
  onOpenUpdate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Live countdown state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [showWorkOrder, setShowWorkOrder] = useState<boolean>(false);

  useEffect(() => {
    if (!complaint) return;

    const calculateTime = () => {
      // If paused, keep the frozen remaining time
      if (complaint.slaPaused && typeof complaint.slaRemainingSeconds === 'number') {
        setSecondsRemaining(complaint.slaRemainingSeconds);
        setIsOverdue(complaint.slaRemainingSeconds <= 0);
        return;
      }

      const deadline = new Date(complaint.slaDeadline).getTime();
      const now = Date.now();
      const diff = Math.floor((deadline - now) / 1000);

      if (diff <= 0) {
        setIsOverdue(true);
        setSecondsRemaining(Math.abs(diff));
      } else {
        setIsOverdue(false);
        setSecondsRemaining(diff);
      }
    };

    calculateTime();

    // If not paused, tick every second
    if (!complaint.slaPaused) {
      const interval = setInterval(calculateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [complaint]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !complaint?.latitude || !complaint?.longitude) return;

    const lat = complaint.latitude;
    const lng = complaint.longitude;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const customPin = L.divIcon({
      className: 'inspect-marker',
      html: `
        <div style="background: #DC2626; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.4); border: 2px solid white;">
          <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    L.marker([lat, lng], { icon: customPin }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [complaint]);

  const formatCountdown = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'VERIFIED';
  const isInProgress = complaint.status === 'IN_PROGRESS';
  const isPaused = Boolean(complaint.slaPaused);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy via-navy-dark to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-saffron text-navy text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                Officer Field Dossier
              </span>
              <span className="text-gray-300 text-xs font-mono">
                {complaint.complaintCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {complaint.category?.replace('_', ' ')} · {complaint.severity} Severity
            </h2>
            <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-saffron" />
              <span>{complaint.address}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-gray-800">
          {/* SLA Countdown Display Card */}
          <div className={`rounded-2xl p-4 sm:p-5 border-2 shadow-sm transition-all ${
            isResolved
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : isPaused
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : isOverdue
              ? 'bg-red-50 border-red-300 text-red-950 animate-pulse'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className={`p-3 rounded-2xl ${
                  isResolved
                    ? 'bg-emerald-600 text-white'
                    : isPaused
                    ? 'bg-amber-500 text-white'
                    : isOverdue
                    ? 'bg-red-600 text-white'
                    : 'bg-navy text-white'
                }`}>
                  {isResolved ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isPaused ? (
                    <PauseCircle className="w-6 h-6" />
                  ) : isOverdue ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6 animate-spin" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {isResolved
                        ? 'Grievance SLA Fulfilled'
                        : isPaused
                        ? 'SLA Countdown Temporarily Paused'
                        : isOverdue
                        ? '⚠️ Statutory SLA Deadline Breached'
                        : 'Active SLA Countdown Clock'}
                    </span>
                    {isPaused && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Work in Progress on Site
                      </span>
                    )}
                  </div>

                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight mt-0.5">
                    {isResolved ? (
                      <span className="text-emerald-700">Resolved & Closed</span>
                    ) : isPaused ? (
                      <span className="text-amber-800">
                        ⏸️ {formatCountdown(secondsRemaining)} Frozen
                      </span>
                    ) : isOverdue ? (
                      <span className="text-red-600">
                        +{formatCountdown(secondsRemaining)} Overdue
                      </span>
                    ) : (
                      <span className="text-navy">
                        {formatCountdown(secondsRemaining)} Left
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mt-1">
                    {isPaused
                      ? 'The statutory SLA countdown was paused when active field work was recorded. Timer resumes or finishes upon completion.'
                      : isResolved
                      ? `Work completed successfully on ${new Date(complaint.resolvedAt || Date.now()).toLocaleDateString('en-IN')}.`
                      : `Statutory Deadline: ${new Date(complaint.slaDeadline).toLocaleString('en-IN')} (${complaint.slaHours}h allotted).`}
                  </p>
                </div>
              </div>

              {/* Quick Action in Card */}
              {!isResolved && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpdate(complaint);
                  }}
                  className="bg-navy hover:bg-navy-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow flex items-center justify-center space-x-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Update Work Status</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Road Hierarchy</span>
              <span className="text-xs font-extrabold text-navy">{complaint.roadCategory?.replace('_', ' ') || 'ARTERIAL'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Authority / Ward</span>
              <span className="text-xs font-extrabold text-navy line-clamp-1">{complaint.authority?.name || 'Local PWD / MCD'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Priority Score</span>
              <span className="text-xs font-extrabold text-saffron">{complaint.priorityScore || 75} / 100</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Escalation Tier</span>
              <span className="text-xs font-extrabold text-emerald-700">
                Level {complaint.escalationLevel || 0} ({complaint.custodyTier?.replace('_', ' ') || 'LOCAL'})
              </span>
            </div>
          </div>

          {/* Photographic Evidence Breakdown (Citizen Reported, In-Progress, Work Done) */}
          <div>
            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-2.5 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-navy" />
              <span>Photographic Work Evidence & Timeline</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Citizen Hazard Photo */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-navy">1. Citizen Hazard Photo</span>
                  <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">Defect</span>
                </div>
                <div className="h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 relative group">
                  <img
                    src={complaint.photoUrl}
                    alt="Citizen Reported Hazard"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <a
                    href={complaint.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                  >
                    View Full Resolution
                  </a>
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1">Reported at filing</p>
              </div>

              {/* 2. Work In Progress Photo */}
              <div className={`border rounded-2xl p-3 space-y-2 ${
                complaint.inProgressPhotoUrl
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-dashed border-gray-300 bg-gray-50/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-navy">2. Work In Progress</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    complaint.inProgressPhotoUrl ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {complaint.inProgressPhotoUrl ? 'Recorded' : 'Pending'}
                  </span>
                </div>
                <div className="h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 relative group flex items-center justify-center">
                  {complaint.inProgressPhotoUrl ? (
                    <>
                      <img
                        src={complaint.inProgressPhotoUrl}
                        alt="Work in progress"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <a
                        href={complaint.inProgressPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                      >
                        View Full Resolution
                      </a>
                    </>
                  ) : (
                    <div className="text-center p-3 text-gray-400">
                      <Wrench className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-semibold block">No work photo attached</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1">
                  {complaint.inProgressPhotoUrl ? 'Contractor / repair on site' : 'Upload when initiating work'}
                </p>
              </div>

              {/* 3. Resolution Proof Photo */}
              <div className={`border rounded-2xl p-3 space-y-2 ${
                complaint.resolutionPhotoUrl
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-dashed border-gray-300 bg-gray-50/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-navy">3. Completed Repair Proof</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    complaint.resolutionPhotoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {complaint.resolutionPhotoUrl ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 relative group flex items-center justify-center">
                  {complaint.resolutionPhotoUrl ? (
                    <>
                      <img
                        src={complaint.resolutionPhotoUrl}
                        alt="Resolution proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <a
                        href={complaint.resolutionPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                      >
                        View Full Resolution
                      </a>
                    </>
                  ) : (
                    <div className="text-center p-3 text-gray-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-semibold block">Compaction proof required</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1">
                  {complaint.resolutionRemarks || 'Required to finalize grievance'}
                </p>
              </div>
            </div>
          </div>

          {/* Location & GIS Map Section */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Geotagged Road Coordinate</span>
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${complaint.latitude},${complaint.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-navy hover:text-saffron font-bold flex items-center gap-1 underline"
              >
                <span>Open Navigation in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="h-44 rounded-xl overflow-hidden border border-gray-300 relative shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute bottom-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                {complaint.latitude?.toFixed(5)}° N, {complaint.longitude?.toFixed(5)}° E
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl font-bold text-xs border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close Dossier
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowWorkOrder(true)}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <HardHat className="w-4 h-4 text-amber-700" />
              <span>Generate Work Order (कार्य आदेश)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpdate(complaint);
              }}
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-navy hover:bg-navy-dark text-white shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Update Status &amp; Upload Proof</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWD Spot Repair Work Order Modal */}
      {showWorkOrder && (
        <WorkOrderModal
          complaint={complaint}
          onClose={() => setShowWorkOrder(false)}
        />
      )}
    </div>
  );
};
