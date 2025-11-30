# Canvas: Bridge QA & Red Team Testing Prompts

_Use these prompts immediately after the Agent finishes a specific Build Phase to verify integrity. These are adversarial prompts designed to break the application._

## Phase 1: Foundation Tests (Post-Scaffolding)

**Test Prompt 2: Dependency & Monorepo Graph Check**

> "Perform a structural integrity audit on the Monorepo.
> 
> 1. **Circular Dependency Check:** Analyze `package.json` files. Does `packages/shared` import anything from `apps/*`? (It should not).
>     
> 2. **Phantom Dependency Check:** Scan source code for imports that are not declared in `package.json`.
>     
> 3. **Secret Leak Check:** Scan the `apps/web` build config. Are there any environment variables NOT prefixed with `VITE_` or `NEXT_PUBLIC_` being exposed? If `STRIPE_SECRET_KEY` is reachable by the client, stop and fix it.
>     
> 4. **Type Boundary Test:** Create a test file in `apps/web` that attempts to import a Node.js-only library (like `fs` or `firebase-admin`) from `packages/shared`. Verify the build fails."
>     

**Test Prompt 3: Schema Validity**

> "Stress test the Zod schemas in `packages/shared`.
> 
> 1. **Completeness:** Does `ChallengeInputSchema` include the `publicAlias` field?
>     
> 2. **Type Safety:** Run a script to generate TypeScript types from these Zod schemas (`z.infer`) and confirm they export correctly.
>     
> 3. **Fuzzing:** Generate a test that feeds `ChallengeInputSchema` with massive strings, HTML tags, and SQL injection patterns. Verify it throws specific validation errors for all of them."
>     

## Phase 2: Backend Security Tests (Post-Security)

**Test Prompt 4: Security Rules Penetration Test**

> "Generate a Firebase Emulator test script (`firestore.test.ts`) to attempt the following exploits:
> 
> 1. **The 'Stealth' Leak:** As an unauthenticated user, try to read a document in `challenges` where `isStealth: true`. (Must Fail).
>     
> 2. **The 'Competitor' Peek:** As 'Startup A', try to read an application belonging to 'Startup B'. (Must Fail).
>     
> 3. **The 'God Mode' Hack:** As a regular user, try to write to `trustScore` on your own profile. (Must Fail).
>     
> 4. **The 'Toxic' Write:** Try to create a log in `sys_audit_logs`. (Must Fail - only Admin SDK can write here).
>     
> 5. **The 'Parameter Tampering' Attack:** Try to update a Challenge status to `approved` without being the owner. (Must Fail)."
>     

**Test Prompt 5: Cloud Function Resilience**

> "Review the `functions` code for infrastructure risks.
> 
> 1. **Cold Start:** Did you explicitly set `minInstances: 1` for the `generateBridgeLink` function?
>     
> 2. **Search Deletion:** Look at the `onWrite` trigger for Typesense. Does it handle the case where `!change.after.exists` (Deletion)? If not, add code to delete the object from the search index.
>     
> 3. **Secrets Audit:** Are API keys (Resend, Typesense) accessed via `defineSecret` or `process.env`? If they are hardcoded strings, delete them immediately."
>     

## Phase 3: Identity Tests (Post-Auth)

**Test Prompt 6: Auth Race Condition Check**

> "Review the `onUserCreate` logic.
> 
> 1. **The 'Fast Login' Bug:** Create a test where a user logs in immediately on the frontend, but the `onUserCreate` function takes 5 seconds to run. Does the UI crash?
>     
> 2. **Fix:** Ensure the Frontend `useAuth` hook includes a polling mechanism or a 'Profile Loading' state that waits for the Firestore document to exist before rendering the Dashboard. Write that frontend guard clause now."
>     

**Test Prompt 7/8: Invite Logic Verification**

> "Attack the `sendScoutInvite` function.
> 
> 1. **Enumeration Attack:** If I call this function with an email that _already exists_, what does it return? It MUST return `success` to the client to prevent user enumeration.
>     
> 2. **Spam Attack:** Write a test loop that calls the function 20 times in 1 minute for the same Scout ID. Verify the 11th request throws a Rate Limit error.
>     
> 3. **Suppression Bypass:** Attempt to send an invite to an email hash present in the `suppressions` collection. Verify it silently fails or returns success without sending."
>     

