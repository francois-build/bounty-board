import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { Challenge } from '@bounty-board/shared/schemas';
import { WorkstationShell } from '../../components/WorkstationShell';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'challenges'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challengesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      setChallenges(challengesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalSpent = challenges.reduce((acc, c) => acc + (c.status === 'awarded' ? c.bounty_amount : 0), 0);
  const activeBounties = challenges.filter(c => c.status === 'active').length;
  const pendingReviews = challenges.filter(c => c.status === 'review').length;

  return (
    <WorkstationShell 
      title="Client Dashboard"
      actions={<button className="px-4 py-2 text-white bg-slate-800 rounded-md hover:bg-slate-700">Post Challenge</button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-600">Total Spent</h3>
          <p className="text-3xl font-bold text-slate-800">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-600">Active Bounties</h3>
          <p className="text-3xl font-bold text-slate-800">{activeBounties}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-600">Pending Reviews</h3>
          <p className="text-3xl font-bold text-slate-800">{pendingReviews}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bounty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applications</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {challenges.map(challenge => (
              <tr key={challenge.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{challenge.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${challenge.bounty_amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${challenge.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {challenge.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WorkstationShell>
  );
};