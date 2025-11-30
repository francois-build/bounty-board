import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Manual verification function
export const manualVerify = functions.https.onCall(async (data, context) => {
    // Check if the user is an admin
    if (context.auth?.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can perform this action.');
    }

    const { uid, accountType } = data;
    if (!uid || !accountType) {
        throw new functions.https.HttpsError('invalid-argument', 'UID and account type are required.');
    }

    try {
        await admin.firestore().collection(accountType).doc(uid).update({ emailVerified: true });
        return { message: `Successfully verified ${accountType} with UID: ${uid}` };
    } catch (error) {
        console.error('Verification failed', error);
        throw new functions.https.HttpsError('internal', 'An error occurred during verification.');
    }
});

// Impersonation function
export const impersonate = functions.https.onCall(async (data, context) => {
    if (context.auth?.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can perform this action.');
    }

    const { uid } = data;
    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'UID is required.');
    }

    try {
        const customToken = await admin.auth().createCustomToken(uid);
        return { customToken };
    } catch (error) {
        console.error('Impersonation failed', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while generating impersonation token.');
    }
});

// Force escrow funded function
export const forceEscrowFunded = functions.https.onCall(async (data, context) => {
    if (context.auth?.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can perform this action.');
    }

    const { milestoneId } = data;
    if (!milestoneId) {
        throw new functions.https.HttpsError('invalid-argument', 'Milestone ID is required.');
    }

    try {
        // This is a simplified example. You would likely have more complex logic
        // to update the milestone status in your database.
        await admin.firestore().collection('milestones').doc(milestoneId).update({ status: 'funded' });
        return { message: `Milestone ${milestoneId} has been marked as funded.` };
    } catch (error) {
        console.error('Force Escrow funding failed', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while funding the milestone.');
    }
});

// Bulk lead importer function
export const importLeads = functions.https.onCall(async (data, context) => {
    if (context.auth?.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can perform this action.');
    }

    const { leads } = data;
    if (!leads || !Array.isArray(leads)) {
        throw new functions.https.HttpsError('invalid-argument', 'An array of leads is required.');
    }

    const batch = admin.firestore().batch();
    const leadsCollection = admin.firestore().collection('leads');

    leads.forEach(lead => {
        const docRef = leadsCollection.doc(); // Auto-generate ID
        batch.set(docRef, lead);
    });

    try {
        await batch.commit();
        return { message: `Successfully imported ${leads.length} leads.` };
    } catch (error) {
        console.error('Lead import failed', error);
        throw new functions.https.HttpsError('internal', 'An error occurred during lead import.');
    }
});
