"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAvatarUpload = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision_1 = require("@google-cloud/vision");
// Initialize the client. Because we will assign a service account with the
// correct permissions to this function, the client will automatically
// use those credentials without needing a key file.
const visionClient = new vision_1.ImageAnnotatorClient();
exports.onAvatarUpload = functions.storage.object().onFinalize(async (object) => {
    var _a;
    if (!((_a = object.name) === null || _a === void 0 ? void 0 : _a.startsWith('avatars/'))) {
        console.log('This is not an avatar, skipping.');
        return null;
    }
    const bucket = admin.storage().bucket(object.bucket);
    const filePath = object.name;
    const file = bucket.file(filePath);
    try {
        console.log(`Scanning image for safety: ${filePath}`);
        const [result] = await visionClient.safeSearchDetection(file);
        const safeSearch = result.safeSearchAnnotation;
        if (safeSearch && (safeSearch.adult === 'VERY_LIKELY' || safeSearch.racy === 'VERY_LIKELY' || safeSearch.violence === 'VERY_LIKELY')) {
            console.log(`Deleting unsafe image: ${filePath}`);
            await file.delete();
            const uid = filePath.split('/')[1];
            // Log the event for auditing purposes
            await admin.firestore().collection('audit_log').add({
                event: 'Blocked Unsafe Avatar Upload',
                uid: uid,
                filePath: filePath,
                annotation: safeSearch,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Flag the user account
            await admin.firestore().collection('users').doc(uid).update({ 'status': 'flagged_for_review' });
            console.log(`Flagged user ${uid} for unsafe avatar.`);
            return null;
        }
        else {
            console.log(`Image ${filePath} is safe.`);
            return null;
        }
    }
    catch (error) {
        console.error(`Failed to process image ${filePath}.`, error);
        return null;
    }
});
//# sourceMappingURL=onAvatarUpload.js.map