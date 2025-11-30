"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAvatarUpload = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
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
    const gcsUri = `gs://${object.bucket}/${filePath}`;
    try {
        console.log(`Scanning image for safety: ${filePath}`);
        const [result] = await visionClient.safeSearchDetection(gcsUri);
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
                timestamp: Date.now(),
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