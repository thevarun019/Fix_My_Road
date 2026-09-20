import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { SlaCountdown } from '../../components/SlaCountdown';
import { Timeline } from '../../components/Timeline';
import { LoadingGovt } from '../../components/LoadingGovt';
import {
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Phone,
  FileDown,
  Star,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Scale
} from 'lucide-react';
import { GoogleDetailMap } from '../../components/GoogleDetailMap';
import { GrievanceReceiptModal } from '../../components/GrievanceReceiptModal';
import { CitizenCharterModal } from '../../components/CitizenCharterModal';

export const ComplaintDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states for official GOI receipt and Citizen Charter
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCharter, setShowCharter] = useState(false);

  // Citizen verification form state
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);

    apiRequest(`/complaints/track/${encodeURIComponent(code)}`)
      .then((res) => {
        setComplaint(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Complaint not found in national registry');
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleCitizenFeedback = async (verified: boolean) => {
    if (!complaint) return;
    setVerifying(true);
    try {
      await apiRequest(`/complaints/${complaint.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          feedback,
          verified
        })
      });
      setVerifySuccess(true);
      // Reload fresh state
      const refreshed = await apiRequest(`/complaints/track/${encodeURIComponent(code!)}`);
      setComplaint(refreshed.data);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadRti = () => {
    if (!complaint) return;
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
    try {
      window.open(`${API_BASE}/audit/rti-export/${encodeURIComponent(complaint.complaintCode)}`, '_blank');
    } catch {
      // Fallback: download client dossier
      const blob = new Blob([JSON.stringify(complaint, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RTI-Dossier-${complaint.complaintCode}.json`;
      a.click();
    }
  };

  if (loading) return <LoadingGovt message="Fetching Official Grievance & SLA Records..." />;

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-navy">Complaint Record Not Found</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          No record matched reference number <span className="font-mono font-bold text-gray-900">{code}</span>. Please verify the number or submit a new grievance.
        </p>
        <div className="pt-4">
          <Link
            to="/track"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-navy bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Search Another ID</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/track"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-navy"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tracking Search</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking Reference:</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-navy">{complaint.complaintCode}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Lodged on {new Date(complaint.createdAt).toLocaleString('en-IN')}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCharter(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-navy bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>Citizen Charter</span>
            </button>
            <button
              type="button"
              onClick={() => setShowReceipt(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-navy hover:bg-navy-dark px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-saffron" />
              <span>Receipt (पावती)</span>
            </button>
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* SLA Live Timer Banner */}
        <SlaCountdown deadline={complaint.slaDeadline} status={complaint.status} />

        {/* 2-Tier Hierarchical Custody Banner */}
        {complaint.status !== 'RESOLVED' && complaint.status !== 'VERIFIED' && (
          <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            complaint.custodyTier === 'COMMAND_CENTER' || complaint.isBreached || complaint.escalationLevel > 0
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className={`w-4 h-4 ${
                  complaint.custodyTier === 'COMMAND_CENTER' || complaint.isBreached || complaint.escalationLevel > 0
                    ? 'text-red-600'
                    : 'text-emerald-700'
                }`} />
                <span className="font-extrabold uppercase tracking-wide">
                  {complaint.custodyTier === 'COMMAND_CENTER' || complaint.isBreached || complaint.escalationLevel > 0
                    ? 'Current Custody: Central Command Center (Ministry Oversight)'
                    : 'Current Custody: Local Authority Field Control'}
                </span>
              </div>
              <p className="font-medium text-[11px] opacity-90">
                {complaint.custodyTier === 'COMMAND_CENTER' || complaint.isBreached || complaint.escalationLevel > 0
                  ? 'Local Authority resolution window elapsed. This case is now under direct Command Center & Chief Engineer intervention.'
                  : `Currently being addressed by the assigned Local Authority (${complaint.authority?.name || 'Local Division'}). Command Center will intervene only if resolution deadline passes.`}
              </p>
            </div>

            {!(complaint.custodyTier === 'COMMAND_CENTER' || complaint.isBreached || complaint.escalationLevel > 0) && (
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Simulate SLA Timeout?\nThis will trigger immediate escalation to the Central Command Center.')) return;
                  try {
                    await apiRequest(`/complaints/${complaint.id}/escalate`, {
                      method: 'POST',
                      body: JSON.stringify({ reason: 'Simulated Local Authority SLA timeout' })
                    });
                    const refreshed = await apiRequest(`/complaints/track/${encodeURIComponent(code!)}`);
                    setComplaint(refreshed.data);
                  } catch (e: any) {
                    alert(e.message || 'Escalation failed');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold py-2 px-3 rounded-xl shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
              >
                ⚡ Simulate Timeout (Escalate to HQ)
              </button>
            )}
          </div>
        )}

        {/* Administrative Assignment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-navy">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Responsible Jurisdiction</span>
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {complaint.authority?.name || 'Municipal Works Department'}
            </p>
            <p className="text-gray-600">
              {complaint.jurisdiction?.name || 'Central Municipal Zone'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-navy">
              <User className="w-4 h-4 text-purple-600" />
              <span>Designated Officer</span>
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {complaint.assignedOfficerName || 'Ward Junior Engineer (Civil)'}
            </p>
            {complaint.assignedOfficerPhone && (
              <p className="text-gray-600 flex items-center space-x-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>Contact: {complaint.assignedOfficerPhone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Incident Details & Photos Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            Damage Evidence & Resolution Record
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Before Photo */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-1">
                1. Citizen Hazard Report
              </span>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 h-52">
                <img
                  src={complaint.blurredPhotoUrl || complaint.photoUrl}
                  alt="Reported road damage"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* In-Progress Photo */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-1">
                2. Work In Progress On-Site
              </span>
              {complaint.inProgressPhotoUrl ? (
                <div className="rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm bg-gray-100 h-52 relative">
                  <img
                    src={complaint.inProgressPhotoUrl}
                    alt="Work in progress"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                    Active Repair Proof
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center p-4 text-center text-gray-400 bg-gray-50/50">
                  <Clock className="w-7 h-7 mb-1.5 text-gray-300" />
                  <span className="text-xs font-bold text-gray-500">
                    {complaint.status === 'SUBMITTED' ? 'Site Mobilization Pending' : 'Site Proof Processing'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Field engineer uploads photo upon arrival
                  </span>
                </div>
              )}
            </div>

            {/* After Photo (if resolved) */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-1">
                3. Repair Completion Proof
              </span>
              {complaint.resolutionPhotoUrl ? (
                <div className="rounded-2xl overflow-hidden border-2 border-govgreen shadow-sm bg-gray-100 h-52 relative">
                  <img
                    src={complaint.resolutionPhotoUrl}
                    alt="Resolved road work"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-govgreen text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                    Repair Verified
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center p-4 text-center text-gray-400 bg-gray-50/50">
                  <Clock className="w-7 h-7 mb-1.5 text-gray-300" />
                  <span className="text-xs font-bold text-gray-500">Completion Proof Pending</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Uploaded after compaction & surface finishing
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Google Map of Grievance Location */}
          {complaint.latitude && complaint.longitude && (
            <GoogleDetailMap
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              address={complaint.address}
              complaintCode={complaint.complaintCode}
            />
          )}

          <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 text-xs text-gray-700">
            <div>
              <strong className="text-gray-900">Hazard Type: </strong>
              <span>{complaint.category} (Severity: {complaint.severity})</span>
            </div>
            <div>
              <strong className="text-gray-900">Road Class: </strong>
              <span>{complaint.roadCategory?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-start space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{complaint.address} ({complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)})</span>
            </div>
            {complaint.description && (
              <div className="pt-1 italic">
                "{complaint.description}"
              </div>
            )}
            {complaint.resolutionRemarks && (
              <div className="pt-1.5 border-t border-gray-200 text-govgreen-dark font-medium">
                <strong>Officer Remarks: </strong> {complaint.resolutionRemarks}
              </div>
            )}
          </div>
        </div>

        {/* Citizen Verification Section (if resolved) */}
        {complaint.status === 'RESOLVED' && !complaint.citizenVerified && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-saffron rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-saffron fill-saffron" />
              <h3 className="text-base font-black text-navy">
                Citizen Verification: Rate the Work Completed
              </h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              The road department has declared this work complete. Please inspect the road and submit your confirmation.
            </p>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-gray-700">Rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave feedback on repair quality, smoothness, or remaining loose stones..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron"
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCitizenFeedback(true)}
                disabled={verifying}
                className="flex-1 bg-govgreen hover:bg-govgreen-dark text-white font-bold text-xs py-3 px-4 rounded-xl shadow flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Work Verified & Close</span>
              </button>
              <button
                type="button"
                onClick={() => handleCitizenFeedback(false)}
                disabled={verifying}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Unsatisfied (Reopen Complaint)</span>
              </button>
            </div>
          </div>
        )}

        {/* Audit & Escalation Timeline */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Official Audit Trail & Hierarchy Escalations
          </h3>
          <Timeline logs={complaint.auditLogs || []} currentStatus={complaint.status} />
        </div>

        {/* First Appellate Authority Section (RTI & Grievances Act) */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-ashoka" />
            <h4 className="font-black text-navy uppercase text-[11px] tracking-wider">
              Designated First Appellate Authority (प्रथम अपीलीय अधिकारी)
            </h4>
          </div>
          <p className="text-gray-700 leading-relaxed font-medium">
            Under Section 19(1) of the Right to Information Act 2005 &amp; Central Grievance Redressal Rules, if you are unsatisfied with the field repair or if the statutory SLA of <strong>{complaint.slaHours || 48} hours</strong> is breached, you hold the legal right to prefer an appeal directly to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-gray-200 text-gray-800 font-semibold">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Appellate Nodal Authority:</span>
              <span className="text-navy font-bold">Superintending Engineer (Civil) · Circle Office</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Competent Jurisdiction:</span>
              <span>{complaint.authority?.name || 'Central Municipal Works Division'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-gray-600 font-bold border-t border-gray-200">
            <span>24x7 Citizen Helpline: <strong>1033 (NHAI)</strong> / <strong>1913 (MCD)</strong></span>
            <span>National Emergency: <strong>112</strong></span>
          </div>
        </div>

        {/* RTI Compliance Export Button */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            <strong>RTI Act 2005 Compliance:</strong> Complete chronological log signed by automated timestamp server.
          </div>
          <button
            type="button"
            onClick={handleDownloadRti}
            className="inline-flex items-center space-x-2 bg-navy hover:bg-navy-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download RTI Legal Dossier (JSON/Print)</span>
          </button>
        </div>
      </div>

      {/* Official Grievance Acknowledgement Modal (पावती) */}
      {showReceipt && (
        <GrievanceReceiptModal
          complaint={complaint}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Official Citizen Charter Modal (नागरिक अधिकार पत्र) */}
      {showCharter && (
        <CitizenCharterModal
          onClose={() => setShowCharter(false)}
        />
      )}
    </div>
  );
};
