import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { AuditLogEntry } from '../../../packages/shared/src/types';

const client = new ImageAnnotatorClient();

export const onDeckUpload = functions.storage.object().onFinalize(async (object) => {
  // Exit if this is not a deck upload.
  if (!object.name?.startsWith('decks/')) {
    return console.log('This is not a deck, skipping moderation.');
  }

  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(object.name);

  // Check the image for unsafe content.
  const [result] = await client.safeSearchDetection(file);
  const safeSearch = result.safeSearchAnnotation;

  if (safeSearch && (safeSearch.adult === 'VERY_LIKELY' || safeSearch.racy === 'VERY_LIKELY')) {
    // Delete the image if it is unsafe.
    await file.delete();
    console.log(`Deleted unsafe deck image: ${object.name}`);

    // Log the deletion in the audit log.
    const logEntry: AuditLogEntry = {
      event: 'Blocked NSFW Deck Upload',
      uid: object.name.split('/')[1], // Extract UID from the file path
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: `Deleted unsafe deck image: ${object.name}`,
    };
    await admin.firestore().collection('audit_log').add(logEntry);

    return null;
  } else {
    console.log(`Deck image is safe: ${object.name}`);
    return null;
  }
});
