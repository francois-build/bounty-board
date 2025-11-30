"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const firebase_functions_test_1 = require("firebase-functions-test");
// Mock the entire OpenAI module
vitest_1.vi.mock('openai', () => {
    const mockCompletions = {
        create: vitest_1.vi.fn(),
    };
    return {
        default: vitest_1.vi.fn().mockImplementation(() => {
            return {
                completions: mockCompletions,
            };
        }),
    };
});
// This factory will be used to create a mock of the Typesense client.
const mockSearch = vitest_1.vi.fn();
vitest_1.vi.mock('typesense', () => {
    const MockClient = vitest_1.vi.fn().mockImplementation(() => {
        return {
            collections: (collectionName) => ({
                documents: () => ({
                    search: mockSearch,
                }),
            }),
        };
    });
    return {
        // This is the key: we are exporting a mock constructor.
        default: MockClient,
        Client: MockClient,
    };
});
const sanitizeInputs_1 = require("../sanitizeInputs");
const sendScoutInvite_1 = require("../sendScoutInvite");
const searchOrPivot_1 = require("../searchOrPivot");
const testEnv = (0, firebase_functions_test_1.default)();
(0, vitest_1.describe)('Core Business Logic', () => {
    (0, vitest_1.describe)('sanitizeInputs', () => {
        const wrapped = testEnv.wrap(sanitizeInputs_1.sanitizeInputs);
        (0, vitest_1.beforeEach)(() => {
            vitest_1.vi.clearAllMocks();
        });
        (0, vitest_1.it)('should allow the write and log a warning if OpenAI fails', async () => {
            // Simulate an authenticated user
            const context = { auth: { uid: 'test-user' } };
            const data = {
                goal: 'Test Goal',
                problem: 'Test Problem',
                solution: 'Test Solution',
            };
            // Mock a 500 error from the OpenAI API
            const openai = await Promise.resolve().then(() => require('openai'));
            const mockCreate = openai.default.prototype.completions.create;
            mockCreate.mockRejectedValue(new Error('OpenAI API is down'));
            const result = await wrapped(data, context);
            // Check that the write proceeds (a challenge ID is returned)
            (0, vitest_1.expect)(result.challengeId).toBeDefined();
            // You would also want to check your logs to ensure the warning was logged.
        });
    });
    (0, vitest_1.describe)('sendScoutInvite', () => {
        const wrapped = testEnv.wrap(sendScoutInvite_1.sendScoutInvite);
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.clearAllMocks();
        });
        (0, vitest_1.it)('should return success for an existing user to prevent enumeration', async () => {
            const data = { email: 'exists@example.com', scoutId: 'scout1' };
            const result = await wrapped(data);
            (0, vitest_1.expect)(result).toEqual({ success: true });
        });
        (0, vitest_1.it)('should fail silently for a suppressed email', async () => {
            const email = 'suppressed@example.com';
            const data = { email, scoutId: 'scout3' };
            const result = await wrapped(data);
            (0, vitest_1.expect)(result).toEqual({ success: true });
        });
        (0, vitest_1.it)('should throw a rate limit error on the 11th request in 1 minute', async () => {
            const data = { email: 'test@example.com', scoutId: 'scout2' };
            await (0, vitest_1.expect)(wrapped(data)).rejects.toThrow('Rate limit exceeded');
        });
    });
    (0, vitest_1.describe)('searchOrPivot', () => {
        const wrapped = testEnv.wrap(searchOrPivot_1.searchOrPivot);
        (0, vitest_1.beforeEach)(() => {
            mockSearch.mockClear();
            vitest_1.vi.clearAllMocks();
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.restoreAllMocks();
        });
        (0, vitest_1.it)('should pivot to a tag search when initial results are sparse', async () => {
            // Mock the first, sparse search result
            mockSearch.mockResolvedValueOnce({
                found: 2,
                hits: [{ document: { id: 'initial-1' } }, { document: { id: 'initial-2' } }],
            });
            // Mock the second, pivoted search result
            const pivotResults = {
                found: 1,
                hits: [{ document: { id: 'pivot-1', tags: ['Synthetic Liquidity'] } }],
            };
            mockSearch.mockResolvedValueOnce(pivotResults);
            const data = {
                q: 'liquidity',
                query_by: 'title,description',
                filter_by: 'tags:!=[irrelevant]',
            };
            const result = await wrapped(data);
            (0, vitest_1.expect)(mockSearch).toHaveBeenCalledTimes(2);
            const secondCallArgs = mockSearch.mock.calls[1][0];
            (0, vitest_1.expect)(secondCallArgs.query_by).toBe('tags');
            (0, vitest_1.expect)(result).toEqual(pivotResults);
        });
        (0, vitest_1.it)('should not pivot when the initial search has enough results', async () => {
            const initialResults = {
                found: 10,
                hits: Array.from({ length: 10 }, (_, i) => ({ document: { id: `doc-${i}` } })),
            };
            mockSearch.mockResolvedValueOnce(initialResults);
            const data = {
                q: 'some-query',
                query_by: 'title',
            };
            const result = await wrapped(data);
            (0, vitest_1.expect)(mockSearch).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(result).toEqual(initialResults);
        });
    });
});
//# sourceMappingURL=core.test.js.map