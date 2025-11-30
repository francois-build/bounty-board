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
exports.sanitizeInputs = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// For the sake of this example, we'll use a basic sanitizer.
// In a real-world application, you would use a library like DOMPurify.
const sanitize = (str) => {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
exports.sanitizeInputs = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { goal, problem, solution, budget, tags, startDate, endDate } = data;
    if (!goal || !problem || !solution) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with arguments "goal", "problem", and "solution".');
    }
    const sanitizedGoal = sanitize(goal);
    const sanitizedProblem = sanitize(problem);
    const sanitizedSolution = sanitize(solution);
    try {
        const challengeRef = await admin.firestore().collection('challenges').add({
            ownerId: context.auth.uid,
            goal: sanitizedGoal,
            problem: sanitizedProblem,
            solution: sanitizedSolution,
            budget: budget || 0,
            tags: tags || [],
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isDraft: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { challengeId: challengeRef.id };
    }
    catch (error) {
        console.error('Error creating challenge:', error);
        throw new functions.https.HttpsError('internal', 'Error creating new challenge.');
    }
});
//# sourceMappingURL=sanitizeInputs.js.map