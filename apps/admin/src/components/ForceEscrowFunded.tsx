import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const forceEscrowFunded = httpsCallable(functions, 'forceEscrowFunded');

const ForceEscrowFunded = () => {
    const [milestoneId, setMilestoneId] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleForceFund = async () => {
        if (!milestoneId) {
            setFeedback('Please enter a Milestone ID.');
            return;
        }
        setFeedback('Forcing escrow funding...');
        try {
            const result = await forceEscrowFunded({ milestoneId });
            setFeedback(result.data.message);
        } catch (error) {
            console.error(error);
            setFeedback(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>Ledger Reconciliation: Force Escrow Funded</h2>
            <input 
                type="text" 
                value={milestoneId} 
                onChange={(e) => setMilestoneId(e.target.value)} 
                placeholder="Enter Milestone ID" 
            />
            <button onClick={handleForceFund}>Force Fund</button>
            {feedback && <p>{feedback}</p>}
        </div>
    );
};

export default ForceEscrowFunded;
