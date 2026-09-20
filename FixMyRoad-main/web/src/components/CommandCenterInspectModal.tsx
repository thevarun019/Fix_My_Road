import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../lib/api';
import {
  X, AlertOctagon, Flame, ShieldAlert, MapPin, Clock, CheckCircle,
  Wrench, ExternalLink, RefreshCw, Send, ArrowRightLeft, FileText, CheckCircle2, Building2
} from 'lucide-react';
import L from 'leaflet';
import { InterDeptCoordinationModal } from './InterDeptCoordinationModal';

interface CommandCenterInspectModalProps {
  complaint: any;
  onClose: () => void;
  onUpdated?: () => void;
}

export const CommandCenterInspectModal: React.FC<CommandCenterInspectModalProps> = ({
  complaint,
  onClose,
  onUpdated
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [currentComplaint, setCurrentComplaint] = useState<any>(complaint);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [interDeptOpen, setInterDeptOpen] = useState(false);

  // Action forms state
  const [showCauseOpen, setShowCauseOpen] = useState(false);
  const [showCauseReason, setShowCauseReason] = useState(
    'Failure to resolve public road hazard within statutory SLA turnaround window. Explanation required within 24 hours under Civic Grievance Act.'
  );

  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedAuthorityCode, setSelectedAuthorityCode] = useState('PWD-DELHI');

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveRemarks, setResolveRemarks] = useState('Executive resolution signed off by Central Command Center following physical site verification.');

  // Live countdown / overdue calculation
  const deadline = new Date(currentComplaint.slaDeadline).getTime();
  const now = Date.now();
  const isOverdue = now > deadline && currentComplaint.status !== 'RESOLVED' && currentComplaint.status !== 'VERIFIED';
  const overdueHours = Math.abs(Math.round((now - deadline) / 3600000));

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !currentComplaint?.latitude || !currentComplaint?.longitude) return;

    const lat = currentComplaint.latitude;
    const lng = currentComplaint.longitude;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const redPin = L.divIcon({
      className: 'command-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(220, 38, 38, 0.4); border-radius: 50%; animation: ping 1.5s infinite;"></div>
          <div style="background: #991B1B; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.4); border: 2px solid white;">
            <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    L.marker([lat, lng], { icon: redPin }).addTo(map);
    mapInstanceRef.current = map;

    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [currentComplaint]);

  // Action 1: Issue Show-Cause Notice
  const handleIssueShowCause = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const res = await apiRequest(`/complaints/${currentComplaint.id}/show-cause`, {
        method: 'POST',
        body: JSON.stringify({ reason: showCauseReason })
      });
      if (res.data) setCurrentComplaint(res.data);
      setSuccessMsg(`Statutory Show-Cause Notice issued to ${currentComplaint.authority?.name || 'Local Authority'}! Logged to legal audit trail.`);
      setShowCauseOpen(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to issue notice');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 2: Reassign Authority
  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const res = await apiRequest(`/complaints/${currentComplaint.id}/reassign`, {
        method: 'PATCH',
        body: JSON.stringify({ authorityCode: selectedAuthorityCode })
      });
      if (res.data) setCurrentComplaint(res.data);
      setSuccessMsg(`Custody successfully reassigned to ${selectedAuthorityCode}! Executive transfer complete.`);
      setReassignOpen(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to reassign authority');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 3: Command Center Executive Sign-off / Resolve
  const handleExecutiveResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const res = await apiRequest(`/complaints/${currentComplaint.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'RESOLVED',
          resolutionRemarks: resolveRemarks,
          actorName: 'National Command Controller',
          actorType: 'COMMAND_CENTER'
        })
      });
      if (res.data) setCurrentComplaint(res.data);
      setSuccessMsg('Grievance marked as RESOLVED by Central Command Center Executive Authority.');
      setResolveOpen(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 4: Print/Export Dossier
  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-red-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                Apex Command Center Inspection
              </span>
              <span className="text-red-200 text-xs font-mono font-bold">
                {currentComplaint.complaintCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>{currentComplaint.category?.replace('_', ' ')}</span>
              <span className="text-red-400 font-normal">·</span>
              <span className="text-red-300 text-lg">Tier-2 Escalation</span>
            </h2>
            <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>{currentComplaint.address}</span>
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

        {/* Notification Banner */}
        {successMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold p-3 px-6 flex items-center space-x-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-gray-800">
          {/* Escalation & Breach Status Alert */}
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-3 bg-red-600 text-white rounded-2xl shadow-sm">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-800 block">
                  Jurisdiction Custody Transferred to Command Center
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-red-700">
                  {isOverdue ? `Overdue by ${overdueHours} Hours` : 'Statutory SLA Default Alert'}
                </div>
                <p className="text-xs text-red-900 mt-1 font-medium">
                  Responsible Local Authority: <strong>{currentComplaint.authority?.name || 'Local Ward'}</strong> failed to resolve within statutory deadline of {new Date(currentComplaint.slaDeadline).toLocaleString('en-IN')}.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-gray-500">Escalation Tier</span>
              <span className="text-xs font-black bg-red-600 text-white px-3 py-1 rounded-full text-center">
                Level {currentComplaint.escalationLevel || 1} (Executive)
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Severity Level</span>
              <span className="text-xs font-extrabold text-red-600">{currentComplaint.severity}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Road Classification</span>
              <span className="text-xs font-extrabold text-navy">{currentComplaint.roadCategory?.replace('_', ' ') || 'ARTERIAL'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Assigned Officer</span>
              <span className="text-xs font-extrabold text-navy truncate block">{currentComplaint.assignedOfficerName || 'Ward Field Engineer'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Priority Score</span>
              <span className="text-xs font-extrabold text-saffron">{currentComplaint.priorityScore || 80}/100</span>
            </div>
          </div>

          {/* Photo Evidence Section */}
          <div>
            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-2.5">
              Photographic Evidence & Site Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Citizen Photo */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 space-y-2">
                <span className="text-[11px] font-bold text-navy block">Citizen Defect Photo</span>
                <div className="h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 relative group">
                  <img src={currentComplaint.photoUrl} alt="Defect" className="w-full h-full object-cover" />
                  <a
                    href={currentComplaint.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                  >
                    View Original
                  </a>
                </div>
                <span className="text-[10px] text-gray-500 block">Reported at filing</span>
              </div>

              {/* In Progress Photo */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 space-y-2">
                <span className="text-[11px] font-bold text-navy block">Work in Progress</span>
                <div className="h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center">
                  {currentComplaint.inProgressPhotoUrl ? (
                    <img src={currentComplaint.inProgressPhotoUrl} alt="In-progress" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold text-center p-2">
                      No on-site repair photo submitted by local authority
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 block">
                  {currentComplaint.inProgressPhotoUrl ? 'Active repair recorded' : 'Default: No work started'}
                </span>
              </div>

              {/* Resolved Photo */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50 space-y-2">
                <span className="text-[11px] font-bold text-navy block">Completion Proof</span>
                <div className="h-36 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center">
                  {currentComplaint.resolutionPhotoUrl ? (
                    <img src={currentComplaint.resolutionPhotoUrl} alt="Resolved" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold text-center p-2">
                      Pending resolution sign-off
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 block">
                  {currentComplaint.resolutionPhotoUrl ? 'Repaired surface' : 'Pending work'}
                </span>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Exact Defect GIS Coordinate</span>
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${currentComplaint.latitude},${currentComplaint.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-navy hover:text-saffron font-bold flex items-center gap-1 underline"
              >
                <span>Navigate via Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="h-44 rounded-xl overflow-hidden border border-gray-300 relative shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute bottom-2 left-2 z-10 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                {currentComplaint.latitude?.toFixed(5)}° N, {currentComplaint.longitude?.toFixed(5)}° E
              </div>
            </div>
          </div>

          {/* Command Center Action Forms (Interactive Panels) */}
          {showCauseOpen && (
            <form onSubmit={handleIssueShowCause} className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-amber-700" />
                  <span>Issue Statutory Show-Cause Notice to {currentComplaint.authority?.name || 'Local Authority'}</span>
                </h4>
                <button type="button" onClick={() => setShowCauseOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={3}
                value={showCauseReason}
                onChange={e => setShowCauseReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-amber-300 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCauseOpen(false)} className="py-2 px-3 text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow">
                  {actionLoading ? 'Issuing Notice...' : 'Confirm & Issue Notice'}
                </button>
              </div>
            </form>
          )}

          {reassignOpen && (
            <form onSubmit={handleReassign} className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-blue-700" />
                  <span>Reassign Authority Custody (Executive Transfer)</span>
                </h4>
                <button type="button" onClick={() => setReassignOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <select
                value={selectedAuthorityCode}
                onChange={e => setSelectedAuthorityCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-blue-300 text-xs font-bold text-navy bg-white"
              >
                <option value="PWD-DELHI">Public Works Department (PWD Delhi)</option>
                <option value="MCD">Municipal Corporation of Delhi (MCD)</option>
                <option value="NDMC">New Delhi Municipal Council (NDMC)</option>
                <option value="NHAI-RO-DEL">National Highways Authority of India (NHAI)</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setReassignOpen(false)} className="py-2 px-3 text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="py-2 px-4 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow">
                  {actionLoading ? 'Transferring...' : 'Confirm Executive Transfer'}
                </button>
              </div>
            </form>
          )}

          {resolveOpen && (
            <form onSubmit={handleExecutiveResolve} className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Executive Sign-Off &amp; Close Grievance</span>
                </h4>
                <button type="button" onClick={() => setResolveOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={resolveRemarks}
                onChange={e => setResolveRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-emerald-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setResolveOpen(false)} className="py-2 px-3 text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow">
                  {actionLoading ? 'Signing off...' : 'Sign Off Resolution'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Command Center Action Footer: Every button has a role! */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintDossier}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-navy" />
              <span>Print Case Brief</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl font-bold text-xs border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInterDeptOpen(true);
                setShowCauseOpen(false);
                setReassignOpen(false);
                setResolveOpen(false);
              }}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-700" />
              <span>Inter-Dept Notice (समन्वय)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCauseOpen(!showCauseOpen);
                setReassignOpen(false);
                setResolveOpen(false);
              }}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Show-Cause</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setReassignOpen(!reassignOpen);
                setShowCauseOpen(false);
                setResolveOpen(false);
              }}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Reassign Authority</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setResolveOpen(!resolveOpen);
                setShowCauseOpen(false);
                setReassignOpen(false);
              }}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-govgreen hover:bg-govgreen-dark text-white flex items-center space-x-1.5 transition-all shadow-md"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Executive Sign-Off</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inter-Departmental Digging Restoration Notice Modal */}
      {interDeptOpen && (
        <InterDeptCoordinationModal
          complaint={currentComplaint}
          onClose={() => setInterDeptOpen(false)}
        />
      )}
    </div>
  );
};
