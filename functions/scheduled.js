const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// The minimum number of records required to compute a metric, for k-anonymity.
const K_ANONYMITY_THRESHOLD = 5;

/**
 * A nightly cron job that calculates key platform metrics and saves them to the 'stats_daily' collection.
 */
exports.calculateDailyStats = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const stats = {};

    // 1. Red Tape Index: Average time in milliseconds to resolve disputes.
    const resolvedDisputesSnap = await db.collection('disputes')
        .where('resolvedAt', '>=', yesterday)
        .where('resolvedAt', '<', today)
        .get();

    if (resolvedDisputesSnap.size < K_ANONYMITY_THRESHOLD) {
        stats.redTapeIndex = null;
    } else {
        let totalResolutionTime = 0;
        resolvedDisputesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.resolvedAt && data.createdAt) {
                const resolutionTime = data.resolvedAt.toMillis() - data.createdAt.toMillis();
                totalResolutionTime += resolutionTime;
            }
        });
        stats.redTapeIndex = totalResolutionTime / resolvedDisputesSnap.size;
    }

    // 2. Liquidity Velocity: Total value of milestones completed in the last day.
    const completedMilestonesSnap = await db.collection('milestones')
        .where('status', '==', 'completed')
        .where('updatedAt', '>=', yesterday)
        .where('updatedAt', '<', today)
        .get();
    
    if (completedMilestonesSnap.size < K_ANONYMITY_THRESHOLD) {
        stats.liquidityVelocity = null;
    } else {
        let totalValue = 0;
        completedMilestonesSnap.docs.forEach(doc => {
            totalValue += doc.data().pilotAmount || 0;
        });
        stats.liquidityVelocity = totalValue;
    }

    // 3. Viral K-Factor: Placeholder, as a user referral system is not yet implemented.
    stats.viralKFactor = null;

    // 4. Shadow Claim Rate: The percentage of all leads in the Shadow Directory that have been claimed.
    const allLeadsSnap = await db.collection('leads').get();
    const claimedLeadsSnap = await db.collection('leads').where('claimed', '==', true).get();

    if (allLeadsSnap.empty) {
        stats.shadowClaimRate = null;
    } else {
        stats.shadowClaimRate = (claimedLeadsSnap.size / allLeadsSnap.size) * 100;
    }
    
    const statsDate = yesterday.toISOString().split('T')[0]; // e.g., '2023-10-27'
    await db.collection('stats_daily').doc(statsDate).set(stats, { merge: true });

    console.log(`Daily stats for ${statsDate} calculated and saved.`, stats);
    return null;
});
