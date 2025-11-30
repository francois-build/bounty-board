
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ChallengeContextType {
  goal: string;
  setGoal: (goal: string) => void;
  problem: string;
  setProblem: (problem: string) => void;
  solution: string;
  setSolution: (solution: string) => void;
  budget: number;
  setBudget: (budget: number) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  isDraft: boolean;
  setIsDraft: (isDraft: boolean) => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [goal, setGoal] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [budget, setBudget] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDraft, setIsDraft] = useState(true);

  return (
    <ChallengeContext.Provider value={{
      goal, setGoal,
      problem, setProblem,
      solution, setSolution,
      budget, setBudget,
      tags, setTags,
      startDate, setStartDate,
      endDate, setEndDate,
      isDraft, setIsDraft
    }}>
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
