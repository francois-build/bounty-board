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
  publicAlias: z.string().max(50).optional(), // Field-Level Masking
  citationSnippet: z.string().optional(), // For Digital Twin grounding
});

export const MatchQuerySchema = z.object({
  requiredTags: z.array(z.string()), // Maps to 'industryTags' in Firestore
  preferredTags: z.array(z.string()), // Maps to 'techStack' in User Profile
  minScore: z.number().min(50), // Minimum match score
  excludeIds: z.array(z.string()), // Previously contacted users
  pivotParams: z.object({ // Semantic Pivot Logic
      enablePivot: z.boolean().default(true),
      pivotThreshold: z.number().min(0.70), 
      requiredCompetencies: z.array(z.string()), 
  }).optional()
});

export const ScoutInviteSchema = z.object({
  founderEmail: z.string().email(),
  founderName: z.string().min(1),
  startupName: z.string().min(1),
  scoutId: z.string().uuid(),
  // Constraint: NO custom message field allowed to prevent phishing
});

export const MilestoneSchema = z.array(z.object({
  name: z.string(),
  percentage: z.number().min(1).max(100),
  description: z.string(),
  releaseCondition: z.enum(['manual_approval', 'date_passed']),
  disputeEvidence: z.object({ // For Arbitration Packaging
      repoUrl: z.string().url().optional(),
      deliverableUrl: z.string().url().optional(),
  }).optional()
})).refine((items) => items.reduce((sum, item) => sum + item.percentage, 0) === 100, {
  message: "Milestones must sum to 100%",
});

export const DiligenceLinkSchema = z.object({
  startupId: z.string().uuid(),
  expiryDays: z.number().min(1).max(30),
  showFinancials: z.boolean(),
  passwordProtected: z.boolean(),
  password: z.string().min(8).optional(),
});

export const SocialAssetSchema = z.object({
  type: z.enum(['bounty_card', 'deal_drop', 'scout_leaderboard']),
  entityId: z.string().uuid(),
  theme: z.enum(['dark', 'light']),
  privacyLevel: z.enum(['public', 'obfuscated']), // Controls if $$ are shown
});

export const WaitlistSchema = z.object({
  email: z.string().email(),
  category: z.string(), // e.g. "AgTech"
  region: z.string(), // e.g. "North Dakota"
  userRole: z.enum(['client', 'startup']),
});

export const GoldenTicketSchema = z.object({
  startupId: z.string().uuid(),
  challengeId: z.string().uuid(),
  partnerId: z.string().uuid(), // Organization
  granterUserId: z.string().uuid(), // The human user
  grantedAt: z.string().datetime(), // ISO String
});
