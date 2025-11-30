
import * as logger from "firebase-functions/logger";
import { onUserCreated } from "firebase-auth/functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { User } from "../../../../packages/shared/src/schemas";
import { AuditLogEntry } from "../../../../packages/shared/src/types";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

export const onusercreate = onUserCreated(async (event) => {
  const { uid, email, customClaims } = event.data;
  logger.info(`New user created: ${uid} with email: ${email}`);

  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      logger.warn(`User document for ${uid} already exists. Exiting.`);
      return;
    }

    let newUser: Omit<User, 'id'>;
    let auditMessage = "";

    const inviteCode = customClaims?.inviteCode as string | undefined;
    let referredBy: string | null = null;

    if (inviteCode) {
      const inviteQuery = db.collection('sys_invites').where('code', '==', inviteCode).limit(1);
      const inviteSnapshot = await inviteQuery.get();
      if (!inviteSnapshot.empty) {
        const inviteData = inviteSnapshot.docs[0].data();
        referredBy = inviteData.scoutId;
        logger.info(`User ${uid} was referred by scout ${referredBy} using code ${inviteCode}`);
        
        const scoutRef = db.collection('users').doc(referredBy!);
        await scoutRef.update({ referralCount: FieldValue.increment(1) });

        const referralAuditLog: AuditLogEntry = {
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
        
        newUser = {
          ...leadData,
          status: 'verified',
          ownerId: uid,
          referredBy,
        } as Omit<User, 'id'>;
        
        await leadDoc.ref.update({ claimed: true });
        auditMessage = `User ${uid} claimed from lead ${leadDoc.id}.`;
        logger.info(auditMessage);
      } else {
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
    } else {
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

    const auditLog: AuditLogEntry = {
      timestamp: Date.now(),
      level: "info",
      message: auditMessage,
      context: { userId: uid, email },
    };
    await db.collection("sys_audit_logs").add(auditLog);

  } catch (error) {
    logger.error("Error in onUserCreate trigger:", error);
    const errorAuditLog: AuditLogEntry = {
        timestamp: Date.now(),
        level: "error",
        message: "Failed to process new user creation.",
        context: { userId: uid, email, error: error instanceof Error ? error.message : String(error) },
    };
    await db.collection("sys_audit_logs").add(errorAuditLog);
  }
});
