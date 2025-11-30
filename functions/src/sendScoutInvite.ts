
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

admin.initializeApp();

const db = admin.firestore();

export const sendScoutInvite = functions.https.onCall(async (data, context) => {
  const { email, scoutId } = data;

  // Spam Attack Check
  const now = Date.now();
  const inviteRef = db.collection('scoutInvites').doc(scoutId);
  const inviteDoc = await inviteRef.get();
  const timestamps = inviteDoc.exists ? inviteDoc.data()?.timestamps || [] : [];
  const requestsInLastMinute = timestamps.filter((ts: number) => now - ts < 60000).length;

  if (requestsInLastMinute >= 10) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
  }

  await inviteRef.set({ timestamps: [...timestamps, now] }, { merge: true });

  // Suppression Bypass Check
  const hashedEmail = await bcrypt.hash(email, 10);
  const suppressionDoc = await db.collection('suppressions').doc(hashedEmail).get();
  if (suppressionDoc.exists) {
    return { success: true };
  }

  // Enumeration Attack Check
  const user = await admin.auth().getUserByEmail(email).catch(() => null);
  if (user) {
    return { success: true };
  }

  // TODO: Implement actual email sending logic here

  return { success: true };
});
