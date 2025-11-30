# Canvas: Bridge Application Builder Prompts

## Phase 0: Context Injection & Alignment

**Prompt 1: System Initialization**

> I am uploading 8 architectural documents for a project called 'Bridge'.
> 
> 1. `agent_context_wrapper.md` (Your core operating constraints & Zod Schemas)
>     
> 2. `project_outline.md` (The feature scope and user roles)
>     
> 3. `technical_specification.md` (Security & Performance rules)
>     
> 4. `user_flow.md` (UX flows)
>     
> 5. `monetization_matrix.md` (Business logic and permissions)
>     
> 6. `go_to_market_strategy.md` (Growth logic)
>     
> 7. `resilience_strategy.md` (Fallback UIs & Manual Overrides)
>     
> 8. `brand_guidelines.md` (Visual Tokens & Design System)
>     
> 
> Action: Analyze these files. Confirm you understand that you must act as the Lead Architect defined in agent_context_wrapper.md.
> 
> Constraint: You must strictly adhere to the 'Prioritization Protocol' in the instructions. Security and Privacy rules in the Tech Spec override all other feature requests.
> 
> Output: Briefly summarize the 5 Mandatory External Tools you will need to integrate based on the instructions and confirm you understand the Multi-Site architecture.

## Phase 1: The Monorepo Foundation

**Prompt 2: Scaffolding & Directory Structure**

> Initialize the project repository structure using the "Multi-Site Monorepo" directive.
> 
> 1. **Workspace:** Create a Turborepo/Nx workspace.
>     
> 2. **Frontends:** Scaffold 3 distinct workspaces:
>     
>     - `apps/marketing` (Next.js/Astro for SEO)
>         
>     - `apps/web` (Vite React for the Core Platform)
>         
>     - `apps/tool` (Preact/Lite React for the Viral 'Bridge Link')
>         
> 3. **Backends:** Scaffold 2 backend workspaces:
>     
>     - `packages/shared` (For Zod schemas, Types, and Constants)
>         
>     - `functions` (Firebase Cloud Functions v2)
>         
> 4. **Meta:** Initialize a `LICENSE` file as Proprietary/Closed Source.
>     
> 5. **Config:** Configure `firebase.json` to support multi-site hosting targets (`app`, `www`, `link`).
>     
> 6. **Wiring (CRITICAL):** Explicitly configure `tsconfig.json` paths (`"@bridge/shared/*"`) and `vite.config.ts` aliases so `apps/web` can import types from `packages/shared`. Do not skip this step.
>     

**Prompt 3: The Shared Brain (Schemas & Design Tokens)**

> In the `packages/shared` workspace, define the core data structures to prevent hallucination later.
> 
> 1. **Zod Schemas:** Implement all schemas defined in Section 3 of `agent_context_wrapper.md` (RfpSchema, ChallengeInputSchema, MatchQuerySchema, ScoutInviteSchema, MilestoneSchema, DiligenceLinkSchema, SocialAssetSchema, WaitlistSchema, GoldenTicketSchema).
>     
> 2. **Design Tokens:** Export a Tailwind config preset containing the 'Neumorphic Trust' color palette, fonts (Inter/JetBrains Mono), and visual physics defined in `brand_guidelines.md`.
>     
> 3. **Copyright:** Ensure every file generated starts with the mandatory Copyright Header defined in Section 9 of the Instructions.
>     
> 4. **Localization:** Create the initial `en.json` file in `packages/shared` to hold all UI strings (no hardcoded text).
>     

## Phase 2: The Secure Backend Core

**Prompt 4: Firestore Security & Indexing**

> Write the firestore.rules and firestore.indexes.json files.
> 
> Constraint: You must strictly follow Section 1A ('Trustworthiness') of technical_specification.md.
> 
> 1. Implement strict RBAC for the 6 User Roles.
>     
> 2. Ensure 'Stealth Mode' challenges cannot be read by unauthenticated users.
>     
> 3. Ensure 'Compliance Data' is only readable by the owner or an NDA-signed Client.
>     
> 4. Define the Composite Indexes required for the Marketplace Feed.
>     
> 5. **Validation:** Explain how your rules prevent a Startup from seeing another Startup's application details.
>     

