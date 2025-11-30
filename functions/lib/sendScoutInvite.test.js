"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
// Mock dependencies
const firestoreData = {};
vitest_1.vi.mock('firebase-admin', () => ({
    initializeApp: vitest_1.vi.fn(),
    firestore: () => ({
        collection: (collectionName) => ({
            doc: (docId) => {
                const path = `${collectionName}/${docId}`;
                return {
                    get: vitest_1.vi.fn().mockImplementation(async () => ({
                        exists: !!firestoreData[path],
                        data: () => firestoreData[path],
                    })),
                    set: vitest_1.vi.fn().mockImplementation(async (data, options) => {
                        if (options && options.merge) {
                            firestoreData[path] = Object.assign(Object.assign({}, (firestoreData[path] || {})), data);
                        }
                        else {
                            firestoreData[path] = data;
                        }
                    }),
                };
            },
        }),
    }),
    auth: () => ({
        getUserByEmail: vitest_1.vi.fn().mockImplementation(async (email) => {
            if (email === 'exists@example.com') {
                return { uid: 'user123', email };
            }
            throw new Error('User not found');
        }),
    }),
}));
vitest_1.vi.mock('bcrypt', () => ({
    hash: vitest_1.vi.fn().mockImplementation(async (s) => `hashed-${s}`),
}));
// Import the function *after* mocking
const sendScoutInvite_1 = require("./sendScoutInvite");
const testEnv = (0, firebase_functions_test_1.default)();
(0, vitest_1.describe)('sendScoutInvite', () => {
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
        for (const key in firestoreData) {
            delete firestoreData[key];
        }
    });
    (0, vitest_1.afterAll)(() => {
        testEnv.cleanup();
    });
    (0, vitest_1.it)('should return success for an existing user to prevent enumeration', async () => {
        const wrapped = testEnv.wrap(sendScoutInvite_1.sendScoutInvite);
        const data = { email: 'exists@example.com', scoutId: 'scout1' };
        const result = await wrapped(data);
        (0, vitest_1.expect)(result).toEqual({ success: true });
    });
    (0, vitest_1.it)('should fail silently for a suppressed email', async () => {
        const wrapped = testEnv.wrap(sendScoutInvite_1.sendScoutInvite);
        const email = 'suppressed@example.com';
        const hashedEmail = `hashed-${email}`;
        firestoreData[`suppressions/${hashedEmail}`] = { suppressed: true };
        const data = { email, scoutId: 'scout3' };
        const result = await wrapped(data);
        (0, vitest_1.expect)(result).toEqual({ success: true });
    });
    (0, vitest_1.it)('should throw a rate limit error on the 11th request in 1 minute', async () => {
        const wrapped = testEnv.wrap(sendScoutInvite_1.sendScoutInvite);
        const data = { email: 'test@example.com', scoutId: 'scout2' };
        const now = Date.now();
        firestoreData['scoutInvites/scout2'] = {
            timestamps: Array(10).fill(now - 10000)
        };
        await (0, vitest_1.expect)(wrapped(data)).rejects.toThrow('Rate limit exceeded');
    });
    (0, vitest_1.it)('should allow exactly 10 requests in 1 minute', async () => {
        const wrapped = testEnv.wrap(sendScoutInvite_1.sendScoutInvite);
        const data = { email: 'another@example.com', scoutId: 'scout4' };
        for (let i = 0; i < 10; i++) {
            await wrapped(data);
        }
        const finalState = firestoreData['scoutInvites/scout4'];
        (0, vitest_1.expect)(finalState.timestamps).toHaveLength(10);
        await (0, vitest_1.expect)(wrapped(data)).rejects.toThrow('Rate limit exceeded');
    });
});
//# sourceMappingURL=sendScoutInvite.test.js.map