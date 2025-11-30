
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// For the sake of this example, we'll use a basic sanitizer.
// In a real-world application, you would use a library like DOMPurify.
const sanitize = (str: string) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const sanitizeInputs = functions.https.onCall(async (data, context) => {
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
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw new functions.https.HttpsError('internal', 'Error creating new challenge.');
  }
});
