
import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { extractChallengeMetadata } from "../lib/ai";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

export const onchallengewrite = functions.firestore
  .document('challenges/{challengeId}')
  .onWrite(async (change, context) => {
    const { challengeId } = context.params;

    const newData = change.after.data();
    const oldData = change.before.data();

    if (!newData) {
      return null; // Document was deleted
    }

    const needsEnrichment = newData.description && (!newData.tags || newData.tags.length === 0);

    const isNewChallenge = !oldData;
    const descriptionChanged = oldData && newData.description !== oldData.description;

    if ((isNewChallenge || descriptionChanged) && needsEnrichment) {
        logger.info(`Challenge ${challengeId} requires AI metadata enrichment.`);

        try {
            const metadata = await extractChallengeMetadata(newData.description);

            const challengeRef = db.collection('challenges').doc(challengeId);
            await challengeRef.update({
                tags: metadata.tags,
                budget_estimate: metadata.budget_estimate,
                publicAlias: metadata.public_alias,
                last_updated: Date.now(),
            });

            logger.info(`Successfully enriched challenge ${challengeId} with AI metadata.`);

        } catch (error) {
            logger.error(`Error enriching challenge ${challengeId}:`, error);
        }
    }

    return null;
  });
