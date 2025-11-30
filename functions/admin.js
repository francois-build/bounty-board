const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Middleware to check if the caller is an admin.
 * @param {object} context - The context of the function call.
 */
const ensureAdmin = (context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'This function can only be called by an administrator.'
        );
    }
};

/**
 * Manually verifies a user or scout account.
 */
exports.manualVerify = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);

    const { uid, accountType } = data; // accountType can be 'users' or 'scouts'
    if (!uid || !accountType) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "uid" and "accountType".');
    }

    try {
        await db.collection(accountType).doc(uid).update({ isVerified: true });
        return { success: true, message: `Account ${uid} in ${accountType} has been manually verified.` };
    } catch (error) {
        console.error("Manual verification failed:", error);
        throw new functions.https.HttpsError('internal', 'Could not verify account.');
    }
});

/**
 * Generates a custom sign-in token to allow an admin to impersonate a user.
 * Note: The actual sign-in is handled on the client-side.
 */
exports.impersonate = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);

    const { uid } = data;
    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "uid".');
    }

    try {
        const customToken = await admin.auth().createCustomToken(uid);
        return { customToken };
    } catch (error) {
        console.error(`Failed to create custom token for UID: ${uid}`, error);
        throw new functions.https.HttpsError('internal', 'Could not generate impersonation token.');
    }
});

/**
 * Manually marks a milestone as funded, for offline payments like wire transfers.
 */
exports.forceEscrowFunded = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);

    const { milestoneId } = data;
    if (!milestoneId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "milestoneId".');
    }

    try {
        await db.collection('milestones').doc(milestoneId).update({ status: 'funded' });
        return { success: true, message: `Milestone ${milestoneId} has been manually marked as funded.` };
    } catch (error) {
        console.error("Force escrow funding failed:", error);
        throw new functions.https.HttpsError('internal', 'Could not update milestone status.');
    }
});

/**
 * Imports a list of leads from a CSV-like structure into the 'leads' collection (Shadow Directory).
 */
exports.importLeads = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);

    const { leads } = data; // Expects an array of lead objects
    if (!leads || !Array.isArray(leads)) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with an array of "leads".');
    }

    const batch = db.batch();
    let count = 0;

    leads.forEach(lead => {
        if (lead.companyName && lead.contactEmail) {
            const docRef = db.collection('leads').doc(); // Auto-generate ID
            batch.set(docRef, { 
                ...lead, 
                claimed: false, 
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
        }
    });

    try {
        await batch.commit();
        return { success: true, message: `${count} leads successfully imported into the Shadow Directory.` };
    } catch (error) {
        console.error("Lead import failed:", error);
        throw new functions.https.HttpsError('internal', 'Failed to import leads.');
    }
});
