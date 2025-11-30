
import * as functions from "firebase-functions";
import { Client } from "typesense";
import { defineSecret } from "firebase-functions/params";

// Define secrets for Typesense
const typesenseApiKey = defineSecret("TYPESENSE_API_KEY");

interface SearchParams {
  q: string;
  query_by: string;
  filter_by?: string;
  per_page?: number;
  page?: number;
}

export const searchOrPivot = functions.runWith({ secrets: [typesenseApiKey] }).https.onCall(async (data) => {
  const { q, query_by, filter_by, per_page = 20, page = 1 } = data;

  // Initialize Typesense client
  const typesense = new Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST as string,
        port: Number(process.env.TYPESENSE_PORT as string),
        protocol: process.env.TYPESENSE_PROTOCOL as string,
      },
    ],
    apiKey: typesenseApiKey.value(),
  });

  const searchParameters: SearchParams = {
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
      const pivotSearchParameters: SearchParams = {
        ...searchParameters,
        query_by: "tags", // Assuming 'tags' field contains skills
      };
      searchResults = await typesense.collections("challenges").documents().search(pivotSearchParameters);
    }

    return searchResults;
  } catch (error) {
    console.error("Error searching Typesense:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while searching.");
  }
});
