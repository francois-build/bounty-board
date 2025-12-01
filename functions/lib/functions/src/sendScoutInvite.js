"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScoutInvite = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
admin.initializeApp();
const db = admin.firestore();
exports.sendScoutInvite = functions.https.onCall(async (data) => {
    var _a;
    const { email, scoutId } = data;
    // Spam Attack Check
    const now = Date.now();
    const inviteRef = db.collection('scoutInvites').doc(scoutId);
    const inviteDoc = await inviteRef.get();
    const timestamps = inviteDoc.exists ? ((_a = inviteDoc.data()) === null || _a === void 0 ? void 0 : _a.timestamps) || [] : [];
    const requestsInLastMinute = timestamps.filter((ts) => now - ts < 60000).length;
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
//# sourceMappingURL=sendScoutInvite.js.map