
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createRouter } from 'next-connect';
import { hash } from 'bcrypt';

const router = createRouter<NextApiRequest, NextApiResponse>();

const sendScoutInviteSchema = z.object({
  email: z.string().email(),
  scoutId: z.string(),
});

// In-memory stores for demonstration purposes
const users = new Set(['exists@example.com']);
const suppressions = new Set([hash('suppressed@example.com', 10)]);
const rateLimiter = new Map<string, number[]>();

router.post(async (req, res) => {
  const result = sendScoutInviteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { email, scoutId } = result.data;

  // Spam Attack Check
  const now = Date.now();
  const timestamps = rateLimiter.get(scoutId) || [];
  const requestsInLastMinute = timestamps.filter(ts => now - ts < 60000).length;

  if (requestsInLastMinute >= 10) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  rateLimiter.set(scoutId, [...timestamps, now]);

  // Suppression Bypass Check
  const hashedEmail = await hash(email, 10);
  if (suppressions.has(hashedEmail)) {
    // Fail silently on the backend
    return res.status(200).json({ success: true });
  }

  // Enumeration Attack Check
  if (users.has(email)) {
    return res.status(200).json({ success: true });
  }

  // TODO: Implement actual email sending logic here

  res.status(200).json({ success: true });
});

export default router.handler();
