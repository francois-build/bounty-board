import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onUserCreated } from 'firebase-functions/v2/identity';
import { User } from '../../../packages/shared/src/schemas';
import { AuditLogEntry } from '../../../packages/shared/src/types';

// This function triggers when a new user is created.
// We're using the onUserCreated trigger from the identity API.

export const onusercreate = onUserCreated(async (event) => {
  const user = event.data;
  const uid = user.uid;
  const email = user.email;
  const displayName = user.displayName;
  const photoURL = user.photoURL;

  // Prepare the user document to be stored in Firestore
  const userDocument: User = {
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
    const logEntry: AuditLogEntry = {
      event: 'User Account Created',
      uid: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: `New user signed up with email: ${email}`,
    };
    await admin.firestore().collection('audit_log').add(logEntry);

  } catch (error) {
    console.error(`Error creating user document or audit log for UID: ${uid}`, error);
    // Optional: Add more robust error handling, like sending a notification
  }
});
