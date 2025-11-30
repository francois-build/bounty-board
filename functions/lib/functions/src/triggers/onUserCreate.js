"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onusercreate = void 0;
const admin = require("firebase-admin");
const identity_1 = require("firebase-functions/v2/identity");
// This function triggers when a new user is created.
// We're using the onUserCreated trigger from the identity API.
exports.onusercreate = (0, identity_1.onUserCreated)(async (event) => {
    const user = event.data;
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoURL = user.photoURL;
    // Prepare the user document to be stored in Firestore
    const userDocument = {
        uid,
        email,
        displayName,
        photoURL,
        // Initialize with default values, assuming they will be updated later
        status: 'active',
        roles: ['user'],
    };
    // Create the user document in the 'users' collection
    try {
        await admin.firestore().collection('users').doc(uid).set(userDocument);
        console.log(`Successfully created user document for UID: ${uid}`);
        // Log the creation event in the audit log
        const logEntry = {
            event: 'User Account Created',
            uid: uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: `New user signed up with email: ${email}`,
        };
        await admin.firestore().collection('audit_log').add(logEntry);
    }
    catch (error) {
        console.error(`Error creating user document or audit log for UID: ${uid}`, error);
        // Optional: Add more robust error handling, like sending a notification
    }
});
//# sourceMappingURL=onUserCreate.js.map