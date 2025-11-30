"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onusercreate = void 0;
const logger = require("firebase-functions/logger");
const functions_1 = require("firebase-auth/functions");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
exports.onusercreate = (0, functions_1.onUserCreated)(async (event) => {
    const { uid, email, customClaims } = event.data;
    logger.info(`New user created: ${uid} with email: ${email}`);
    const userRef = db.collection("users").doc(uid);
    try {
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            logger.warn(`User document for ${uid} already exists. Exiting.`);
            return;
        }
        let newUser;
        let auditMessage = "";
        const inviteCode = customClaims === null || customClaims === void 0 ? void 0 : customClaims.inviteCode;
        let referredBy = null;
        if (inviteCode) {
            const inviteQuery = db.collection('sys_invites').where('code', '==', inviteCode).limit(1);
            const inviteSnapshot = await inviteQuery.get();
            if (!inviteSnapshot.empty) {
                const inviteData = inviteSnapshot.docs[0].data();
                referredBy = inviteData.scoutId;
                logger.info(`User ${uid} was referred by scout ${referredBy} using code ${inviteCode}`);
                const scoutRef = db.collection('users').doc(referredBy);
                await scoutRef.update({ referralCount: firestore_1.FieldValue.increment(1) });
                const referralAuditLog = {
                    timestamp: Date.now(),
                    level: 'info',
                    message: `Successful referral attribution: New user ${uid} referred by scout ${referredBy}.`,
                    context: { newUserId: uid, scoutId: referredBy, inviteCode },
                };
                await db.collection("sys_audit_logs").add(referralAuditLog);
            }
        }
        if (email) {
            const leadsQuery = db.collection("leads").where("email", "==", email).limit(1);
            const leadsSnapshot = await leadsQuery.get();
            if (!leadsSnapshot.empty) {
                const leadDoc = leadsSnapshot.docs[0];
                const leadData = leadDoc.data();
                newUser = Object.assign(Object.assign({}, leadData), { status: 'verified', ownerId: uid, referredBy });
                await leadDoc.ref.update({ claimed: true });
                auditMessage = `User ${uid} claimed from lead ${leadDoc.id}.`;
                logger.info(auditMessage);
            }
            else {
                newUser = {
                    role: 'unknown',
                    status: 'probationary',
                    gmv_total: 0,
                    ownerId: uid,
                    referredBy,
                };
                auditMessage = `New probationary user ${uid} created.`;
                logger.info(auditMessage);
            }
        }
        else {
            newUser = {
                role: 'unknown',
                status: 'probationary',
                gmv_total: 0,
                ownerId: uid,
                referredBy,
            };
            auditMessage = `New probationary user ${uid} created without email.`;
            logger.warn(auditMessage);
        }
        await userRef.set(newUser);
        const auditLog = {
            timestamp: Date.now(),
            level: "info",
            message: auditMessage,
            context: { userId: uid, email },
        };
        await db.collection("sys_audit_logs").add(auditLog);
    }
    catch (error) {
        logger.error("Error in onUserCreate trigger:", error);
        const errorAuditLog = {
            timestamp: Date.now(),
            level: "error",
            message: "Failed to process new user creation.",
            context: { userId: uid, email, error: error instanceof Error ? error.message : String(error) },
        };
        await db.collection("sys_audit_logs").add(errorAuditLog);
    }
});
//# sourceMappingURL=onUserCreate.js.map