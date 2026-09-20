import React from 'react';
import { GovtHeader } from '../gov/GovtHeader';
import { GovtFooter } from '../gov/GovtFooter';
import { GovtNav } from '../gov/GovtNav';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthorityDashboard } from '../pages/Authority/Dashboard';
import { OfficerMap } from '../pages/Authority/OfficerMap';
import { MyResolved } from '../pages/Authority/MyResolved';
import { SlaScorecard } from '../pages/Authority/SlaScorecard';
import { Login } from '../pages/Auth/Login';

/**
 * Officer Shell — same government look as Citizen portal,
 * but the GovtNav shows officer-specific links and all routes
 * are scoped to officer functionality.
 */
export const OfficerShell: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <GovtHeader />
    <GovtNav />
    <main className="flex-1">
      <Routes>
        <Route path="/authority" element={<AuthorityDashboard />} />
        <Route path="/authority/map" element={<OfficerMap />} />
        <Route path="/authority/resolved" element={<MyResolved />} />
        <Route path="/authority/scorecard" element={<SlaScorecard />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/authority" replace />} />
      </Routes>
    </main>
    <GovtFooter />
  </div>
);
