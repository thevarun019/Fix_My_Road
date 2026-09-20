import React from 'react';
import { ShieldCheck, Cpu, Smartphone, Lock, Award, HeartHandshake } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-saffron uppercase tracking-wider block mb-1">
          Statutory Framework & Technology
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-navy">
          About FixMyRoad (सड़क प्रहरी)
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
          FixMyRoad is a web-first statutory grievance redressal and SLA enforcement platform built for the citizens of India. Designed specifically to run on ₹5,000 Android phones and slow 2G mobile data connections with zero app downloads required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-saffron">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy">₹5,000 Phone & 2G Ready</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Client-side HTML5 canvas compression compresses multi-megapixel camera photos down to &lt;100 KB before upload. In offline zones, grievances are stored in browser IndexedDB and sync automatically upon network recovery.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-navy">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy">Automated Privacy Redaction</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All submitted grievance photos pass through an OpenCV neural blur pipeline. Bystander faces and vehicle registration plates are irreversibly blurred before public publishing.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-govgreen">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy">Binding SLA Timers</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Grievances are tracked against enforceable countdown timers. If an authority does not repair the pothole within the allotted time (12h to 72h), the complaint automatically escalates to senior IAS & Superintending Engineers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy">RTI Act Compliance</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every status change, engineer dispatch, and escalation is committed to an immutable audit ledger. Citizens can download legal dossiers under Section 4(1)(b) of the Right to Information Act, 2005.
          </p>
        </div>
      </div>
    </div>
  );
};
