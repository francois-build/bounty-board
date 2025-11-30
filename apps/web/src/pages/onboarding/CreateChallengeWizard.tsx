
import React, { useState, useEffect } from 'react';
import { ChallengeProvider, useChallenge } from './ChallengeContext';
import { MadLibsStep } from './MadLibsStep';
import { StrengthMeterStep } from './StrengthMeterStep';
import { getFunctions, httpsCallable } from 'firebase/functions';

const CreateChallengeWizard = () => {
  const [step, setStep] = useState(0);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const { goal, problem, solution, budget, tags, startDate, endDate, setIsDraft } = useChallenge();

  useEffect(() => {
    const draft = localStorage.getItem('challengeDraft');
    if (draft) {
      const draftData = JSON.parse(draft);
      console.log('Restored draft:', draftData);
    }

    const handleBeforeUnload = () => {
      const challengeData = { goal, problem, solution, budget, tags, startDate, endDate };
      localStorage.setItem('challengeDraft', JSON.stringify(challengeData));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [goal, problem, solution, budget, tags, startDate, endDate]);

  const handlePublish = async () => {
    setIsDraft(false);
    const challengeData = { goal, problem, solution, budget, tags, startDate, endDate };
    const functions = getFunctions();
    const sanitizeInputs = httpsCallable(functions, 'sanitizeInputs');

    try {
      const result = await sanitizeInputs(challengeData);
      console.log('Challenge published:', result.data);
      localStorage.removeItem('challengeDraft');
      setShowManualFallback(false);
    } catch (error) {
      console.error('Failed to publish challenge:', error);
      setShowManualFallback(true);
    }
  };

  const steps = [<MadLibsStep />, <StrengthMeterStep />];

  if (showManualFallback) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Error Publishing Challenge</h2>
        <p className="mb-4">There was an error publishing your challenge. Please try again later or switch to manual mode to save your progress.</p>
        <button onClick={() => setShowManualFallback(false)} className="px-4 py-2 bg-gray-300 rounded-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      {steps[step]}
      <div className="flex justify-between mt-8">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="px-4 py-2 bg-gray-300 rounded-md">
            Back
          </button>
        )}
        {step < steps.length - 1 && (
          <button onClick={() => setStep(step + 1)} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Next
          </button>
        )}
        {step === steps.length - 1 && (
          <button onClick={handlePublish} className="px-4 py-2 bg-green-500 text-white rounded-md">
            Publish
          </button>
        )}
      </div>
    </div>
  );
};

const WrappedCreateChallengeWizard = () => (
  <ChallengeProvider>
    <CreateChallengeWizard />
  </ChallengeProvider>
);

export default WrappedCreateChallengeWizard;
