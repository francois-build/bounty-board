import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RoleRouter from './hocs/withRole';
import Inbox from './pages/Inbox';
import SwitchWorkspace from './components/layout/SwitchWorkspace';
import NotificationBell from './components/layout/NotificationBell';
import { AuthProvider } from './hooks/useAuth';
import { RoleGuard } from './components/auth/RoleGuard';
import Onboarding from './pages/onboarding/Onboarding';
import CreateChallengeWizard from './pages/onboarding/CreateChallengeWizard';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { StartupDashboard } from './pages/startup/StartupDashboard';
import { ScoutDashboard } from './pages/scout/ScoutDashboard'; // Import ScoutDashboard

const App = () => (
  <AuthProvider>
    <Router>
      <div className="flex h-screen">
        <RoleRouter />
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          <NotificationBell />
          <Link to="/inbox">Inbox</Link>
          <Link to="/onboarding">Onboarding</Link>
          <Link to="/create-challenge">Create Challenge</Link>
          <Link to="/client/dashboard">Client Dashboard</Link>
          <Link to="/startup/dashboard">Startup Dashboard</Link>
          <Link to="/scout/dashboard">Scout Dashboard</Link> {/* Added Scout Link */}
        </div>
        <SwitchWorkspace />
      </div>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/create-challenge" element={<CreateChallengeWizard />} />
        <Route 
          path="/client/dashboard" 
          element={
            <RoleGuard allowed={['client']}>
              <ClientDashboard />
            </RoleGuard>
          }
        />
        <Route 
          path="/startup/dashboard" 
          element={
            <RoleGuard allowed={['startup']}>
              <StartupDashboard />
            </RoleGuard>
          }
        />
        <Route 
          path="/scout/dashboard" 
          element={
            <RoleGuard allowed={['scout']}>
              <ScoutDashboard />
            </RoleGuard>
          }
        />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
