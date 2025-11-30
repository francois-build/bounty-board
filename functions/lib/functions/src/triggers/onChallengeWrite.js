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
exports.onchallengewrite = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const ai_1 = require("../lib/ai");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
exports.onchallengewrite = functions.firestore
    .document('challenges/{challengeId}')
    .onWrite(async (change, context) => {
    const { challengeId } = context.params;
    // Get the new and old data
    const newData = change.after.data();
    const oldData = change.before.data();
    // We only care about new documents or documents where the description has changed
    if (!newData) {
        return null; // Document was deleted
    }
    // Trigger condition: A new challenge is created with a description but no tags.
    const isNewChallenge = !oldData && newData.status === 'draft';
    const needsEnrichment = newData.description && (!newData.tags || newData.tags.length === 0);
    if (isNewChallenge && needsEnrichment) {
        logger.info(`Challenge ${challengeId} requires AI metadata enrichment.`);
        try {
            // Call the AI service to get metadata
            const metadata = await (0, ai_1.extractChallengeMetadata)(newData.description);
            // Update the challenge document with the new metadata
            const challengeRef = db.collection('challenges').doc(challengeId);
            await challengeRef.update({
                tags: metadata.tags,
                budget_estimate: metadata.budget_estimate,
                publicAlias: metadata.public_alias,
                last_updated: Date.now(), // Update timestamp
            });
            logger.info(`Successfully enriched challenge ${challengeId} with AI metadata.`);
            return null;
        }
        catch (error) {
            logger.error(`Error enriching challenge ${challengeId}:`, error);
            return null;
        }
    }
    return null;
});
//# sourceMappingURL=onChallengeWrite.js.map