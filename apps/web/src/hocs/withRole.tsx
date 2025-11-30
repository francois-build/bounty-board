
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import WorkstationShell from '../components/layout/WorkstationShell';
import DiscoveryShell from '../components/layout/DiscoveryShell';

const RoleRouter = () => {
  const { user } = useAuth(); // Assuming useAuth provides user with a role

  // Default to a loading state or a generic shell if user or role is not available yet
  if (!user) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  switch (user.role) {
    case 'admin':
    case 'client':
      return <WorkstationShell />;
    case 'startup':
    case 'scout':
      return <DiscoveryShell />;
    default:
      // Handle unknown roles or default to a specific shell
      return <div>Unknown role</div>; // Or a default shell
  }
};

export default RoleRouter;
