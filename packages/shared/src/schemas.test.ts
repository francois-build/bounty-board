/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */

import { describe, it, expect } from 'vitest';
import { ChallengeInputSchema } from './schemas';

describe('ChallengeInputSchema Fuzzing', () => {
  const validData = {
    title: 'Valid Title',
    description: 'This is a valid description with more than fifty characters to pass validation.',
    budgetRange: '<50k',
    isStealth: false,
  };

  it('should fail with a title that is too long (massive string)', () => {
    const invalidData = { ...validData, title: 'a'.repeat(1000) };
    const result = ChallengeInputSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should pass with HTML tags in the title, as Zod does not sanitize by default', () => {
    const dataWithHtml = { ...validData, title: '<h1>Title with HTML</h1>' };
    const result = ChallengeInputSchema.safeParse(dataWithHtml);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('<h1>Title with HTML</h1>');
    }
  });

  it('should pass with SQL injection in the title, as Zod does not sanitize by default', () => {
    const dataWithSql = { ...validData, title: '\' OR 1=1 --' };
    const result = ChallengeInputSchema.safeParse(dataWithSql);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('\' OR 1=1 --');
    }
  });
});
