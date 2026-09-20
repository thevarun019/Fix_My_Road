import React from 'react';
import { Sliders, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const SlaRules: React.FC = () => {
  const rules = [
    { road: 'National Highway (NHAI)', critical: '12 Hours', high: '24 Hours', medium: '48 Hours', low: '72 Hours', nodal: 'Project Director (NHAI)' },
    { road: 'State Highway (PWD)', critical: '24 Hours', high: '48 Hours', medium: '72 Hours', low: '96 Hours', nodal: 'Executive Engineer (PWD)' },
    { road: 'Major Arterial Road', critical: '24 Hours', high: '48 Hours', medium: '72 Hours', low: '96 Hours', nodal: 'Assistant Executive Engineer' },
    { road: 'Residential / Ward Street', critical: '48 Hours', high: '72 Hours', medium: '120 Hours', low: '168 Hours', nodal: 'Ward Junior Engineer' }
  ];

  const hierarchy = [
    { level: 0, title: 'Junior Engineer (Civil) / Ward Field Officer', action: 'Initial assessment & field repair contractor assignment within 4 hours.' },
    { level: 1, title: 'Assistant Executive Engineer (Sub-Division)', action: 'Triggered when Level 0 fails to complete work within statutory SLA.' },
    { level: 2, title: 'Superintending Engineer (Circle/District)', action: 'Triggered upon second breach. Direct disciplinary notice to field units.' },
    { level: 3, title: 'Chief Engineer / Municipal Commissioner', action: 'Highest statutory tier. Direct review at State Secretariat & RTI audit.' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-saffron font-bold text-xs uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          <span>Statutory Governance Charters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy">
          Service Level Agreement (SLA) & Escalation Matrix
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Mandated turnaround deadlines as notified under the Public Services Guarantee Act.
        </p>
      </div>

      {/* SLA Matrix Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md">
        <h2 className="text-base font-bold text-navy mb-4">Turnaround Deadlines by Road Class & Severity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Road Classification</th>
                <th className="py-3 px-4 text-red-600">Critical</th>
                <th className="py-3 px-4 text-amber-600">High</th>
                <th className="py-3 px-4 text-blue-600">Medium</th>
                <th className="py-3 px-4 text-gray-600">Low</th>
                <th className="py-3 px-4">Initial Nodal Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {rules.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-bold text-navy">{r.road}</td>
                  <td className="py-3.5 px-4 font-black text-red-600">{r.critical}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">{r.high}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{r.medium}</td>
                  <td className="py-3.5 px-4 text-gray-600">{r.low}</td>
                  <td className="py-3.5 px-4 text-gray-700">{r.nodal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation Hierarchy Chain */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md space-y-4">
        <h2 className="text-base font-bold text-navy">Automated 4-Tier Escalation Hierarchy</h2>
        <div className="space-y-3">
          {hierarchy.map((h) => (
            <div key={h.level} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <span className="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center flex-shrink-0">
                L{h.level}
              </span>
              <div>
                <strong className="text-navy text-sm block">{h.title}</strong>
                <p className="text-gray-600 mt-0.5">{h.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
