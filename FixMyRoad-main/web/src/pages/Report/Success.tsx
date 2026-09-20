import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, ExternalLink, ArrowRight, Share2, ShieldCheck, Printer } from 'lucide-react';
import { GrievanceReceiptModal } from '../../components/GrievanceReceiptModal';

interface SuccessProps {
  complaint: any;
  onReset: () => void;
}

export const Success: React.FC<SuccessProps> = ({ complaint, onReset }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(complaint.complaintCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="text-center py-6 sm:py-10 space-y-6 max-w-xl mx-auto">
      <div className="w-20 h-20 bg-green-100 border-4 border-green-300 rounded-full flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-12 h-12 text-govgreen animate-bounce" />
      </div>

      <div>
        <span className="text-xs font-bold text-govgreen uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-200">
          Official Grievance Registered · पावती उपलब्ध
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-navy mt-2">
          Complaint Successfully Lodged
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto">
          Your report has been cryptographically signed, routed to the responsible road division, and assigned an enforceable SLA timer.
        </p>
      </div>

      {/* Tracking ID Badge */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-gray-800 space-y-3">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
          Your Official Tracking Reference Number (URN / डायरी संख्या)
        </span>
        <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-amber-300 select-all">
          {complaint.complaintCode}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={copyId}
            className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold px-4 py-2 rounded-xl transition-colors border border-white/20 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-amber-300" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Tracking Number'}</span>
          </button>

          <button
            onClick={() => setShowReceipt(true)}
            className="inline-flex items-center space-x-1.5 bg-saffron hover:bg-saffron-dark text-navy text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Receipt (पावती)</span>
          </button>
        </div>
      </div>

      {/* SLA Details Card */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 text-left space-y-2 text-xs text-navy">
        <div className="flex items-center space-x-2 font-bold text-sm text-ashoka">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Statutory Protection & Timeline</span>
        </div>
        <div className="flex justify-between py-1 border-b border-blue-100">
          <span className="text-gray-600">Assigned Department:</span>
          <span className="font-bold text-gray-900">{complaint.authority?.name || 'Municipal Works Dept'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-blue-100">
          <span className="text-gray-600">Resolution SLA:</span>
          <span className="font-bold text-amber-700">{complaint.slaHours || 48} Hours</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">SMS / WhatsApp Alert:</span>
          <span className="font-bold text-govgreen">Dispatched to Officer</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => navigate(`/track/${complaint.complaintCode}`)}
          className="flex-1 bg-navy hover:bg-navy-dark text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Track Live Status & SLA</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm py-3.5 px-6 rounded-xl border border-gray-300 shadow-sm cursor-pointer"
        >
          Report Another Issue
        </button>
      </div>

      {/* Official Grievance Acknowledgement Modal */}
      {showReceipt && (
        <GrievanceReceiptModal
          complaint={complaint}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
