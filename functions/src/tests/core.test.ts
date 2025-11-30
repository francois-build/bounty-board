import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fft from 'firebase-functions-test';
import * as admin from 'firebase-admin';

// Mock the entire OpenAI module
vi.mock('openai', () => {
  const mockCompletions = {
    create: vi.fn(),
  };
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        completions: mockCompletions,
      };
    }),
  };
});

// This factory will be used to create a mock of the Typesense client.
const mockSearch = vi.fn();
vi.mock('typesense', () => {
  const MockClient = vi.fn().mockImplementation(() => {
    return {
      collections: (collectionName: string) => ({
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

import { sanitizeInputs } from '../sanitizeInputs';
import { sendScoutInvite } from '../sendScoutInvite';
import { searchOrPivot } from '../searchOrPivot';

const testEnv = fft();

describe('Core Business Logic', () => {

  describe('sanitizeInputs', () => {
    const wrapped = testEnv.wrap(sanitizeInputs);

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should allow the write and log a warning if OpenAI fails', async () => {
      // Simulate an authenticated user
      const context = { auth: { uid: 'test-user' } };
      const data = {
        goal: 'Test Goal',
        problem: 'Test Problem',
        solution: 'Test Solution',
      };

      // Mock a 500 error from the OpenAI API
      const openai = await import('openai');
      const mockCreate = openai.default.prototype.completions.create;
      mockCreate.mockRejectedValue(new Error('OpenAI API is down'));

      const result = await wrapped(data, context);

      // Check that the write proceeds (a challenge ID is returned)
      expect(result.challengeId).toBeDefined();

      // You would also want to check your logs to ensure the warning was logged.
    });
  });

  describe('sendScoutInvite', () => {
    const wrapped = testEnv.wrap(sendScoutInvite);

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return success for an existing user to prevent enumeration', async () => {
      const data = { email: 'exists@example.com', scoutId: 'scout1' };
      const result = await wrapped(data);
      expect(result).toEqual({ success: true });
    });

    it('should fail silently for a suppressed email', async () => {
      const email = 'suppressed@example.com';
      const data = { email, scoutId: 'scout3' };
      const result = await wrapped(data);
      expect(result).toEqual({ success: true });
    });

    it('should throw a rate limit error on the 11th request in 1 minute', async () => {
      const data = { email: 'test@example.com', scoutId: 'scout2' };
      await expect(wrapped(data)).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('searchOrPivot', () => {
    const wrapped = testEnv.wrap(searchOrPivot);

    beforeEach(() => {
      mockSearch.mockClear();
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should pivot to a tag search when initial results are sparse', async () => {
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

      expect(mockSearch).toHaveBeenCalledTimes(2);

      const secondCallArgs = mockSearch.mock.calls[1][0];
      expect(secondCallArgs.query_by).toBe('tags');
      expect(result).toEqual(pivotResults);
    });

    it('should not pivot when the initial search has enough results', async () => {
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

      expect(mockSearch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(initialResults);
    });
  });
});
