/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */

import { z } from 'zod';

export const RfpSchema = z.object({
 clientId: z.string().uuid(),
 challengeId: z.string().uuid(),
 expiration: z.number().min(3600), // Min 1 hour
 permissions: z.enum(['view_only', 'submit']),
});

export const ChallengeInputSchema = z.object({
  title: z.string().max(100),
  description: z.string().min(50), // Force detailed prompts
  budgetRange: z.enum(['<50k', '50k-250k', '250k+']),
  isStealth: z.boolean(),
  isBuildEvent: z.boolean().default(false), // Bridge: Build Flag
  buildEventCategory: z.string().optional(),
  publicAlias: z.string().max(50).optional(), // Field-Level Masking
  citationSnippet: z.string().optional(), // For Digital Twin grounding
});

export const UserSchema = z.strictObject({
    id: z.string(),
    role: z.enum(['client', 'startup', 'scout', 'admin']),
    status: z.enum(['probationary', 'verified']),
    gmv_total: z.number(),
    ownerId: z.string(),
});

export const ChallengeSchema = z.strictObject({
    id: z.string(),
    bounty_amount: z.number(),
    status: z.enum(['draft', 'active', 'review', 'awarded']),
    is_stealth: z.boolean(),
    ownerId: z.string(),
    isBuildEvent: z.boolean().optional().default(false),
    buildEventCategory: z.string().optional(),
});

export const SubmissionSchema = z.strictObject({
    id: z.string(),
    scout_id: z.string().optional(),
    startup_id: z.string(),
    pitch_deck_url: z.string().url(),
    ownerId: z.string(),
});