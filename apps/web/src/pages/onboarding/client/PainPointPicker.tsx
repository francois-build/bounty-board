
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const painPoints = [
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'product', name: 'Product' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'support', name: 'Support' },
  { id: 'other', name: 'Other' },
];

const PainPointPicker = ({ onNext }) => {
  const [selectedPainPoints, setSelectedPainPoints] = useState([]);

  const handlePainPointClick = (p) => {
    setSelectedPainPoints((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">What are your biggest pain points?</h1>
        <p className="text-lg text-gray-600 mb-8">We'll use this to auto-draft a solution for you.</p>
        <div className="grid grid-cols-2 gap-4">
          {painPoints.map((p) => (
            <button
              key={p.id}
              className={`px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedPainPoints.includes(p.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white'
              }`}
              onClick={() => handlePainPointClick(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <button
        className="flex items-center justify-center w-full max-w-md px-4 py-3 mt-8 text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={selectedPainPoints.length === 0}
        onClick={onNext}
      >
        Continue
        <ArrowRight className="ml-2" />
      </button>
    </div>
  );
};

export default PainPointPicker;
