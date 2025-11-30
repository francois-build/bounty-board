import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const processDataExport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const storage = admin.storage();

  const collectionsToExport = ['users', 'challenges', 'submissions'];
  const exportData: { [key: string]: any[] } = {};

  for (const collectionName of collectionsToExport) {
    const snapshot = await db.collection(collectionName).where('uid', '==', uid).get();
    exportData[collectionName] = snapshot.docs.map(doc => doc.data());
  }

  const timestamp = new Date().toISOString();
  const filePath = `exports/${uid}/${timestamp}.json`;
  const file = storage.bucket().file(filePath);

  await file.save(JSON.stringify(exportData), { contentType: 'application/json' });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return { downloadUrl: url };
});
