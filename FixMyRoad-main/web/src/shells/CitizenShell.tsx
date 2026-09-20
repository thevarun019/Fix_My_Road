import React from 'react';
import { GovtHeader } from '../gov/GovtHeader';
import { GovtNav } from '../gov/GovtNav';
import { GovtFooter } from '../gov/GovtFooter';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { ReportWizard } from '../pages/Report/ReportWizard';
import { TrackById } from '../pages/Track/TrackById';
import { ComplaintDetail } from '../pages/Track/ComplaintDetail';
import { PublicHeatmap } from '../pages/Map/PublicHeatmap';
import { Login } from '../pages/Auth/Login';
import { About } from '../pages/About';
import { SlaRules } from '../pages/Admin/SlaRules';

/**
 * Citizen Shell — Public-facing government portal.
 * Used for unauthenticated users and CITIZEN role.
 * Any unauthenticated attempt to visit /admin or /authority
 * is guided straight to the respective government portal login.
 */
export const CitizenShell: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <GovtHeader />
    <GovtNav />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportWizard />} />
        <Route path="/track" element={<TrackById />} />
        <Route path="/track/:code" element={<ComplaintDetail />} />
        <Route path="/map" element={<PublicHeatmap />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login defaultPortal="admin" />} />
        <Route path="/authority/login" element={<Login defaultPortal="officer" />} />
        <Route path="/admin/sla-rules" element={<SlaRules />} />

        {/* Unauthenticated access to restricted portals redirects directly to their login */}
        <Route path="/admin" element={<Navigate to="/login?portal=admin&from=/admin" replace />} />
        <Route path="/admin/*" element={<Navigate to="/login?portal=admin&from=/admin" replace />} />
        <Route path="/authority" element={<Navigate to="/login?portal=officer&from=/authority" replace />} />
        <Route path="/authority/*" element={<Navigate to="/login?portal=officer&from=/authority" replace />} />

        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </main>
    <GovtFooter />
  </div>
);
