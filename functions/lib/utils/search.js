"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOrPivot = searchOrPivot;
const firestore_1 = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
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