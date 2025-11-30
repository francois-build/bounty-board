import { z } from 'zod';

export const BountySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  reward: z.number(),
});