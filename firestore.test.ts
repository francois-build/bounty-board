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
      await setDoc(doc(adminDb, 'startups/stealthStartup'), {
        name: 'Stealth Startup',
        isStealth: true,
      });
    });
    const docRef = doc(unauthedDb, 'startups/stealthStartup');
    await assertFails(getDoc(docRef));
  });

  // Test Case 2: Competitor Peek
  it("should fail when a user from Startup A tries to read Startup B's private data", async () => {
    const startupAId = 'startupA';
    const startupBId = 'startupB';
    const userAAuth = { sub: 'userA', startupId: startupAId };
    const db = testEnv.authenticatedContext('userA', userAAuth).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, `startups/${startupAId}`), { name: 'Startup A' });
      await setDoc(doc(adminDb, `startups/${startupBId}`), { name: 'Startup B' });
    });

    const docRef = doc(db, `startups/${startupBId}`);
    await assertFails(getDoc(docRef));
  });

  // Test Case 3: God Mode Hack
  it('should fail when a user tries to write to their own trustScore', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();

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
    const db = testEnv.authenticatedContext(userId).firestore();

    // Admin setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, `challenges/${challengeId}`), {
        challengerId: userId,
        status: 'pending',
      });
    });

    const docRef = doc(db, `challenges/${challengeId}`);
    await assertFails(setDoc(docRef, { status: 'approved' }, { merge: true }));
  });
});