**Prompt 5: Cloud Functions Infrastructure & Config**

> Set up the `functions` directory using a Modular Architecture (not a monolithic `index.ts`).
> 
> **Interactive Configuration:** Before writing code, STOP and ask me for the **Resend API Key** and **Typesense/Algolia API Keys**. Provide instructions on where to find them.
> 
> 1. **Triggers:** Scaffold `onUserCreate`, `generateBridgeLink`, `nightlyGhostMatch`, `sendScoutInvite`, and `onMilestoneRelease`.
>     
> 2. **Performance:** Use `minInstances: 1` for the AI Drafter and Invite functions to prevent cold starts.
>     
> 3. **External Mandate:** Configure the **Resend** or **SendGrid** client for email logic with Domain Segmentation (`notifications@` vs `hello@`).
>     
> 4. **External Mandate (Search Sync):** Setup an `onWrite` trigger to sync Challenge data to **Typesense/Algolia**.
>     
>     - **CRITICAL:** You must handle the **Delete** case. If `!change.after.exists`, remove the object from the Search Index to prevent broken links.
>         
> 5. **Match Logic:** Implement `nightlyGhostMatch` using **Weighted Tag Scoring** (Industry + Tech Stack overlap), NOT vector search.
>     

**Prompt 5b: Data Seeding (The "Cold Start" Fix)**

> Create a `scripts/seed_local_db.ts` utility.
> 
> 1. **Logic:** This script must populate the local Firestore Emulator with:
>     
>     - 50 Mock Challenges (Mix of Stealth/Public).
>         
>     - 100 Mock User Profiles (Startups, Scouts).
>         
>     - 10 Mock "Shadow Profiles" in the `leads` collection (for testing Claiming).
>         
> 2. **The First Admin:** The script must create a specific user (e.g., `admin@bridge.com`) and manually force their role to `admin` so I can access God Mode immediately in dev.
>     

## Phase 3: Identity & Onboarding

**Prompt 6: Auth & User Creation**

> Implement the Authentication logic in `apps/web`.
> 
> **Interactive Configuration:** STOP and ask me for the **OAuth Client IDs/Secrets** for Google, LinkedIn, and Microsoft. Explain how to configure the Callback URLs in the Firebase Console.
> 
> 1. **Providers:** Support Google, LinkedIn (OIDC), and Microsoft (SSO) as defined in the Outline.
>     
> 2. **Backend:** Implement the `onUserCreate` Cloud Function. It must:
>     
>     - Create the User Document (or claim a Shadow Profile from `leads` collection per Tech Spec Section 10).
>         
>     - Assign the default `probationaryStatus: true` (per Tech Spec).
>         
>     - Assign a default Avatar.
>         
> 3. **Frontend Resilience (CRITICAL):** The `onUserCreate` trigger is asynchronous. The Frontend MUST implement a **Loading State** that polls Firestore for the user document after Auth login. Do NOT assume the profile exists immediately.
>     
> 4. **Invite System:** Implement the `sendScoutInvite` Cloud Function (Callable).
>     
>     - **Constraint:** Verify sender is a registered Scout.
>         
>     - **Constraint:** Check `suppressions` (hash check) before sending.
>         
>     - **Constraint:** Set `Reply-To` header to the Scout's verified email address.
>         

**Prompt 7: Navigation Architecture (The Shells)**

> Build the layout architecture for `apps/web` before building pages.
> 
> 1. **Role Router:** Create a High-Order Component (HOC) that checks `user.role` and renders the correct Shell.
>     
> 2. **Workstation Shell:** (For Clients/Admins) Sidebar navigation with collapsible groups.
>     
> 3. **Discovery Shell:** (For Startups/Scouts) Sticky Top-Nav with mega-menu.
>     
> 4. **Persona Toggle:** Build the "Switch Workspace" component in the bottom-left.
>     
> 5. **Action Center:** Create a dedicated "Inbox" view separate from the "Notification Bell."
>     

**Prompt 8: Onboarding Flows**

