import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { Challenge } from '@bounty-board/shared/schemas';
import { WorkstationShell } from '../../components/WorkstationShell';

export const StartupDashboard = () => {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'challenges'), 
      where('status', '==', 'active'), 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let challengesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));

      // Client-side filter for stealth challenges
      if (profile?.role !== 'admin') { // Assuming admins can see stealth challenges
        challengesData = challengesData.filter(challenge => !challenge.is_stealth);
      }

      setChallenges(challengesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  return (
    <WorkstationShell title="Startup Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p>Loading challenges...</p>
        ) : (
          challenges.map(challenge => (
            <div key={challenge.id} className="bg-slate-50 rounded-lg shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300 ease-in-out" style={{boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '0.75rem'}}>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{challenge.id}</h3>
                <p className="text-slate-600 mb-4">{challenge.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-800">${challenge.bounty_amount.toLocaleString()}</span>
                <button className="px-4 py-2 text-white bg-slate-800 rounded-md hover:bg-slate-700">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </WorkstationShell>
  );
};
