
import * as functions from 'firebase-functions';

export const onMilestoneRelease = functions.firestore.document('milestones/{milestoneId}').onCreate(async (snap, context) => {
    const milestone = snap.data();

    // Implement your logic here
    console.log(`New milestone released: ${milestone.name}`);
});
