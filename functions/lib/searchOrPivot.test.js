"use strict";
/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
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
// Import the function *after* mocking is set up
const searchOrPivot_1 = require("./searchOrPivot");
const testEnv = (0, firebase_functions_test_1.default)();
(0, vitest_1.describe)('searchOrPivot', () => {
    (0, vitest_1.beforeEach)(() => {
        // Reset mocks before each test
        mockSearch.mockClear();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('should pivot to a tag search when initial results are sparse', async () => {
        const wrapped = testEnv.wrap(searchOrPivot_1.searchOrPivot);
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
        // Expect two calls because of the pivot
        (0, vitest_1.expect)(mockSearch).toHaveBeenCalledTimes(2);
        // Check that the second call correctly pivoted to search by tags
        const secondCallArgs = mockSearch.mock.calls[1][0];
        (0, vitest_1.expect)(secondCallArgs.query_by).toBe('tags');
        (0, vitest_1.expect)(result).toEqual(pivotResults);
    });
    (0, vitest_1.it)('should not pivot when the initial search has enough results', async () => {
        const wrapped = testEnv.wrap(searchOrPivot_1.searchOrPivot);
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
        // Only one call is expected
        (0, vitest_1.expect)(mockSearch).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(result).toEqual(initialResults);
    });
    (0, vitest_1.it)('should exclude users with many irrelevant tags from pivot results', async () => {
        const wrapped = testEnv.wrap(searchOrPivot_1.searchOrPivot);
        // Mock the first, sparse search result
        mockSearch.mockResolvedValueOnce({
            found: 1,
            hits: [{ document: { id: 'initial-1' } }],
        });
        // Mock a user with 50 unrelated tags (the pivot poison)
        const poisonUser = {
            document: {
                id: 'poison-user',
                tags: Array.from({ length: 50 }, (_, i) => `unrelated-tag-${i}`),
            },
        };
        // Mock the second, pivoted search result, including the poison user
        const pivotResults = {
            found: 2,
            hits: [
                { document: { id: 'pivot-1', tags: ['Synthetic Liquidity'] } },
                poisonUser,
            ],
        };
        mockSearch.mockResolvedValueOnce(pivotResults);
        const data = {
            q: 'Synthetic Liquidity',
            query_by: 'title,description',
        };
        const result = await wrapped(data);
        // Check that the pivot search still only returns the relevant result
        (0, vitest_1.expect)(result.hits.length).toBe(1);
        (0, vitest_1.expect)(result.hits[0].document.id).toBe('pivot-1');
        (0, vitest_1.expect)(result.hits[0].document.tags).toContain('Synthetic Liquidity');
    });
});
//# sourceMappingURL=searchOrPivot.test.js.map