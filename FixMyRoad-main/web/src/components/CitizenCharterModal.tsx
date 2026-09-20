import React from 'react';
import { X, ShieldAlert, Clock, Award, Phone, CheckCircle, Scale, Printer } from 'lucide-react';

interface CitizenCharterModalProps {
  onClose: () => void;
}

export const CitizenCharterModal: React.FC<CitizenCharterModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-300 my-auto overflow-hidden max-h-[92vh] flex flex-col print:max-h-none print:border-0 print:shadow-none">
        
        {/* Header */}
        <div className="bg-navy p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-saffron flex items-center justify-center text-navy font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-saffron block">
                Ministry of Road Transport & Highways · Indian Roads Congress (IRC)
              </span>
              <h3 className="text-base sm:text-lg font-black">
                नागरिक अधिकार पत्र · Citizens Charter & Statutory SLAs
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Charter</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800 text-xs leading-relaxed">
          
          {/* Legal Premise Banner */}
          <div className="bg-amber-50/80 border-2 border-saffron/40 p-4 rounded-2xl flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-saffron-dark shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-navy uppercase text-[11px]">
                Statutory Commitment to Motorists & Pedestrians
              </span>
              <p className="text-gray-700">
                Under the <strong>Motor Vehicles (Amendment) Act 2019</strong> and <strong>IRC:SP:77 &amp; IRC:82</strong> guidelines, government road authorities are legally mandated to maintain public roadways in motorable and hazard-free conditions within prescribed maximum timeframes.
              </p>
            </div>
          </div>

          {/* Statutory Turnaround Standards Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-navy uppercase text-xs tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-ashoka" />
                <span>Mandated Turnaround Times (सेवा स्तर समझौता)</span>
              </h4>
              <span className="text-[10px] text-gray-500 font-bold">Standard: IRC:82-2015 / CPWD Manual</span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-black text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Hazard Classification</th>
                    <th className="py-2.5 px-3">Road Type</th>
                    <th className="py-2.5 px-3">Max Statutory SLA</th>
                    <th className="py-2.5 px-3">Required Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr className="bg-red-50/40">
                    <td className="py-2.5 px-3 font-bold text-red-900">
                      🚨 Critical Hazard / Cave-in / Open Manhole
                    </td>
                    <td className="py-2.5 px-3">All Public Roads</td>
                    <td className="py-2.5 px-3 font-black text-red-600">24 Hours</td>
                    <td className="py-2.5 px-3 text-gray-600">Immediate barricading within 2h; permanent seal in 24h</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-navy">
                      Pothole (Depth &gt; 50mm)
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700">National Highways &amp; Expressways</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">48 Hours</td>
                    <td className="py-2.5 px-3 text-gray-600">Cold-mix emulsion patch / DBM hot-mix compaction</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-navy">
                      Pothole (Depth &gt; 50mm)
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700">Municipal &amp; City Arterial Roads</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">72 Hours</td>
                    <td className="py-2.5 px-3 text-gray-600">Ward engineer road repair gang deployment</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-navy">
                      Waterlogging / Choked Culvert
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700">Urban Local Bodies (ULBs)</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">48 Hours</td>
                    <td className="py-2.5 px-3 text-gray-600">Suction pump dewatering &amp; silt clearance</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-navy">
                      Streetlight Dark Spot / Traffic Signal
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700">Traffic Intersections</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">72 Hours</td>
                    <td className="py-2.5 px-3 text-gray-600">Electrical component or LED fixture replacement</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-navy">
                      Bituminous Resurfacing
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700">Streets &gt; 100m distressed</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">7 Days</td>
                    <td className="py-2.5 px-3 text-gray-600">Tender sanconed micro-surfacing or milling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3-Tier Escalation Matrix */}
          <div className="space-y-2">
            <h4 className="font-black text-navy uppercase text-xs tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-govgreen" />
              <span>Hierarchical Escalation Framework (त्रिस्तरीय निवारण ढांचा)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Level 1 · Field Ward
                </span>
                <p className="font-bold text-navy text-xs mt-1">Junior Engineer (JE)</p>
                <p className="text-[11px] text-gray-600">Direct on-site inspection, gang mobilization, and photo upload verification.</p>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Level 2 · Division
                </span>
                <p className="font-bold text-navy text-xs mt-1">Executive Engineer (EE)</p>
                <p className="text-[11px] text-gray-600">Automatic escalation on SLA breach. Contractors issued show-cause penalty notices.</p>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="bg-red-100 text-red-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Level 3 · Ministry HQ
                </span>
                <p className="font-bold text-navy text-xs mt-1">National Command Center</p>
                <p className="text-[11px] text-gray-600">Appellate Authority review, inter-agency emergency reassignment, and legal audit sanction.</p>
              </div>
            </div>
          </div>

          {/* Citizen Rights & Appellate Remedy */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
            <span className="font-black text-navy uppercase text-[11px] block">
              Right to Appeal (प्रथम अपील का अधिकार):
            </span>
            <p className="text-gray-700">
              If your grievance is falsely marked resolved or remains unattended past the statutory SLA turnaround, you hold the legal right to submit a <strong>First Appeal under Section 19(1) of the RTI Act / Public Grievance Charter</strong> directly to the <strong>Superintending Engineer (Appellate Authority)</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-bold text-navy">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-ashoka" />
                <span>NHAI 24x7 Helpline: 1033</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-ashoka" />
                <span>Municipal Toll-Free: 1913</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-ashoka" />
                <span>National Emergency: 112</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl text-xs font-bold bg-navy hover:bg-navy-dark text-white shadow-md transition-colors cursor-pointer"
          >
            I Understand My Rights · Close
          </button>
        </div>
      </div>
    </div>
  );
};
