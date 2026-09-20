import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, AlertTriangle, CheckCircle2, Wrench,
  ClipboardList, Flame, RefreshCw, MapPin, Eye, Camera, PauseCircle, UploadCloud, HardHat
} from 'lucide-react';
import { OfficerInspectModal } from '../../components/OfficerInspectModal';
import { WorkOrderModal } from '../../components/WorkOrderModal';

const StatusBadge: React.FC<{ status: string; slaPaused?: boolean }> = ({ status, slaPaused }) => {
  if (slaPaused && status === 'IN_PROGRESS') {
    return (
      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1 shadow-xs">
        <PauseCircle className="w-3 h-3 text-amber-600" />
        <span>SLA PAUSED (IN PROGRESS)</span>
      </span>
    );
  }

  const map: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-gray-100 text-gray-600 border-gray-200',
    VERIFIED: 'bg-teal-100 text-teal-800 border-teal-200',
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const AuthorityDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [subFilter, setSubFilter] = useState<'ALL' | 'IN_PROGRESS' | 'OVERDUE'>('ALL');

  // Inspection Dossier Modal State
  const [inspectComplaint, setInspectComplaint] = useState<any | null>(null);

  // PWD Work Order Modal State
  const [workOrderComplaint, setWorkOrderComplaint] = useState<any | null>(null);

  // Update Status Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  const [inProgressPhoto, setInProgressPhoto] = useState('');
  const [updating, setUpdating] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const fetchComplaints = (showLoading = true) => {
    if (showLoading) setLoading(true);
    apiRequest('/complaints?limit=50')
      .then(res => { if (res.items) setComplaints(res.items); })
      .catch(console.error)
      .finally(() => { if (showLoading) setLoading(false); });
  };

  useEffect(() => { 
    fetchComplaints(); 
    const interval = setInterval(() => fetchComplaints(false), 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Photo File Upload with FileReader conversion
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'inProgress' | 'resolution') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size exceeds 8MB. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (target === 'inProgress') {
        setInProgressPhoto(dataUrl);
      } else {
        setResolutionPhoto(dataUrl);
      }
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    // Enforce mandatory photos per user requirement:
    // 1. Updating to IN_PROGRESS requires photo showing work is in progress (which pauses countdown)
    if (newStatus === 'IN_PROGRESS' && !inProgressPhoto.trim()) {
      setPhotoError('Mandatory: You must upload a photo showing work is in progress (barricading, workers on site, asphalt milling) to pause the SLA countdown.');
      return;
    }

    // 2. Updating to RESOLVED requires photo showing work is completed
    if (newStatus === 'RESOLVED' && !resolutionPhoto.trim()) {
      setPhotoError('Mandatory: You must upload a photo showing completed repair work (compacted asphalt, finished surface) to finalize resolution.');
      return;
    }

    setUpdating(true);
    setPhotoError(null);
    try {
      await apiRequest(`/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          inProgressPhotoUrl: inProgressPhoto || undefined,
          resolutionPhotoUrl: resolutionPhoto || undefined,
          resolutionRemarks
        })
      });
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulateEscalate = async (complaintId: string, code: string) => {
    if (!confirm(`Simulate SLA Timeout for ${code}?\n\nThis will trigger the escalation engine, transferring jurisdiction to the Central Command Center.`)) return;
    try {
      await apiRequest(`/complaints/${complaintId}/escalate`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Simulated Local Authority SLA timeout - Escalated to Central Command Center' })
      });
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger escalation');
    }
  };

  const openUpdateModal = (item: any) => {
    setSelectedComplaint(item);
    setNewStatus(item.status === 'SUBMITTED' ? 'IN_PROGRESS' : 'RESOLVED');
    setResolutionRemarks(item.resolutionRemarks || '');
    setResolutionPhoto(item.resolutionPhotoUrl || '');
    setInProgressPhoto(item.inProgressPhotoUrl || '');
    setPhotoError(null);
  };

  const activeComplaints = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'VERIFIED');
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'VERIFIED');
  
  const filteredActive = activeComplaints.filter(c => {
    if (subFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
    if (subFilter === 'OVERDUE') return !c.slaPaused && new Date(c.slaDeadline).getTime() < Date.now();
    return true;
  });

  const displayedComplaints = activeTab === 'ACTIVE' ? filteredActive : resolvedComplaints;

  const totalAssigned = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const overdueCount = activeComplaints.filter(c => !c.slaPaused && new Date(c.slaDeadline).getTime() < Date.now()).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Officer Header Banner */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-govgreen font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Field Engineer Portal · Statutory SLA Enforced</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Municipal Ward Action Command
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Review citizen road grievances, upload photographic work proofs to pause SLA countdowns, and execute repairs under legal compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/officer/map"
            className="bg-saffron hover:bg-saffron-dark text-navy font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open GIS Map</span>
          </Link>
          <button
            onClick={() => fetchComplaints(true)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* SLA Metric Cards - Interactive Filter Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => { setActiveTab('ACTIVE'); setSubFilter('ALL'); }}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === 'ACTIVE' && subFilter === 'ALL'
              ? 'bg-navy/5 border-navy ring-2 ring-navy/20'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Assigned Works</span>
          <span className="text-2xl font-black text-navy mt-1 block">{totalAssigned}</span>
          <span className="text-[11px] text-gray-500 font-medium">Click to view all active</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('ACTIVE'); setSubFilter('IN_PROGRESS'); }}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === 'ACTIVE' && subFilter === 'IN_PROGRESS'
              ? 'bg-amber-100/60 border-amber-500 ring-2 ring-amber-400/30'
              : 'bg-white border-gray-200 hover:border-amber-300'
          }`}
        >
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Work In Progress</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{inProgressCount}</span>
          <span className="text-[11px] text-amber-800 font-medium">⏸️ Click to filter paused</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('ACTIVE'); setSubFilter('OVERDUE'); }}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === 'ACTIVE' && subFilter === 'OVERDUE'
              ? 'bg-red-100/60 border-red-500 ring-2 ring-red-400/30'
              : 'bg-white border-gray-200 hover:border-red-300'
          }`}
        >
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">SLA Overdue</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{overdueCount}</span>
          <span className="text-[11px] text-red-600 font-medium">⚠️ Click to filter breaches</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('RESOLVED'); setSubFilter('ALL'); }}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === 'RESOLVED'
              ? 'bg-emerald-50 border-govgreen ring-2 ring-govgreen/20'
              : 'bg-white border-gray-200 hover:border-govgreen/50'
          }`}
        >
          <span className="text-xs font-bold text-govgreen uppercase tracking-wider block">Resolved Works</span>
          <span className="text-2xl font-black text-govgreen mt-1 block">{resolvedComplaints.length}</span>
          <span className="text-[11px] text-govgreen font-medium">✓ Click to view completed</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 text-sm font-extrabold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'ACTIVE'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-navy'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Works ({activeComplaints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`pb-3 text-sm font-extrabold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'RESOLVED'
              ? 'border-govgreen text-govgreen'
              : 'border-transparent text-gray-500 hover:text-govgreen'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Resolved Works ({resolvedComplaints.length})</span>
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <RefreshCw className="w-8 h-8 text-saffron animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold">Synchronizing Municipal Complaint Records...</p>
          </div>
        ) : displayedComplaints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
            <CheckCircle2 className="w-12 h-12 text-govgreen mx-auto mb-3" />
            <h3 className="font-extrabold text-navy">No {activeTab.toLowerCase()} grievances</h3>
            <p className="text-xs text-gray-500 mt-1">All road defects in this category are fully updated.</p>
          </div>
        ) : (
          displayedComplaints.map(item => {
            const isOverdue = !item.slaPaused && new Date(item.slaDeadline).getTime() < Date.now();
            const isPaused = Boolean(item.slaPaused);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs hover:shadow-md ${
                  isPaused
                    ? 'border-amber-300 bg-amber-50/20'
                    : isOverdue && activeTab === 'ACTIVE'
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-inner">
                    <img
                      src={item.photoUrl}
                      alt="Hazard"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-navy">{item.complaintCode}</span>
                      <StatusBadge status={item.status} slaPaused={item.slaPaused} />
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        item.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-navy">{item.category?.replace('_', ' ')} · {item.roadCategory?.replace('_', ' ')}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{item.address}</span>
                    </p>

                    <div className="text-[11px] pt-1">
                      {isPaused ? (
                        <span className="text-amber-800 font-extrabold flex items-center gap-1">
                          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>SLA Timer Paused — Active Repair Underway</span>
                        </span>
                      ) : activeTab === 'ACTIVE' ? (
                        isOverdue ? (
                          <span className="text-red-600 font-black">
                            ⚠️ SLA Breached (Deadline was {new Date(item.slaDeadline).toLocaleString('en-IN')})
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">
                            SLA Deadline: <strong className="text-navy">{new Date(item.slaDeadline).toLocaleString('en-IN')}</strong> ({item.slaHours}h allotted)
                          </span>
                        )
                      ) : (
                        <span className="text-govgreen font-extrabold">
                          ✓ Resolved & verified with photo proof
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {!isOverdue && activeTab === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleSimulateEscalate(item.id, item.complaintCode)}
                      title="Test: Simulate SLA breach to escalate this complaint to the Command Center"
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-[11px] font-bold py-2 px-3 rounded-xl transition-all flex items-center space-x-1"
                    >
                      <Flame className="w-3 h-3 text-red-600" />
                      <span>Simulate Timeout</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setWorkOrderComplaint(item)}
                    title="Generate Official PWD Form 11 Spot Repair Work Order"
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center space-x-1 shadow-xs cursor-pointer"
                  >
                    <HardHat className="w-3.5 h-3.5 text-amber-700" />
                    <span>Work Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openUpdateModal(item)}
                    className="bg-navy hover:bg-navy-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Update Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectComplaint(item)}
                    className="bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs py-2.5 px-3.5 rounded-xl transition-colors flex items-center space-x-1.5 border border-gray-200 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-navy" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Officer Inspection Dossier Modal */}
      {inspectComplaint && (
        <OfficerInspectModal
          complaint={inspectComplaint}
          onClose={() => setInspectComplaint(null)}
          onOpenUpdate={(c) => openUpdateModal(c)}
        />
      )}

      {/* PWD Spot Repair Work Order Modal */}
      {workOrderComplaint && (
        <WorkOrderModal
          complaint={workOrderComplaint}
          onClose={() => setWorkOrderComplaint(null)}
        />
      )}

      {/* Update Status & Upload Proof Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Official Status & Proof Update</span>
              <h3 className="text-lg font-black text-navy">{selectedComplaint.complaintCode}</h3>
              <p className="text-xs text-gray-500">{selectedComplaint.category} · {selectedComplaint.address}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Select Action Status
                </label>
                <select
                  value={newStatus}
                  onChange={e => {
                    setNewStatus(e.target.value);
                    setPhotoError(null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-bold text-navy focus:ring-2 focus:ring-govgreen bg-white"
                >
                  <option value="IN_PROGRESS">🚧 Work In Progress (Pauses SLA Countdown)</option>
                  <option value="RESOLVED">✅ Work Completed (Stops SLA & Resolves)</option>
                  <option value="REJECTED">❌ Duplicate / Not Actionable</option>
                </select>
              </div>

              {/* Status 1: IN_PROGRESS -> Mandatory In-Progress Work Proof */}
              {newStatus === 'IN_PROGRESS' && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <PauseCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                        Mandatory: Work In Progress Photo Proof
                      </h4>
                      <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                        Uploading this photo confirms active field repair (barricading, workers on site, asphalt milling). <strong>The SLA countdown timer will be temporarily paused</strong> while work is underway.
                      </p>
                    </div>
                  </div>

                  {inProgressPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-amber-400 h-36 bg-black/10 flex items-center justify-center">
                      <img src={inProgressPhoto} alt="In-progress proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setInProgressPhoto('')}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-lg text-xs"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-3 px-4 rounded-xl border-2 border-dashed border-amber-400 bg-white hover:bg-amber-100/50 flex flex-col items-center justify-center space-y-1 transition-colors">
                        <Camera className="w-6 h-6 text-amber-700" />
                        <span className="text-xs font-bold text-amber-900">Take Photo or Upload from Device</span>
                        <span className="text-[10px] text-gray-500">JPG, PNG up to 8MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, 'inProgress')}
                        />
                      </label>
                      <input
                        type="text"
                        value={inProgressPhoto}
                        onChange={e => setInProgressPhoto(e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full p-2 rounded-xl border border-gray-300 text-xs font-mono bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Status 2: RESOLVED -> Mandatory Work Completion Proof */}
              {newStatus === 'RESOLVED' && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                        Mandatory: Work Completion Photo Proof
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-tight mt-0.5">
                        Uploading the photo of the completed repair (compacted asphalt, restored road) permanently completes statutory SLA obligations and requests citizen satisfaction rating.
                      </p>
                    </div>
                  </div>

                  {resolutionPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-400 h-36 bg-black/10 flex items-center justify-center">
                      <img src={resolutionPhoto} alt="Resolution proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setResolutionPhoto('')}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-lg text-xs"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-400 bg-white hover:bg-emerald-100/50 flex flex-col items-center justify-center space-y-1 transition-colors">
                        <Camera className="w-6 h-6 text-emerald-700" />
                        <span className="text-xs font-bold text-emerald-900">Take Photo or Upload Completed Repair Proof</span>
                        <span className="text-[10px] text-gray-500">Compacted asphalt / finished road</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, 'resolution')}
                        />
                      </label>
                      <input
                        type="text"
                        value={resolutionPhoto}
                        onChange={e => setResolutionPhoto(e.target.value)}
                        placeholder="Or paste completed repair image URL (https://...)"
                        className="w-full p-2 rounded-xl border border-gray-300 text-xs font-mono bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {photoError && (
                <div className="bg-red-50 border border-red-300 text-red-800 text-xs p-3 rounded-xl flex items-start space-x-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{photoError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Engineering Remarks / Contractor Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionRemarks}
                  onChange={e => setResolutionRemarks(e.target.value)}
                  placeholder={
                    newStatus === 'IN_PROGRESS'
                      ? 'e.g. Field contractor dispatched, lane barricaded, bitumen scraping commenced.'
                      : newStatus === 'RESOLVED'
                      ? 'e.g. Hot-mix asphalt compaction completed with 60/70 grade bitumen, leveling verified.'
                      : 'State reason for action...'
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-govgreen"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="py-2.5 px-5 rounded-xl font-bold text-xs border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs bg-govgreen hover:bg-govgreen-dark text-white shadow transition-colors disabled:opacity-50"
                >
                  {updating ? 'Recording...' : 'Commit Status & Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
