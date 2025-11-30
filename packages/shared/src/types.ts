/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */

import { z } from 'zod';
import {
  RfpSchema,
  ChallengeInputSchema,
  MatchQuerySchema,
  ScoutInviteSchema,
  MilestoneSchema,
  DiligenceLinkSchema,
  SocialAssetSchema,
  WaitlistSchema,
  GoldenTicketSchema,
} from './schemas';

export type Rfp = z.infer<typeof RfpSchema>;
export type ChallengeInput = z.infer<typeof ChallengeInputSchema>;
export type MatchQuery = z.infer<typeof MatchQuerySchema>;
export type ScoutInvite = z.infer<typeof ScoutInviteSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type DiligenceLink = z.infer<typeof DiligenceLinkSchema>;
export type SocialAsset = z.infer<typeof SocialAssetSchema>;
export type Waitlist = z.infer<typeof WaitlistSchema>;
export type GoldenTicket = z.infer<typeof GoldenTicketSchema>;
