"use strict";
/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionSchema = exports.ChallengeSchema = exports.UserSchema = exports.ChallengeInputSchema = exports.RfpSchema = void 0;
const zod_1 = require("zod");
exports.RfpSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid(),
    challengeId: zod_1.z.string().uuid(),
    expiration: zod_1.z.number().min(3600), // Min 1 hour
    permissions: zod_1.z.enum(['view_only', 'submit']),
});
exports.ChallengeInputSchema = zod_1.z.object({
    title: zod_1.z.string().max(100),
    description: zod_1.z.string().min(50), // Force detailed prompts
    budgetRange: zod_1.z.enum(['<50k', '50k-250k', '250k+']),
    isStealth: zod_1.z.boolean(),
    isBuildEvent: zod_1.z.boolean().default(false), // Bridge: Build Flag
    publicAlias: zod_1.z.string().max(50).optional(), // Field-Level Masking
    citationSnippet: zod_1.z.string().optional(), // For Digital Twin grounding
});
exports.UserSchema = zod_1.z.strictObject({
    id: zod_1.z.string(),
    role: zod_1.z.enum(['client', 'startup', 'scout', 'admin']),
    status: zod_1.z.enum(['probationary', 'verified']),
    gmv_total: zod_1.z.number(),
    ownerId: zod_1.z.string(),
});
exports.ChallengeSchema = zod_1.z.strictObject({
    id: zod_1.z.string(),
    bounty_amount: zod_1.z.number(),
    status: zod_1.z.enum(['draft', 'active', 'review', 'awarded']),
    is_stealth: zod_1.z.boolean(),
    ownerId: zod_1.z.string(),
});
exports.SubmissionSchema = zod_1.z.strictObject({
    id: zod_1.z.string(),
    scout_id: zod_1.z.string().optional(),
    startup_id: zod_1.z.string(),
    pitch_deck_url: zod_1.z.string().url(),
    ownerId: zod_1.z.string(),
});
//# sourceMappingURL=schemas.js.map