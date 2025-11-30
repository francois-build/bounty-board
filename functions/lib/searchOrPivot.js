import * as functions from "firebase-functions";
import { Client } from "typesense";
import { defineSecret } from "firebase-functions/params";
// Define secrets for Typesense
const typesenseApiKey = defineSecret("TYPESENSE_API_KEY");
export const searchOrPivot = functions.runWith({ secrets: [typesenseApiKey] }).https.onCall(async (data) => {
    const { q, query_by, filter_by, per_page = 20, page = 1 } = data;
    // Initialize Typesense client
    const typesense = new Client({
        nodes: [
            {
                host: process.env.TYPESENSE_HOST,
                port: Number(process.env.TYPESENSE_PORT),
                protocol: process.env.TYPESENSE_PROTOCOL,
            },
        ],
        apiKey: typesenseApiKey.value(),
    });
    const searchParameters = {
        q,
        query_by,
        filter_by,
        per_page,
        page,
    };
    try {
        // Perform the initial search
        let searchResults = await typesense.collections("challenges").documents().search(searchParameters);
        // If the initial search has few results, pivot to a skill-based search
        if (searchResults.found < 5 && q.trim() !== "*") {
            const pivotSearchParameters = Object.assign(Object.assign({}, searchParameters), { query_by: "tags" });
            searchResults = await typesense.collections("challenges").documents().search(pivotSearchParameters);
        }
        return searchResults;
    }
    catch (error) {
        console.error("Error searching Typesense:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while searching.");
    }
});
//# sourceMappingURL=searchOrPivot.js.map