
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import { sanitizeInputs } from './sanitizeInputs';

const testEnv = fft();

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
