
import * as functions from "firebase-functions";
import { Client } from "typesense";
import { defineSecret } from "firebase-functions/params";

// Define secrets for Typesense
const typesenseApiKey = defineSecret("TYPESENSE_API_KEY");

// It is assumed you have the following in your .env file:
// TYPESENSE_HOST=xxx.a1.typesense.net
// TYPESENSE_PORT=443
// TYPESENSE_PROTOCOL=https


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

export const onChallengeWrite = functions.runWith({ secrets: [typesenseApiKey] }).firestore
  .document("challenges/{challengeId}")
  .onWrite(async (change, context) => {
    const challengeId = context.params.challengeId;

    // Handle document deletion
    if (!change.after.exists) {
      try {
        await typesense.collections("challenges").documents(challengeId).delete();
        console.log(`Challenge ${challengeId} deleted from Typesense.`);
      } catch (error) {
        console.error(`Error deleting challenge ${challengeId} from Typesense:`, error);
      }
      return;
    }

    // Handle document creation or update
    const challengeData = change.after.data();
    if (challengeData) {
      try {
        await typesense
          .collections("challenges")
          .documents()
          .upsert({ id: challengeId, ...challengeData });
        console.log(`Challenge ${challengeId} indexed in Typesense.`);
      } catch (error) {
        console.error(`Error indexing challenge ${challengeId} in Typesense:`, error);
      }
    }
  });
