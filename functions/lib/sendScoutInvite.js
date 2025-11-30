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
exports.sendScoutInvite = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const bcrypt = __importStar(require("bcrypt"));
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