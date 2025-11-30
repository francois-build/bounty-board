# Bridge: Resilience, Degradation & Support Strategy

**Goal:** Ensure the business continues to operate even when the technology fails, allowing a small team to maintain trust through transparency and manual "concierge" workarounds.

## 1. Automated Circuit Breakers (The "Safety Net")

- **AI Service Failure:** If OpenAI returns 500 errors or times out (>8s):
    
    - **UI Reaction:** Auto-hide "Upload Deck" button. Expand the "Manual Entry" form with a dismissible warning banner ("AI Assistant offline").
        
    - **Admin Alert:** Slack ping to #ops-critical.
        
- **Search Index Failure:** If Typesense/Algolia is unreachable:
    
    - **UI Reaction:** Search bar shows "Offline Mode." Feed auto-switches to a direct Firestore query: `db.collection('challenges').orderBy('createdAt', 'desc').limit(20)`.
        
- **Payment Gateway Failure:** If Stripe API returns 500 during checkout:
    
    - **UI Reaction:** Show "Request Invoice" modal instead of card error.
        
    - **State Change:** Deal enters `payment_pending_manual` state, blocking code release but reserving the pilot slot.
        
- **Invite Spam Cap:**
    
    - **Trigger:** If a Scout sends >10 invites in 1 hour via the Dashboard.
        
    - **Reaction:** Temp-block sending for 24h. Alert Admin to review for bot behavior.
        
- **Concierge Queue Cap:**
    
    - **Trigger:** If active concierge requests > 20.
        
    - **Reaction:** "Do it for me" button changes to "Join Waitlist (48h Wait)."
        

## 2. Operational Runbooks (Manual Workarounds)

_When the code breaks, use these procedures to keep the business running._

### A. The "Offline Payment" Runbook (Stripe Down)

_Use this when a Client cannot pay via card or needs a manual Wire Transfer._

1. **Stripe Dashboard:** Create a Customer Invoice manually. Email PDF to Client.
    
2. **Verify:** Wait for funds to hit the Bank Account (Settled).
    
3. **Admin Panel (God Mode):**
    
    - Go to Application ID.
        
    - Click **"Force Escrow Funded"**.
        
    - **Input:** Enter the `Stripe Invoice ID` and `Amount` to reconcile the internal ledger.
        
    - **Result:** System unlocks Tier 3 for Startup; Scout attribution remains intact.
        

### B. The "Manual Verification" Runbook (Identity Down)

_Use this when Persona/FaceTec fails to verify a legitimate founder._

1. **Trigger:** User sees "Verification Failed" -> Clicks "Request Manual Review."
    
2. **Secure Ingestion:** User uploads ID to the secure `manual_review` bucket (72h auto-delete, signed URL access only).
    
3. **Admin Panel:**
    
    - View ID via Signed URL (Time-boxed).
        
    - Compare against LinkedIn profile.
        
    - Click **"Override: Verified"**.
        
4. **Cleanup:** System logs the Admin ID who bypassed the check for audit trails.
    

### C. The "Invite Link" Rescue (Email Delivery Fail)

_Use this if SendGrid fails or invite emails are going to Spam._

1. **Trigger:** Scout complains "Founder didn't get the invite."
    
2. **Admin Panel:**
    
    - Go to Users -> Scout Profile.
        
    - Select "Generate Manual Invite Link" for the specific startup.
        
3. **Action:** Copy the raw URL (containing the `scout_id` and `invite_token`).
    
4. **Resolution:** DM the link to the Scout to send via WhatsApp/Signal.
    

## 3. Admin Tooling Requirements (God Mode)

- **"Impersonate User":** Read-only view of the dashboard as a specific user to debug "I can't see the button" tickets.
    
- **"System Broadcast":** Global banner system (`active: true/false`) to warn users of degradation: _"We are experiencing payment issues. Please request an invoice."_
    
- **"Ledger Reconciliation Form":** A specific UI for entering off-platform payments so they still count towards GMV and Scout Fees.
    

## 4. Triage Matrix (Small Team Protocol)

|   |   |   |   |   |
|---|---|---|---|---|
|**Severity**|**Issue Type**|**Who Responds?**|**Response Time**|**Strategy**|
|**Critical**|Payment Failed, Contract Signing Broken, Data Leak|**Founder**|< 1 Hour|"Manual Override" immediately. Fix code later.|
|**High**|AI Drafter Broken, Search Down, Verification Stuck|**Ops/Admin**|< 4 Hours|Send Manual Workaround (PDF upload, Invoice).|
|**Medium**|Visual Glitch, Typo, Scout Dashboard Stat Delay|**Support Bot**|24 Hours|"Thanks for the report, we'll fix in next release."|
|**Low**|Feature Request, "How do I...?"|**Docs/Bot**|Instant|Auto-answered by RAG Bot / Docs.|