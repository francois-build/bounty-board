import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const manualVerify = httpsCallable(functions, 'manualVerify');

const ManualVerify = () => {
    const [uid, setUid] = useState('');
    const [accountType, setAccountType] = useState('users');
    const [feedback, setFeedback] = useState('');

    const handleVerify = async () => {
        if (!uid) {
            setFeedback('Please enter a UID.');
            return;
        }
        setFeedback('Verifying...');
        try {
            const result = await manualVerify({ uid, accountType });
            setFeedback(result.data.message);
        } catch (error) {
            console.error(error);
            setFeedback(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>Manual Account Verification</h2>
            <input 
                type="text" 
                value={uid} 
                onChange={(e) => setUid(e.target.value)} 
                placeholder="Enter User or Scout UID" 
            />
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="users">User</option>
                <option value="scouts">Scout</option>
            </select>
            <button onClick={handleVerify}>Verify Account</button>
            {feedback && <p>{feedback}</p>}
        </div>
    );
};

export default ManualVerify;
