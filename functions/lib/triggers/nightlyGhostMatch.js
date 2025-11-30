"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nightlyGhostMatch = void 0;
const functions = require("firebase-functions");
exports.nightlyGhostMatch = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    // Implement your ghost matching logic here
    console.log('Running nightly ghost match');
});
//# sourceMappingURL=nightlyGhostMatch.js.map