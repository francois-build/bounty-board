import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { ChallengeSchema, Challenge } from '@bounty-board/shared/schemas';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const CreateChallengeWizard = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bounty, setBounty] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in to create a challenge.');
      return;
    }

    const challengeData = {
      title,
      description,
      bounty_amount: parseInt(bounty, 10),
      status: 'draft',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      // These fields are not set by the client
      // gmv_total: 0, 
      // success_fee: 0,
      // is_stealth: false
    };

    try {
      const partialChallenge = {
        ...challengeData,
        id: 'temp-id',
        applications_count: 0,
        is_stealth: false,
        success_fee: 0,
        gmv_total: 0
      }
      ChallengeSchema.parse(partialChallenge);
    } catch (err: any) {
        console.log(err)
      setError(`Invalid data: ${err.message}`);
      return;
    }

    try {
      await addDoc(collection(db, 'challenges'), challengeData);
      // Optionally, redirect or clear the form
      setTitle('');
      setDescription('');
      setBounty('');
    } catch (err) {
      setError('Failed to create challenge. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Create a New Challenge</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input 
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bounty" className="block text-sm font-medium text-gray-700">Bounty Amount</label>
          <input
            type="number"
            id="bounty"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2 text-white bg-slate-800 rounded-md hover:bg-slate-700">Create Challenge</button>
      </form>
    </div>
  );
};

export default CreateChallengeWizard;
