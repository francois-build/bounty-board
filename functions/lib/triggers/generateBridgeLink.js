"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBridgeLink = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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