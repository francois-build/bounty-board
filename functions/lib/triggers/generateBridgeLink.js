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
exports.generateBridgeLink = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nanoid_1 = require("nanoid");
const db = admin.firestore();
/**
 * Creates a short link in Firestore.
 *
 * This function is callable and requires an authenticated user.
 *
 * @param {object} data - The data passed to the function.
 * @param {string} data.link - The destination URL to shorten.
 * @param {functions.https.CallableContext} context - The context of the function call.
 * @returns {Promise<{shortUrl: string}>} A promise that resolves with the short URL.
 */
exports.generateBridgeLink = functions
    .runWith({ minInstances: 1 })
    .https.onCall(async (data, context) => {
    // 1. Validation
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a link.");
    }
    const { link } = data;
    if (!link || typeof link !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid 'link' argument.");
    }
    const { uid } = context.auth;
    // 2. Slug Generation
    const slug = (0, nanoid_1.nanoid)(8);
    const shortUrl = `https://link.bridge.com/${slug}`;
    // 3. Persistence
    const linkDocRef = db.collection("short_links").doc(slug);
    await linkDocRef.set({
        destinationUrl: link,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        creatorId: uid,
        clicks: 0,
    });
    // 4. Return
    return { shortUrl };
});
//# sourceMappingURL=generateBridgeLink.js.map