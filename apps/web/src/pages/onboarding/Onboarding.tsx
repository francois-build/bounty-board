
import React, { useState } from 'react';
import TeamAutoDiscovery from './client/TeamAutoDiscovery';
import PainPointPicker from './client/PainPointPicker';
import DeckToData from './startup/DeckToData';
import CompetitorCloaking from './startup/CompetitorCloaking';
import SimilarTo from './startup/SimilarTo';

const Onboarding = () => {
  const [flow, setFlow] = useState(null);
  const [step, setStep] = useState(0);

  const handleNext = () => setStep((prev) => prev + 1);

  const renderFlow = () => {
    if (flow === 'client') {
      switch (step) {
        case 0:
          return <TeamAutoDiscovery onNext={handleNext} />;
        case 1:
          return <PainPointPicker onNext={handleNext} />;
        default:
          return <div>Client onboarding complete!</div>;
      }
    } else if (flow === 'startup') {
      switch (step) {
        case 0:
          return <DeckToData onNext={handleNext} />;
        case 1:
          return <CompetitorCloaking onNext={handleNext} />;
        case 2:
          return <SimilarTo onNext={handleNext} />;
        default:
          return <div>Startup onboarding complete!</div>;
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-4xl font-bold mb-8">Are you a client or a startup?</h1>
        <div className="flex space-x-4">
          <button
            className="px-8 py-4 text-2xl font-bold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600"
            onClick={() => setFlow('client')}
          >
            Client
          </button>
          <button
            className="px-8 py-4 text-2xl font-bold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600"
            onClick={() => setFlow('startup')}
          >
            Startup
          </button>
        </div>
      </div>
    );
  };

  return <div>{renderFlow()}</div>;
};

export default Onboarding;
