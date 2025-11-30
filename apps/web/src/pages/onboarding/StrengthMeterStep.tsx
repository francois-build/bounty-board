
import React from 'react';
import { useChallenge } from './ChallengeContext';

const StrengthMeter = ({ score }: { score: number }) => {
  const strengthLevels = [
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Medium', color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ];

  const level = strengthLevels[score];

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`${level.color} h-2.5 rounded-full`}
        style={{ width: `${((score + 1) / 3) * 100}%` }}
      ></div>
      <p className="text-sm text-center mt-1">{level.label}</p>
    </div>
  );
};

export const StrengthMeterStep = () => {
  const { budget, setBudget, tags, setTags, startDate, setStartDate, endDate, setEndDate } = useChallenge();

  const calculateStrength = () => {
    let score = 0;
    if (budget > 0) score++;
    if (tags.length > 0) score++;
    if (startDate && endDate) score++;
    return Math.min(score, 2);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Challenge Details</h2>
      <div className="mb-4">
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
        <input
          type="text"
          id="tags"
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value.split(', ').map(tag => tag.trim()))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., AI, Healthcare, FinTech"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <StrengthMeter score={calculateStrength()} />
    </div>
  );
};
