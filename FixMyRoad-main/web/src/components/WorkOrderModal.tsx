import React, { useState, useRef } from 'react';
import { Printer, X, Wrench, ShieldCheck, HardHat, FileText, CheckSquare } from 'lucide-react';

interface WorkOrderModalProps {
  complaint: any;
  onClose: () => void;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ complaint, onClose }) => {
  const [material, setMaterial] = useState('Bituminous Cold Mix (VG-30 Emulsion)');
  const [contractor, setContractor] = useState('Central Road Gang #4 / PWD Maintenance Div');
  const [vehicleNo, setVehicleNo] = useState('DL-1GB-4029 (Asphalt Patching Unit)');
  const [length, setLength] = useState('2.5');
  const [width, setWidth] = useState('1.8');
  const [depth, setDepth] = useState('0.06');

  const patchArea = (parseFloat(length || '0') * parseFloat(width || '0')).toFixed(2);
  const patchVolume = (parseFloat(length || '0') * parseFloat(width || '0') * parseFloat(depth || '0')).toFixed(3);

  const workOrderNo = `WO/PWD/2026/${complaint.complaintCode?.replace(/[^a-zA-Z0-9]/g, '') || '881'}`;
  const istDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-300 my-auto overflow-hidden print:border-0 print:shadow-none print:max-w-none">
        
        {/* Top Header (Hidden in Print) */}
        <div className="bg-navy p-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <HardHat className="w-5 h-5 text-saffron" />
            <span className="font-extrabold text-xs uppercase tracking-wider">
              PWD Spot Repair Sanction &amp; Work Order · कार्य आदेश
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-saffron hover:bg-saffron-dark text-navy font-bold text-xs py-1.5 px-3.5 rounded-xl shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Work Order</span>
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

        {/* Printable Work Order Body */}
        <div className="p-6 sm:p-8 space-y-5 text-gray-900 bg-white print:p-0">
          
          {/* Official PWD Letterhead */}
          <div className="border-b-2 border-gray-900 pb-3 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-xl">🏛️</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-700">
                PUBLIC WORKS DEPARTMENT · GOVT. OF NCT OF DELHI / STATE PWD
              </span>
            </div>
            <h2 className="text-lg font-black text-navy uppercase tracking-tight">
              कार्यालय कार्यपालक अभियंता (सड़क अनुरक्षण प्रभाग)
            </h2>
            <p className="text-[11px] font-bold text-gray-600 uppercase">
              Office of the Executive Engineer (Road Maintenance Division) · Field Works Order
            </p>
            <div className="pt-1.5">
              <span className="inline-block bg-navy text-white text-[10px] font-black uppercase px-3 py-0.5 rounded tracking-wider">
                FORM 11: STATUTORY SPOT REPAIR WORK ORDER &amp; MB ALLOTMENT
              </span>
            </div>
          </div>

          {/* Sanction Header */}
          <div className="flex justify-between items-start text-xs border-b border-gray-200 pb-3">
            <div>
              <span className="text-gray-500 uppercase text-[10px] block font-bold">Work Order Sanction No.</span>
              <span className="font-mono font-black text-navy text-sm">{workOrderNo}</span>
              <span className="text-gray-500 text-[10px] block">Grievance Ref: {complaint.complaintCode}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 uppercase text-[10px] block font-bold">Sanction Date</span>
              <span className="font-bold text-gray-900">{istDate}</span>
              <span className="text-amber-800 font-extrabold text-[10px] block uppercase">SLA Window: {complaint.slaHours || 48} Hours</span>
            </div>
          </div>

          {/* Location & Damage Particulars */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong className="text-gray-500 uppercase text-[10px] block">Location / Chainage:</strong>
                <span className="font-bold text-navy">{complaint.address || 'Urban Road Link'}</span>
              </div>
              <div>
                <strong className="text-gray-500 uppercase text-[10px] block">GPS Coordinates:</strong>
                <span className="font-mono font-bold text-navy">
                  {complaint.latitude ? `${Number(complaint.latitude).toFixed(5)}° N, ${Number(complaint.longitude).toFixed(5)}° E` : '28.61393° N, 77.20902° E'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
              <div>
                <strong className="text-gray-500 uppercase text-[10px] block">Defect Description:</strong>
                <span className="font-semibold text-gray-800">{complaint.category || 'Road Surface Pothole'} ({complaint.severity || 'HIGH'})</span>
              </div>
              <div>
                <strong className="text-gray-500 uppercase text-[10px] block">Designated Junior Engineer:</strong>
                <span className="font-bold text-gray-900">{complaint.assignedOfficerName || 'Ward Junior Engineer (Civil)'}</span>
              </div>
            </div>
          </div>

          {/* Technical Measurement Book (MB) Estimations */}
          <div className="space-y-2 text-xs">
            <span className="font-black text-navy uppercase text-[10px] tracking-wide block">
              1. Measurement Book (MB) Entry Estimates (नाप पुस्तिका प्रविष्टि):
            </span>
            <div className="grid grid-cols-3 gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Length ($L$ in meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-gray-300 font-bold bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Width ($W$ in meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={width}
                  onChange={e => setWidth(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-gray-300 font-bold bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Depth ($D$ in meters)</label>
                <input
                  type="number"
                  step="0.01"
                  value={depth}
                  onChange={e => setDepth(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-gray-300 font-bold bg-white text-xs"
                />
              </div>
            </div>
            <div className="flex justify-between px-2 text-[11px] font-bold text-navy">
              <span>Computed Patch Area: <strong className="text-amber-800">{patchArea} sq.m</strong></span>
              <span>Bituminous Volume Required: <strong className="text-amber-800">{patchVolume} cu.m</strong></span>
            </div>
          </div>

          {/* Material & Gang Allotment */}
          <div className="space-y-2 text-xs">
            <span className="font-black text-navy uppercase text-[10px] tracking-wide block">
              2. Gang Deployment &amp; Material Sanction:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Material Grade</label>
                <select
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 font-bold text-xs bg-white"
                >
                  <option value="Bituminous Cold Mix (VG-30 Emulsion)">Bituminous Cold Mix (VG-30 Emulsion)</option>
                  <option value="Dense Bituminous Macadam (DBM)">Dense Bituminous Macadam (DBM Hot Mix)</option>
                  <option value="Wet Mix Macadam (WMM) Base">Wet Mix Macadam (WMM) Base Repair</option>
                  <option value="Interlocking Concrete Paver (M-40)">Interlocking Concrete Paver (M-40 Grade)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Assigned Gang / Contractor</label>
                <input
                  type="text"
                  value={contractor}
                  onChange={e => setContractor(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 font-bold text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Compactor / Roller Machinery Reg. No.</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 font-bold text-xs bg-white"
              />
            </div>
          </div>

          {/* Mandatory Site Safety Protocol */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] space-y-1">
            <span className="font-bold text-amber-900 uppercase text-[10px] block">Mandatory IRC Safety Checklist:</span>
            <ul className="list-disc pl-4 text-amber-800 space-y-0.5 text-[10px]">
              <li>Deploy high-visibility retro-reflective traffic cones 30m ahead of site.</li>
              <li>Compaction must achieve minimum 98% laboratory density using vibro-roller.</li>
              <li>Upload mandatory in-progress photo to portal to pause SLA countdown.</li>
            </ul>
          </div>

          {/* Officer Signatures Stamp */}
          <div className="pt-4 border-t border-gray-300 grid grid-cols-2 gap-4 text-center text-xs">
            <div className="pt-8">
              <span className="border-t border-gray-400 px-6 font-bold text-gray-700 block">Junior Engineer (Civil)</span>
              <span className="text-[10px] text-gray-500">Inspection Officer</span>
            </div>
            <div className="pt-8">
              <span className="border-t border-gray-400 px-6 font-bold text-gray-700 block">Executive Engineer</span>
              <span className="text-[10px] text-gray-500">Sanctioning Authority</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden in Print) */}
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
            onClick={() => window.print()}
            className="py-2.5 px-5 rounded-xl text-xs font-bold bg-navy hover:bg-navy-dark text-white flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-saffron" />
            <span>Print Work Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