## Phase 4: Marketplace Tests (Post-Core)

**Prompt 9/10: Data Privacy & Resilience**

> "Analyze the Challenge Creation and Feed logic.
> 
> 1. **The 'Public Alias' Test:** In the Frontend component, mock a 'Logged Out' state. Does the rendered HTML contain the real `clientName` anywhere in the DOM? (It must not).
>     
> 2. **The 'OpenAI Down' Scenario:** Mock a 500 error from the OpenAI API inside `sanitizeInputs`. Does the write proceed with a warning, or does it block the user? (It should allow the write).
>     
> 3. **Optimistic UI:** Show me the React Query `onMutate` handler that inserts the new Challenge into the cache immediately.
>     
> 4. **Pivot Poisoning:** Create a test user with 50 distinct, unrelated tags in their profile. Ensure they are EXCLUDED from the 'Synthetic Liquidity' pivot results."
>     

## Phase 5: Financial Tests (Post-Stripe)

**Test Prompt 11: Money Logic Audit (CRITICAL)**

> "Audit the Stripe integration code for financial flaws.
> 
> 1. **The 'Zombie Payout':** Look at the Milestone Release function. Is the Stripe API call inside a `runTransaction` block? (It SHOULD NOT be). It should be triggered by an async function responding to a Firestore state change.
>     
> 2. **Double-Spend Attack:** Send the same `payment_intent.succeeded` webhook payload twice to the endpoint. Verify via logs that the second attempt exits early due to the Idempotency Key check.
>     
> 3. **Signature Bypass:** Send a webhook with a valid payload but an invalid `stripe-signature` header. Verify it throws a 400 error.
>     
> 4. **Cleared Funds:** Simulate a Milestone Release where the Payment Intent status is `processing` (not `succeeded`). Verify the transfer request is blocked."
>     

## Phase 6: Viral Tool Tests (Post-Link)

**Test Prompt 12: Performance & Security**

> "Review the `apps/tool` (Bridge Link) code.
> 
> 1. **Bundle Size:** Verify `firebase/firestore/lite` is used. Run a bundle analyzer check.
>     
> 2. **Malicious Upload:** Upload a file named `exploit.exe` renamed to `deck.pdf`. Does the parsing logic fail gracefully or crash the server?
>     
> 3. **Session Bleed:** Ensure this app uses Ephemeral Auth (Anonymous) and does not try to read cookies from the main `app` domain.
>     
> 4. **DDoS Protection:** Verify ReCAPTCHA Enterprise token validation happens _before_ any file processing logic."
>     

## Phase 7: Governance Tests (Post-God Mode)

**Test Prompt 13/14: Privacy & Compliance**

> "Review the Aggregation and Admin tools.
> 
> 1. **k-Anonymity:** In the `stats_daily` generator, show me the logic that returns `null` if the sample size is < 5.
>     
> 2. **Visual Moderation:** Upload an image with NSFW content (use a test sample). Verify `onUserCreate` flags it and prevents it from being public.
>     
> 3. **Crypto-Shredding:** Verify that PII in the audit logs is stored via a reference ID to the `audit_payloads` collection, not raw text."
>     

## Phase 8: Final System Check

**Test Prompt 15: Chaos Engineering**

> "Simulate total system failure scenarios.
> 
> 1. **Config Missing:** Assume `process.env.NEXT_PUBLIC_ALGOLIA_KEY` is undefined. Does the feed crash, or fallback to Firestore?
>     
> 2. **AI Offline:** Assume `process.env.ENABLE_AI` is false. Does the 'Upload Deck' button disappear gracefully?
>     
> 3. **Status:** Ensure the `SystemHealth` middleware checks the API `/health` endpoint on load.
>     
> 4. **Self-Dealing:** Attempt to have a Scout (User A) invite themselves (User A's email) or a user with the same IP. Verify the payout logic flags this."
>