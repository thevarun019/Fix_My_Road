import React from 'react';
import { GovtHeader } from '../gov/GovtHeader';
import { GovtFooter } from '../gov/GovtFooter';
import { GovtNav } from '../gov/GovtNav';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CommandCenter } from '../pages/Admin/CommandCenter';
import { Escalations } from '../pages/Admin/Escalations';
import { Leaderboard } from '../pages/Admin/Leaderboard';
import { SlaRules } from '../pages/Admin/SlaRules';
import { AllComplaints } from '../pages/Admin/AllComplaints';
import { AuditLogs } from '../pages/Admin/AuditLogs';
import { Login } from '../pages/Auth/Login';

/**
 * Admin Shell — same government look as Citizen portal,
 * GovtNav shows admin-specific links; routes scoped to admin pages.
 */
export const AdminShell: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <GovtHeader />
    <GovtNav />
    <main className="flex-1">
      <Routes>
        <Route path="/admin" element={<CommandCenter />} />
        <Route path="/admin/complaints" element={<AllComplaints />} />
        <Route path="/admin/escalations" element={<Escalations />} />
        <Route path="/admin/leaderboard" element={<Leaderboard />} />
        <Route path="/admin/sla-rules" element={<SlaRules />} />
        <Route path="/admin/audit" element={<AuditLogs />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </main>
    <GovtFooter />
  </div>
);
