import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const functions = getFunctions();
const impersonate = httpsCallable(functions, 'impersonate');
const auth = getAuth();

const Impersonate = () => {
    const [uid, setUid] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleImpersonate = async () => {
        if (!uid) {
            setFeedback('Please enter a UID.');
            return;
        }
        setFeedback('Generating impersonation token...');
        try {
            const result = await impersonate({ uid });
            const { customToken } = result.data;
            await signInWithCustomToken(auth, customToken);
            setFeedback(`Successfully impersonating user ${uid}. You may need to refresh the page.`);
            // You might want to redirect the admin to the main app here
        } catch (error) {
            console.error(error);
            setFeedback(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>Impersonate User</h2>
            <input 
                type="text" 
                value={uid} 
                onChange={(e) => setUid(e.target.value)} 
                placeholder="Enter User UID to Impersonate" 
            />
            <button onClick={handleImpersonate}>Impersonate</button>
            {feedback && <p>{feedback}</p>}
        </div>
    );
};

export default Impersonate;