> Build the Onboarding Screens for `apps/web` using the Design Tokens.
> 
> 1. **Client Flow:** Implement 'Team Auto-Discovery' (Domain check) and 'Pain Point Picker' (Auto-draft).
>     
> 2. **Startup Flow:** Implement the 'Deck-to-Data' drag-and-drop parser.
>     
>     - **Safety:** Validate parser output against Zod Schema before saving.
>         
>     - **Privacy:** Implement the 'Competitor Cloaking' input.
>         
>     - **Shortcuts:** Implement "Similar-To" templating.
>         

## Phase 4: The Core Marketplace (Apps/Web)

**Prompt 9: Challenge Creation & Quality**

> Build the 'Create Challenge' Wizard for Enterprise Clients.
> 
> 1. **Backend:** Connect the 'Publish' button to the `sanitizeInputs` Cloud Function.
>     
> 2. **Logic:** Run the **"Mad Libs" Wizard** (Goal -> Problem -> Solution) to structure data.
>     
> 3. **Quality:** Implement the **"Strength Meter"** (Deterministic) to gamify completeness (Budget, Tags, Dates).
>     
> 4. **Resilience:** Wrap the AI/Linter call in a `try/catch`. If it fails, enable the **"Switch to Manual"** fallback UI automatically.
>     
> 5. **State:** Implement 'Draft Rescue' state monitoring.
>     

**Prompt 10: The Marketplace Feed**

> Build the 'Browse Challenges' page.
> 
> Critical Constraint: Do NOT query Firestore directly.
> 
> 1. Implement the frontend search using the **Typesense/Algolia** client SDK.
>     
> 2. **Security Match:** Ensure the search parameters (filters) explicitly match the Firestore Security Rules (e.g., `filter_by: isStealth:false`). Rules are NOT filters; the client must ask for the allowed data.
>     
> 3. **Optimistic UI:** When a user creates a challenge, inject it into the local React Query cache immediately to mask sync latency.
>     
> 4. **Synthetic Liquidity:** Implement the `searchOrPivot` cloud function logic (Skill-based matching fallback).
>     
> 5. **Pagination:** Implement "Infinite Scroll" logic fetching 20 items at a time.
>     
> 6. **Privacy:** If the user is unverified/logged out, render the `publicAlias` (e.g., "Fortune 500 Co") instead of the real Client Name.
>     

## Phase 5: Trust & Transactions (Stripe)

**Prompt 11: Financial Infrastructure**

> Implement the Stripe Connect logic strictly following `monetization_matrix.md` and `technical_specification.md`.
> 
> **Interactive Configuration:** STOP and ask me for the **Stripe Secret Key** and **Connect Client ID**. Provide a guide on how to enable "Express Accounts" and "Transfers" in the Stripe Dashboard.
> 
> Constraint: Use Stripe Express accounts with Hosted Onboarding (do not build custom KYC forms).
> 
> Constraint: Use the "Separate Charges and Transfers" pattern (Split Payouts).
> 
> 1. **Escrow:** Create the 'Milestone Escrow' logic.
>     
>     - Charge Client via `stripe.paymentIntents.create` (Funds -> Platform).
>         
>     - **CRITICAL:** Assign a `transfer_group` (e.g., Application ID) to the PaymentIntent to allow future transfers to be linked.
>         
>     - **AML UI:** If `amount > 5000`, restrict Payment Methods to **ACH/Wire** only.
>         
> 2. **Platform Fee:** Transfer `MilestoneAmount - 10%`. The 10% remains in Platform.
>     
> 3. **Scout Fees:** On final release, trigger secondary transfer to Scout for **10% of Platform Fee**.
>     
>     - **CRITICAL:** Use the same `transfer_group` as the original charge.
>         
> 4. **Transaction Safety:** Wrap all financial status updates in a Firestore Transaction.
>     
> 5. **Security:** Your Webhook handler MUST verify the `stripe-signature` header.
>     
> 6. **Resilience:** If Stripe API returns 500, show "Request Invoice" modal.
>     

## Phase 6: The Viral Engine (Apps/Tool)

**Prompt 12: The 'Bridge Link' Micro-App**

