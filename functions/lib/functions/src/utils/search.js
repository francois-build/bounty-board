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
exports.searchOrPivot = searchOrPivot;
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
/**
 * Searches for challenges, pivoting the query if initial results are too few.
 * @param {UserQuery} query The user's search query.
 * @returns {Promise<SearchResult>} The search results and a flag indicating if a pivot occurred.
 */
async function searchOrPivot(query) {
    let finalResults = [];
    let isPivot = false;
    // Attempt 1: Exact Match
    if (query.tags && query.tags.length > 0) {
        let firestoreQuery = db.collection('challenges');
        // Apply tag filters
        firestoreQuery = firestoreQuery.where('tags', 'array-contains-any', query.tags);
        // Apply budget filter if provided
        if (query.budget) {
            firestoreQuery = firestoreQuery.where('budget_estimate', '<=', query.budget);
        }
        const snapshot = await firestoreQuery.get();
        finalResults = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        logger.info(`Exact search for tags [${query.tags.join(', ')}] found ${finalResults.length} results.`);
    }
    // Check: If results are insufficient, pivot the search
    if (finalResults.length < 3 && query.tags && query.tags.length > 1) {
        isPivot = true;
        logger.info('Pivoting search due to insufficient results.');
        // Attempt 2: Pivot by dropping the last tag
        const pivotedTags = query.tags.slice(0, -1);
        let pivotQuery = db.collection('challenges')
            .where('tags', 'array-contains-any', pivotedTags);
        if (query.budget) {
            // Relax budget by 20%
            const relaxedBudget = query.budget * 1.2;
            pivotQuery = pivotQuery.where('budget_estimate', '<=', relaxedBudget);
        }
        const pivotSnapshot = await pivotQuery.get();
        finalResults = pivotSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        logger.info(`Pivoted search for tags [${pivotedTags.join(', ')}] found ${finalResults.length} results.`);
    }
    return {
        results: finalResults,
        isPivot: isPivot,
    };
}
//# sourceMappingURL=search.js.map