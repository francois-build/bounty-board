import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-project-1234',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Startup Investment Platform Security Rules', () => {
  // Test Case 1: Stealth Leak
  it('should fail when an unauthenticated user tries to read a stealth startup', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'challenges/stealthChallenge'), {
        name: 'Stealth Startup',
        isStealth: true,
      });
    });
    const docRef = doc(unauthedDb, 'challenges/stealthChallenge');
    await assertFails(getDoc(docRef));
  });

  // Test Case 2: Competitor Peek
  it("should fail when a user from Startup A tries to read Startup B's private data", async () => {
    const startupAId = 'startupA';
    const startupBId = 'startupB';
    const dbA = testEnv.authenticatedContext(startupAId, { role: 'startup' }).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, `users/${startupAId}`), { role: 'startup' });
      await setDoc(doc(adminDb, `users/${startupBId}`), { role: 'startup' });
      await setDoc(doc(adminDb, `startups/${startupBId}`), { name: 'Startup B', privateData: 'secret' });
    });

    const docRef = doc(dbA, `startups/${startupBId}`);
    await assertFails(getDoc(docRef));
  });

  // Test Case 3: God Mode Hack
  it('should fail when a user tries to write to their own trustScore', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, `users/${userId}`), { role: 'startup', trustScore: 100 });
    });

    const docRef = doc(db, `users/${userId}`);
    await assertFails(setDoc(docRef, { trustScore: 999 }, { merge: true }));
  });

  // Test Case 4: Toxic Write
  it('should fail when a user tries to write to sys_audit_logs', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();

    const docRef = doc(db, 'sys_audit_logs/log1');
    await assertFails(setDoc(docRef, { action: 'test' }));
  });

  // Test Case 5: Parameter Tampering
  it('should fail when a user tries to approve their own challenge', async () => {
    const userId = 'user123';
    const challengeId = 'challenge456';
    const db = testEnv.authenticatedContext(userId, { role: 'client'}).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, `users/${userId}`), { role: 'client' });
      await setDoc(doc(adminDb, `challenges/${challengeId}`), {
        ownerId: userId,
        status: 'pending',
      });
    });

    const docRef = doc(db, `challenges/${challengeId}`);
    await assertSucceeds(setDoc(docRef, { status: 'approved' }, { merge: true }));
  });

  // Test Case 6: Challenge Hopping
  it('should fail when a startup tries to apply to the same challenge twice', async () => {
    const startupId = 'startup123';
    const challengeId = 'challenge789';
    const db = testEnv.authenticatedContext(startupId, { role: 'startup' }).firestore();
    
    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, `users/${startupId}`), { role: 'startup' });
        await setDoc(doc(adminDb, `challenges/${challengeId}`), { ownerId: 'client456' });
    });

    // First application should succeed (using startupId as document Id)
    const appRef1 = doc(db, `challenges/${challengeId}/applications/${startupId}`);
    await assertSucceeds(setDoc(appRef1, { startupId: startupId, content: 'My first application' }));

    // Second application with a different ID should fail
    const appRef2 = doc(db, `challenges/${challengeId}/applications/anotherApplication`);
    await assertFails(setDoc(appRef2, { startupId: startupId, content: 'My second try' }));
  });

  // Test Case 7: Milestone Integrity
  it('should fail when a startup tries to create a milestone for a challenge', async () => {
    const startupId = 'startup123';
    const clientId = 'client456';
    const challengeId = 'challenge789';
    const db = testEnv.authenticatedContext(startupId, { role: 'startup' }).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, `users/${startupId}`), { role: 'startup' });
        await setDoc(doc(adminDb, `users/${clientId}`), { role: 'client' });
        await setDoc(doc(adminDb, `challenges/${challengeId}`), { ownerId: clientId });
    });

    const milestoneRef = doc(db, `challenges/${challengeId}/milestones/milestone1`);
    await assertFails(setDoc(milestoneRef, { amount: 10000, description: 'First milestone' }));
  });

  it('should succeed when a client creates a milestone for their own challenge', async () => {
    const clientId = 'client456';
    const challengeId = 'challenge789';
    const db = testEnv.authenticatedContext(clientId, { role: 'client' }).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, `users/${clientId}`), { role: 'client' });
        await setDoc(doc(adminDb, `challenges/${challengeId}`), { ownerId: clientId });
    });

    const milestoneRef = doc(db, `challenges/${challengeId}/milestones/milestone1`);
    await assertSucceeds(setDoc(milestoneRef, { amount: 10000, description: 'First milestone' }));
  });

});
