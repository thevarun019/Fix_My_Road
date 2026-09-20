import React, { useState } from 'react';
import { Printer, X, ShieldAlert, Building2, Send, AlertTriangle } from 'lucide-react';

interface InterDeptCoordinationModalProps {
  complaint: any;
  onClose: () => void;
}

export const InterDeptCoordinationModal: React.FC<InterDeptCoordinationModalProps> = ({ complaint, onClose }) => {
  const [dept, setDept] = useState('Delhi Jal Board (DJB) / Water & Sewerage Board');
  const [trenchingReason, setTrenchingReason] = useState('Sub-surface pipeline burst & unpaved backfilling causing cavity and asphalt sinking.');
  const [restorationFee, setRestorationFee] = useState('45,000');
  const [issued, setIssued] = useState(false);

  const noticeNo = `PWD/ROAD-CUT/NOTICE/2026/${complaint.complaintCode?.replace(/[^a-zA-Z0-9]/g, '') || '772'}`;
  const istDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssued(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-300 my-auto overflow-hidden print:border-0 print:shadow-none">
        
        {/* Header (Hidden in Print) */}
        <div className="bg-navy p-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-saffron" />
            <span className="font-extrabold text-xs uppercase tracking-wider">
              Inter-Departmental Digging &amp; Restoration Notice · अन्तर-विभागीय समन्वय
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-saffron hover:bg-saffron-dark text-navy font-bold text-xs py-1.5 px-3.5 rounded-xl shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Notice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-6 sm:p-8 space-y-5 text-gray-900 bg-white print:p-0">
          
          {/* Letterhead */}
          <div className="border-b-2 border-gray-900 pb-3 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-xl">⚠️</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-700">
                GOVERNMENT OF NCT OF DELHI / STATE PUBLIC WORKS DEPARTMENT
              </span>
            </div>
            <h2 className="text-lg font-black text-navy uppercase tracking-tight">
              कार्यालय मुख्य अभियंता (अंतर-विभागीय समन्वय सेल)
            </h2>
            <p className="text-[11px] font-bold text-gray-600 uppercase">
              Office of the Chief Engineer · Inter-Agency Road Cutting &amp; Restoration Wing
            </p>
            <div className="pt-1.5">
              <span className="inline-block bg-red-700 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded tracking-wider">
                STATUTORY ROAD RESTORATION &amp; RECOVERY DEMAND NOTICE
              </span>
            </div>
          </div>

          {/* Reference Line */}
          <div className="flex justify-between items-start text-xs border-b border-gray-200 pb-2">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Notice Ref No:</span>
              <span className="font-mono font-black text-navy text-xs">{noticeNo}</span>
              <span className="text-gray-500 text-[10px] block">Public Grievance Reference: {complaint.complaintCode}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Date of Issue:</span>
              <span className="font-bold text-gray-900">{istDate}</span>
              <span className="text-red-700 font-extrabold text-[10px] block uppercase">Statutory Response: 24 Hours</span>
            </div>
          </div>

          {/* Recipient Department Form */}
          <div className="space-y-3 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
              <div>
                <strong className="text-gray-700 uppercase text-[10px] block mb-1">To: Designated Utility Public Authority:</strong>
                <select
                  value={dept}
                  onChange={e => setDept(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 font-bold text-navy text-xs bg-white"
                >
                  <option value="Delhi Jal Board (DJB) / Water & Sewerage Board">Delhi Jal Board (DJB) / Municipal Water Board</option>
                  <option value="Electricity Distribution Co (DISCOM / Power Grid)">Electricity Distribution Co (DISCOM / BSES / TPDDL / Power Grid)</option>
                  <option value="Indraprastha Gas Limited (IGL) / Gas Utility">Indraprastha Gas Limited (IGL) / City Gas Pipeline Utility</option>
                  <option value="Telecom & Optical Fiber Service Providers (OFC)">Telecom &amp; Optical Fiber Providers (OFC Trenching Wing)</option>
                </select>
              </div>

              <div>
                <strong className="text-gray-700 uppercase text-[10px] block mb-1">Defect Location:</strong>
                <span className="font-bold text-navy">{complaint.address || 'Public Road Alignment'}</span>
                <span className="text-gray-500 font-mono text-[10px] ml-2">
                  ({complaint.latitude ? Number(complaint.latitude).toFixed(5) : '28.61393'}, {complaint.longitude ? Number(complaint.longitude).toFixed(5) : '77.20902'})
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 uppercase block mb-1">
                Cause of Road Degradation / Trenching Activity:
              </label>
              <textarea
                rows={2}
                value={trenchingReason}
                onChange={e => setTrenchingReason(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 font-medium text-xs bg-white"
              />
            </div>

            <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-900 uppercase text-[10px]">
                  Assessed Road Restoration Charges (RRC) as per PWD Schedule:
                </span>
                <div className="flex items-center space-x-1 font-mono font-black text-navy text-sm">
                  <span>₹</span>
                  <input
                    type="text"
                    value={restorationFee}
                    onChange={e => setRestorationFee(e.target.value)}
                    className="w-24 p-1 rounded-lg border border-red-300 text-right font-bold text-red-800 bg-white text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-red-800 leading-tight">
                Under Section 217 of the Municipal Act, utility agencies are strictly liable to restore asphalt surface to original grade within 24 hours of pipeline repair, failing which RRC recovery proceedings will be initiated against the agency's annual budget.
              </p>
            </div>
          </div>

          {/* Success Banner if Issued */}
          {issued && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center space-x-2">
              <span>✓ Notice officially registered in inter-departmental grievance ledger. Copies marked to District Magistrate.</span>
            </div>
          )}

          {/* Signatures Stamp */}
          <div className="pt-4 border-t border-gray-300 grid grid-cols-2 gap-4 text-center text-xs">
            <div className="pt-8">
              <span className="border-t border-gray-400 px-6 font-bold text-gray-700 block">Executive Engineer (Roads)</span>
              <span className="text-[10px] text-gray-500">Public Works Department</span>
            </div>
            <div className="pt-8">
              <span className="border-t border-gray-400 px-6 font-bold text-gray-700 block">Superintending Engineer</span>
              <span className="text-[10px] text-gray-500">First Appellate Authority</span>
            </div>
          </div>
        </div>

        {/* Footer (Hidden in Print) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          <div className="flex space-x-2">
            {!issued && (
              <button
                type="button"
                onClick={handleIssue}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-800 text-white flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue Formal Notice</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-navy hover:bg-navy-dark text-white flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-saffron" />
              <span>Print Notice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