> Build the `apps/tool` application (The RFP Parser).
> 
> 1. **Performance:** Lightweight build, minimal dependencies. Use `firebase/firestore/lite`.
>     
> 2. **Logic:** PDF Upload -> Shared AI Parser -> Extract Data.
>     
> 3. **Conversion:** Show 'Teaser' (Title, Budget, Match Score) only. Blur details and force Account Creation on `apps/web` to view full analysis.
>     
> 4. **Security:** Protect the upload endpoint with ReCAPTCHA Enterprise.
>     

## Phase 7: Governance & Delight

**Prompt 13: God Mode & GTM Analytics**

> Build the Scheduled Aggregation functions.
> 
> 1. **Logic:** Nightly Cron job calculates 'Red Tape Index', 'Liquidity Velocity', 'Viral K-Factor', 'Shadow Claim Rate'. Write to `stats_daily`.
>     
> 2. **Privacy:** Implement k-Anonymity checks (count < 5 returns null).
>     
> 3. **Admin Tools:** Build the 'God Mode' command palette (Cmd+K). **Must Include:** "Manual Verify", "Force Status Change", "Impersonate".
>     
> 4. **Audit Log Viewer:** Create a read-only UI in God Mode to view the `sys_audit_logs` collection.
>     

**Prompt 14: Social Engine (Delight)**

> Implement the Social & Gamification features.
> 
> 1. **Image Gen:** Build `generateSocialImage` Cloud Function using **`satori` + `resvg-js`** (Node.js compatible). Do NOT use `@vercel/og`.
>     
> 2. **Templates:** Create templates for "Deal Drop" and "Bounty Card" (with obfuscated financials).
>     
> 3. **Confetti:** Implement `canvas-confetti` triggers on "Contract Signed" events.
>     
> 4. **Sharing:** Add "Share to LinkedIn" buttons that fetch the generated OG image.
>     

**Prompt 15: Final Security Sweep**

> Implement the final security guardrails defined in the Tech Spec.
> 
> **Interactive Configuration:** STOP and ask me for the **Google Cloud Project ID** to enable the Malware Scanner API.
> 
> 1. Add `ai.txt` to the public root.
>     
> 2. Implement the 'Malware Scanner' trigger on Cloud Storage (`storage.onFinalize`).
>     
> 3. Ensure strict CSP headers preventing clickjacking on Embeddable Portals.
>     
> 4. **Passport Trigger:** Implement `onMilestoneRelease` check for Passport verification.
>     
> 5. **Vouching Logic:** Implement transaction history check for Vouching.
>     
> 6. **Budget Alert:** Set up the Cloud Function to ping Slack if AI spend > $50/day.
>     

## Phase 8: QA & Scale

**Prompt 16: Testing & Data Portability**

> Establish the testing framework.
> 
> **Interactive Configuration:** STOP and ask me for the **Google Cloud Vision API Key** (for Avatar scanning).
> 
> 1. **Unit Tests:** Jest tests for `sendScoutInvite` and `sanitizeInputs`.
>     
> 2. **E2E Tests:** Cypress test for "Startup Applies to Challenge".
>     
> 3. **Data Portability:** Implement `processDataExport` function (ZIP generation) for GDPR.
>     
> 4. **Visual Moderation:** Integrate Google Cloud Vision API for Avatar scanning.
>     

**Prompt 17: CI/CD Pipelines**

> Generate the GitHub Actions workflows (`.github/workflows/deploy.yml`).
> 
> 1. **Logic:** Detect changes in specific workspaces (`apps/web`, `apps/tool`, `functions`) and deploy ONLY the affected targets to Firebase.
>     
> 2. **Secrets:** Use `${{ secrets.FIREBASE_SERVICE_ACCOUNT }}`.
>     
> 3. **Safety:** Fail build if `STRIPE_SECRET_KEY` is detected in client bundles.
>     

**Prompt 18: Bridge: Build Event**

> Build the 'Bridge: Build' Event logic.
> 
> 1. **Flag:** `isBuildEvent` (true/false) on Challenges.
>     
> 2. **Fee Waiver:** Update Stripe logic to check this flag (0% Surcharge).
>     
> 3. **Waitlist:** Implement `processWaitlistSignup` for Dead Zones.
>     
> 4. **Leaderboard:** Build a public page (`/build`) showing real-time "Pilots Signed" counters.
>