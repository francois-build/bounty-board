
import { vi, describe, it, expect, afterAll, afterEach } from 'vitest';
import fft from 'firebase-functions-test';

// Mock dependencies
const firestoreData: { [key: string]: any } = {};

vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
  firestore: () => ({
    collection: (collectionName: string) => ({
      doc: (docId: string) => {
        const path = `${collectionName}/${docId}`;
        return {
          get: vi.fn().mockImplementation(async () => ({
            exists: !!firestoreData[path],
            data: () => firestoreData[path],
          })),
          set: vi.fn().mockImplementation(async (data: any, options: any) => {
            if (options && options.merge) {
              firestoreData[path] = { ...(firestoreData[path] || {}), ...data };
            } else {
              firestoreData[path] = data;
            }
          }),
        };
      },
    }),
  }),
  auth: () => ({
    getUserByEmail: vi.fn().mockImplementation(async (email: string) => {
      if (email === 'exists@example.com') {
        return { uid: 'user123', email };
      }
      throw new Error('User not found');
    }),
  }),
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockImplementation(async (s: string) => `hashed-${s}`),
}));

// Import the function *after* mocking
import { sendScoutInvite } from './sendScoutInvite';

const testEnv = fft();

describe('sendScoutInvite', () => {

  afterEach(() => {
    vi.clearAllMocks();
    for (const key in firestoreData) {
      delete firestoreData[key];
    }
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it('should return success for an existing user to prevent enumeration', async () => {
    const wrapped = testEnv.wrap(sendScoutInvite);
    const data = { email: 'exists@example.com', scoutId: 'scout1' };
    const result = await wrapped(data);
    expect(result).toEqual({ success: true });
  });

  it('should fail silently for a suppressed email', async () => {
    const wrapped = testEnv.wrap(sendScoutInvite);
    const email = 'suppressed@example.com';
    const hashedEmail = `hashed-${email}`;
    firestoreData[`suppressions/${hashedEmail}`] = { suppressed: true };

    const data = { email, scoutId: 'scout3' };
    const result = await wrapped(data);

    expect(result).toEqual({ success: true });
  });

  it('should throw a rate limit error on the 11th request in 1 minute', async () => {
    const wrapped = testEnv.wrap(sendScoutInvite);
    const data = { email: 'test@example.com', scoutId: 'scout2' };
    const now = Date.now();
    
    firestoreData['scoutInvites/scout2'] = {
        timestamps: Array(10).fill(now - 10000)
    };
    
    await expect(wrapped(data)).rejects.toThrow('Rate limit exceeded');
  });
  
  it('should allow exactly 10 requests in 1 minute', async () => {
      const wrapped = testEnv.wrap(sendScoutInvite);
      const data = { email: 'another@example.com', scoutId: 'scout4' };
      
      for (let i = 0; i < 10; i++) {
          await wrapped(data);
      }

      const finalState = firestoreData['scoutInvites/scout4'];
      expect(finalState.timestamps).toHaveLength(10);
      
      await expect(wrapped(data)).rejects.toThrow('Rate limit exceeded');
  });

});
