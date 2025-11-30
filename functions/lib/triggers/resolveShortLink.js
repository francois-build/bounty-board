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
exports.resolveShortLink = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Resolves a short link and redirects the user.
 *
 * This function is triggered by an HTTP request.
 */
exports.resolveShortLink = functions.https.onRequest(async (req, res) => {
    // 1. Parse
    const slug = req.path.substring(1); // Remove leading '/'
    if (!slug) {
        res.status(404).send("Link not found");
        return;
    }
    // 2. Lookup
    const linkDocRef = db.collection("short_links").doc(slug);
    const doc = await linkDocRef.get();
    // 3. Logic
    if (!doc.exists) {
        res.status(404).send("Link not found");
        return;
    }
    const data = doc.data();
    if (!data || !data.destinationUrl) {
        res.status(500).send("Invalid link data");
        return;
    }
    // Increment clicks asynchronously
    linkDocRef.update({ clicks: admin.firestore.FieldValue.increment(1) })
        .catch(err => console.error("Failed to increment clicks", err));
    // Redirect
    res.redirect(301, data.destinationUrl);
});
//# sourceMappingURL=resolveShortLink.js.map