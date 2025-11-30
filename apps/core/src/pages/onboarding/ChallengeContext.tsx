import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Challenge } from '@bounty-board/shared/schemas';

interface ChallengeContextType {
  challenge: Partial<Challenge>;
  setChallenge: (challenge: Partial<Challenge>) => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [challenge, setChallenge] = useState<Partial<Challenge>>({
    status: 'draft',
  });

  return (
    <ChallengeContext.Provider value={{ challenge, setChallenge }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};