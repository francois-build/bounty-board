
import React from 'react';
import { useChallenge } from './ChallengeContext';

export const MadLibsStep = () => {
  const { goal, setGoal, problem, setProblem, solution, setSolution } = useChallenge();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Define the Challenge</h2>
      <div className="mb-4">
        <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Goal</label>
        <textarea
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="What is the primary goal of this challenge?"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="problem" className="block text-sm font-medium text-gray-700">Problem</label>
        <textarea
          id="problem"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="What is the problem you are trying to solve?"
        />
      </div>
      <div>
        <label htmlFor="solution" className="block text-sm font-medium text-gray-700">Solution</label>
        <textarea
          id="solution"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Describe a potential solution."
        />
      </div>
    </div>
  );
};
