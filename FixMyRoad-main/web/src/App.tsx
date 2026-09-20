import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { CitizenShell } from './shells/CitizenShell';
import { OfficerShell } from './shells/OfficerShell';
import { AdminShell } from './shells/AdminShell';

/**
 * Root app — switches between three completely separate portal shells
 * based on the authenticated user's role:
 *
 *  CITIZEN / unauthenticated  →  CitizenShell  (public govt portal)
 *  OFFICER                    →  OfficerShell  (field engineer dashboard)
 *  ADMIN / SUPER_ADMIN        →  AdminShell    (command center)
 */
export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  const getShell = () => {
    if (!isAuthenticated || !user) return <CitizenShell />;
    if (user.role === 'OFFICER') return <OfficerShell />;
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return <AdminShell />;
    return <CitizenShell />;
  };

  return (
    <BrowserRouter>
      {getShell()}
    </BrowserRouter>
  );
};

export default App;
