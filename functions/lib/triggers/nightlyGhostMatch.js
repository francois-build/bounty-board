import * as functions from 'firebase-functions';
export const nightlyGhostMatch = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    // Implement your ghost matching logic here
    console.log('Running nightly ghost match');
});
//# sourceMappingURL=nightlyGhostMatch.js.map