
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { db, functions } from '../../lib/firebase';
import { UserProfile } from '@bounty-board/shared/schemas';
import { WorkstationShell } from '../../components/WorkstationShell';
import { httpsCallable } from 'firebase/functions';

// Mock function placeholder
const generateBridgeLink = httpsCallable(functions, 'generateBridgeLink');

export const ScoutDashboard = () => {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [magicLink, setMagicLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, 'users'), 
      where('referredBy', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const referredUsers = snapshot.docs.map(doc => doc.data() as UserProfile);
      setReferrals(referredUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateMagicLink = async () => {
    if (!user) return;
    setIsGenerating(true);
    setMagicLink('');
    try {
      const result = await generateBridgeLink({ userId: user.uid });
      // @ts-ignore
      setMagicLink(result.data.link);
    } catch (error) {
      console.error("Error generating magic link:", error);
      // Handle error state in UI
    } finally {
      setIsGenerating(false);
    }
  };
  
  const gmv_total = profile?.gmv_total ?? 0;
  const success_fee = profile?.success_fee ?? 0;

  return (
    <WorkstationShell title="Scout Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Earnings and Invites */}
        <div className="lg:col-span-1 space-y-8">
          {/* Earnings Card */}
          <div className="bg-slate-800 rounded-2xl shadow-lg p-6 text-white" style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'}}>
            <h3 className="text-xl font-bold mb-4">Earnings Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total GMV Generated</span>
                <span className="text-2xl font-semibold">${gmv_total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Potential Success Fee</span>
                <span className="text-2xl font-semibold text-green-400">${success_fee.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Invite Generator */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Create Magic Link</h3>
            <p className="text-slate-600 mb-4">Generate a unique link to invite new users and earn commissions.</p>
            <button 
              onClick={handleCreateMagicLink}
              disabled={isGenerating}
              className="w-full px-6 py-3 text-white bg-slate-800 rounded-lg font-semibold hover:bg-slate-700 transition-all duration-300 disabled:bg-slate-400"
            >
              {isGenerating ? 'Generating...' : 'Create Magic Link'}
            </button>
            {magicLink && (
              <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                <p className="text-sm text-slate-700 break-all">{magicLink}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Referral Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Your Referrals</h3>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-slate-500">Loading referrals...</p>
            ) : referrals.length === 0 ? (
                <p className="text-slate-500">You haven't referred any users yet.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.map((ref, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ref.displayName || 'Unnamed User'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ref.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </WorkstationShell>
  );
};
