"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDeckUpload = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision_1 = require("@google-cloud/vision");
const client = new vision_1.ImageAnnotatorClient();
exports.onDeckUpload = functions.storage.object().onFinalize(async (object) => {
    var _a;
    // Exit if this is not a deck upload.
    if (!((_a = object.name) === null || _a === void 0 ? void 0 : _a.startsWith('decks/'))) {
        return console.log('This is not a deck, skipping moderation.');
    }
    const bucket = admin.storage().bucket(object.bucket);
    const file = bucket.file(object.name);
    const gcsUri = `gs://${object.bucket}/${object.name}`;
    // Check the image for unsafe content.
    const [result] = await client.safeSearchDetection(gcsUri);
    const safeSearch = result.safeSearchAnnotation;
    if (safeSearch && (safeSearch.adult === 'VERY_LIKELY' || safeSearch.racy === 'VERY_LIKELY')) {
        // Delete the image if it is unsafe.
        await file.delete();
        console.log(`Deleted unsafe deck image: ${object.name}`);
        // Log the deletion in the audit log.
        const logEntry = {
            event: 'Blocked NSFW Deck Upload',
            uid: object.name.split('/')[1], // Extract UID from the file path
            timestamp: Date.now(),
            details: `Deleted unsafe deck image: ${object.name}`,
        };
        await admin.firestore().collection('audit_log').add(logEntry);
        return null;
    }
    else {
        console.log(`Deck image is safe: ${object.name}`);
        return null;
    }
});
//# sourceMappingURL=onDeckUpload.js.map