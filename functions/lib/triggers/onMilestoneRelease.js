"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMilestoneRelease = void 0;
const functions = require("firebase-functions");
exports.onMilestoneRelease = functions.firestore.document('milestones/{milestoneId}').onCreate(async (snap) => {
    const milestone = snap.data();
    // Implement your logic here
    console.log(`New milestone released: ${milestone.name}`);
});
//# sourceMappingURL=onMilestoneRelease.js.map