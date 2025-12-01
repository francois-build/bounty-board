"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOrPivot = void 0;
const admin = require("firebase-admin");
const searchOrPivot = async (data) => {
    // const { q, query_by, filter_by, industry } = data;
    const { industry } = data;
    // Assuming a search client is available, e.g., Typesense
    // const searchResults = await searchClient.collections('challenges').documents().search({
    //   q,
    //   query_by,
    //   filter_by,
    // });
    const searchResults = { found: 0, hits: [] }; // Placeholder for actual search results
    if (searchResults.found === 0 && industry) {
        const leadsSnapshot = await admin.firestore().collection('leads').where('industry', '==', industry).get();
        return {
            type: "shadow_matches",
            count: leadsSnapshot.size,
            action: "recruit_scout"
        };
    }
    return searchResults;
};
exports.searchOrPivot = searchOrPivot;
//# sourceMappingURL=search.js.map