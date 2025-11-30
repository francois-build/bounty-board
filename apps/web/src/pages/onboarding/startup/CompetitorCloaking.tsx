
import React from 'react';
import { ArrowRight } from 'lucide-react';

const CompetitorCloaking = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Competitor Cloaking</h1>
        <p className="text-lg text-gray-600 mb-8">Enter your competitors to keep your data private.</p>
        <input
          type="text"
          placeholder="e.g., competitor.com"
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        className="flex items-center justify-center w-full max-w-md px-4 py-3 mt-8 text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600"
        onClick={onNext}
      >
        Continue
        <ArrowRight className="ml-2" />
      </button>
    </div>
  );
};

export default CompetitorCloaking;
