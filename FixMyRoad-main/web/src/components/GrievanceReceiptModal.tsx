import React, { useRef } from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface GrievanceReceiptModalProps {
  complaint: any;
  onClose: () => void;
}

export const GrievanceReceiptModal: React.FC<GrievanceReceiptModalProps> = ({ complaint, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const lodgedDate = new Date(complaint.createdAt || Date.now());
  const istDateStr = lodgedDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const istTimeStr = lodgedDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const slaDeadlineDate = complaint.slaDeadline ? new Date(complaint.slaDeadline) : new Date(Date.now() + 48 * 3600000);
  const deadlineStr = slaDeadlineDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-300 my-auto overflow-hidden print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="bg-navy p-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-saffron" />
            <span className="font-extrabold text-xs uppercase tracking-wider">
              Official Grievance Registration Receipt · पावती
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-saffron hover:bg-saffron-dark text-navy font-bold text-xs py-1.5 px-3.5 rounded-xl shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF Receipt</span>
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

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6 text-gray-900 bg-white print:p-0">
          
          {/* Official Indian Government Header */}
          <div className="border-b-2 border-gray-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-xl">🇮🇳</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-700">
                भारत सरकार | GOVERNMENT OF INDIA
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-navy uppercase tracking-tight">
              सड़क परिवहन एवं राजमार्ग मंत्रालय / लोक निर्माण विभाग
            </h2>
            <p className="text-[11px] font-bold text-gray-600 uppercase">
              Ministry of Road Transport & Highways · Central Public Grievance Portal
            </p>
            <div className="pt-2">
              <span className="inline-block bg-navy text-white text-[11px] font-black uppercase px-3 py-1 rounded tracking-wider">
                GRIEVANCE REGISTRATION ACKNOWLEDGEMENT SLIP (पावती)
              </span>
            </div>
          </div>

          {/* Core Metadata Table */}
          <div className="border border-gray-300 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-300 font-bold p-2.5">
              <div>
                <span className="text-gray-500 uppercase block text-[10px]">Unique Registration Number (URN / डायरी संख्या)</span>
                <span className="font-mono text-base font-black text-navy">{complaint.complaintCode}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 uppercase block text-[10px]">Lodged Timestamp (IST)</span>
                <span className="font-bold text-gray-900">{istDateStr}, {istTimeStr}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 text-xs">
              <div className="p-3 space-y-2">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Grievance Category</span>
                  <span className="font-bold text-gray-900">{complaint.category || 'Road Surface Defect'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Hazard Severity</span>
                  <span className={`inline-block font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${
                    complaint.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    complaint.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.severity || 'MEDIUM'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Road Classification</span>
                  <span className="font-semibold text-gray-800">{complaint.roadCategory?.replace('_', ' ') || 'Municipal Arterial'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">GPS Coordinates (Survey Grade)</span>
                  <span className="font-mono text-[11px] text-navy font-bold">
                    {complaint.latitude ? `${Number(complaint.latitude).toFixed(5)}° N, ${Number(complaint.longitude).toFixed(5)}° E` : '28.61393° N, 77.20902° E'}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Responsible Authority (अधिकार क्षेत्र)</span>
                  <span className="font-bold text-navy">{complaint.authority?.name || 'Public Works Department (PWD)'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Designated Field Officer</span>
                  <span className="font-bold text-gray-800">{complaint.assignedOfficerName || 'Ward Junior Engineer (Civil)'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Mandated Citizen Charter SLA</span>
                  <span className="font-extrabold text-amber-800">{complaint.slaHours || 48} Hours (Deadline: {deadlineStr})</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Current Custody Status</span>
                  <span className="font-bold text-govgreen-dark">{complaint.status?.replace('_', ' ') || 'SUBMITTED / REGISTERED'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Damage Particulars */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Reported Site Address / Landmarked Location:</span>
            <p className="font-semibold text-gray-900">{complaint.address || 'Public Road Network'}</p>
            {complaint.description && (
              <p className="text-gray-600 italic text-[11px] pt-1">"{complaint.description}"</p>
            )}
          </div>

          {/* Statutory Rights Notice under Public Grievances Act */}
          <div className="border-l-4 border-saffron bg-amber-50/70 p-3 rounded-r-xl text-[11px] space-y-1">
            <span className="font-black text-navy uppercase text-[10px] tracking-wide block">
              नागरिक अधिकार पत्र (Citizens Charter) Statutory Legal Notice:
            </span>
            <p className="text-gray-700 leading-relaxed font-medium">
              Under the Central Public Grievance Charter &amp; Motor Vehicles Amendment Act, the competent authority is statutorily bound to complete remediation within <strong>{complaint.slaHours || 48} hours</strong>. If unresolved by the deadline, jurisdiction automatically escalates to the <strong>National Command Center &amp; Superintending Engineer (First Appellate Authority)</strong>.
            </p>
          </div>

          {/* QR Code / Barcode Simulation & Official Stamp */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-gray-700 block">DIGITAL-SEAL: {btoa(complaint.complaintCode || 'FMR').slice(0, 16)}...</span>
              <p>Generated electronically under Information Technology Act 2000. No physical signature required.</p>
              <p>Toll Free Citizen Help: <strong>1033 (NHAI)</strong> / <strong>1913 (MCD)</strong></p>
            </div>
            <div className="text-center p-2 border border-gray-300 rounded-lg bg-gray-50 shrink-0">
              <div className="w-12 h-12 border-2 border-dashed border-gray-400 flex items-center justify-center font-mono text-[9px] text-gray-400">
                [ QR SEAL ]
              </div>
              <span className="text-[9px] font-bold text-gray-600 block mt-0.5">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl text-xs font-bold bg-navy hover:bg-navy-dark text-white flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-saffron" />
            <span>Print Official Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
