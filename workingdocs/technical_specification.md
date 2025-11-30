# Bridge: Technical Specification & Security Constraints

## 1. Core Tenants Enforcement

### A. Trustworthiness (Security & RBAC)

- **Firestore Rules:** Strict `allow write: if request.auth.uid == resource.data.ownerId`.
    
- **Read Protection:** "Stealth" challenges and "Compliance Data" strictly gated.
    
- **Immutable Logs:** All Admin actions logged to `sys_audit_logs` (`allow delete: if false`).
    

### B. Performance

- **Indexing:** Composite indexes for `status` + `budget` + `tags`.
    
- **Shallow Queries:** Parse results stored in sub-collections, not main user docs.
    
- **Limits:** `limit(20)` mandatory on all feeds.
    

### C. Ease of Use (Edge Functions)

- **Cloud Functions:** Modular architecture (v2).
    
- **Sync:** `onWrite` triggers to sync Firestore -> Typesense (Search).
    
- **Invite System:** `sendScoutInvite` function (Manual Entry API).
    
- **Search Pivot:** `searchOrPivot` logic for zero-results.
    
- **Admin Tools:** `adminManageTicketInventory` for Golden Tickets.
    
- **Sanitization:** `sanitizeInputs` with debounce logic.
    

## 2. Integration Architecture

- **Auth:** Firebase Auth + OIDC.
    
- **Search:** Typesense / Algolia.
    
- **Email:** Resend / SendGrid (No SMTP).
    
- **Payment:** Stripe Connect (Express Accounts + Separate Charges/Transfers).
    
- **AI:** OpenAI/Gemini via Firebase Genkit.
    
- **Identity:** Persona/FaceTec.
    

## 3. Critical Risk Mitigations (The "Guardrails")

- **Financial Integrity:** All money logic inside Firestore Transactions. Idempotency keys for webhooks.
    
- **AI Reliability:** Zod Schema validation for all AI outputs.
    
- **Privacy:** Server-side filtering for "Stealth" mode.
    
- **Resilience:** `try/catch` blocks for all 3rd party APIs with UI fallbacks.
    
- **Cleared Funds:** Milestone releases require settled Payment Intent status.
    

## 4. Advanced Threat Modeling (Red Team Mitigations)

- **Malicious Payloads:** Malware Scanning on `storage.onFinalize`.
    
- **Webhook Spoofing:** Signature Verification mandatory.
    
- **Contract Integrity:** SHA-256 Hashing of signed PDFs.
    
- **Anti-Gaming:**
    
    - **Self-Dealing:** Block Scout payout if IP/Device matches Startup.
        
    - **Laundering:** Flag velocity >$10k in <48h. Mandatory ACH/Wire for >$5k.
        
- **Data Inference:** k-Anonymity (return null if count < 5) for Policymaker dashboards.
    
- **Embed Security:** Strict CSP and Origin Verification for white-label portals.
    

## 5. Governance & Compliance

- **Disintermediation:** Regex PII scrubber on chat messages.
    
- **GDPR:** Crypto-shredding architecture for "Right to Erasure."
    
- **AI Cost:** Hard quotas on Cloud Functions. Budget alerts >$50/day.
    
- **Liveness:** FaceTec/Persona SDK integration for new accounts.
    
- **Sanctions:** Daily OFAC screening via API.
    

## 6. Multi-Site Security

- **Session Isolation:** Strict cookies for Core App. Ephemeral tokens for Viral Tool.
    
- **CORS:** Whitelist allowed origins per function.
    

## 7. Scalability & Longevity Architecture

- **Data Denormalization:** Use `stats_daily` for aggregates. Do not count at runtime.
    
- **Modular Functions:** Avoid monolithic `index.ts`.
    
- **Frontend State:** Use TanStack Query for caching.
    
- **Dead Letter Queues:** Failure policies for all background triggers.
    

## 8. Implementation Guardrails

- **Date & Time:** Store as ISO 8601 UTC. Render via Browser Locale.
    
- **Accessibility:** WCAG 2.1 AA Compliant.
    
- **Public Write:** ReCAPTCHA Enterprise on public endpoints.
    
- **Webhook-First:** UI listens to Firestore; Webhook updates Firestore.
    
- **Secrets:** Use Firebase Functions Secrets.
    

## 9. Invite System Security (Hardened)

- **Rate Limiting:** `sendScoutInvite` must be limited to **10 invites per hour** per Scout.
    
- **User Enumeration Protection:** API always returns `200 OK`. Silent suppression on backend if user exists.
    
- **Strict Templating:** No free-text messages. Select from pre-approved templates.
    
- **Honeypot:** ReCAPTCHA Enterprise on the form.
    

## 10. The "Claiming" Protocol

- **Data Segregation:** Store "Shadow Profiles" in `leads`.
    
- **Conversion Logic:** `onUserCreate` queries `leads` -> Copies to `users` -> Marks `claimed: true`.
    
- **Strict Domain Matching:** Email domain must match Shadow Profile domain to claim automatically.
    

## 11. Internationalization & System Health

- **i18n:** Wrapped text helpers.
    
- **Status:** Middleware for API health.
    

## 12. AI Ethics & Systemic Controls

- **Bias Mitigation:** Diversity Boost.
    
- **RAG Lock:** No audit log access.
    
- **Economic Circuit Breaker:** $50/hr AI token cap.
    
- **GTM Safety:** Digital Twin requires Admin Approval.
    
- **Model Fallback:** Try/Catch for LLM refusals.
    
- **Source Grounding:** AI extractions must cite snippet/page number.
    

## 13. Communication Infrastructure & Hygiene

- **Domain Segmentation:** Transactional vs. Growth domains.
    
- **Secure Suppression:** Store **SHA-256 Hashes** of emails only. No raw PII in suppression lists.
    
- **Dynamic Reply-To:** Set to Scout's verify email.
    
- **Evidence Injection:** Automated invites must cite context (Startup Name).
    
- **Existing User Guardrail:** Abort GTM emails if domain/email exists in `users` collection.