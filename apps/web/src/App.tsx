
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RoleRouter from './hocs/withRole';
import Inbox from './pages/Inbox';
import SwitchWorkspace from './components/layout/SwitchWorkspace';
import NotificationBell from './components/layout/NotificationBell';
import { AuthProvider } from './hooks/useAuth';
import Onboarding from './pages/onboarding/Onboarding';
import CreateChallengeWizard from './pages/onboarding/CreateChallengeWizard';

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
        </div>
        <SwitchWorkspace />
      </div>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/create-challenge" element={<CreateChallengeWizard />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
