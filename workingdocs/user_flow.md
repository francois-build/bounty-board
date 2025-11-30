# Bridge: User Flow & Account Creation Architecture

## 1. High-Level Strategy

The onboarding philosophy is **"Value First, Form Second."** We delay the heavy data entry until the user has seen value (e.g., a match count or a generated draft).

- **Public Access:** Startups, Clients, Scouts.
    
- **Gated Access:** Policymakers (Requires manual vetting/sales contact).
    
- **Authentication:** LinkedIn-First (for verified B2B identity) with Email fallback, plus **Enterprise SSO** for corporate clients.
    

## 2. The Landing Page (`/`)

The entry point splits traffic immediately based on intent.

### **Hero Section**

- **Headline:** "The Operating System for Corporate Innovation."
    
- **Sub-head:** "Match with enterprise challenges, fast-track diligence, and secure pilots."
    
- **Primary CTA:** `Get Started` (Triggers Role Selection Modal).
    
- **Secondary CTA:** `Try Demo` (Triggers Anonymous Sandbox).
    

### **The "Government & Policy" Link**

- **Placement:** Distinct navigation item (Top Right) or Footer named **"For Governments"**.
    
- **Behavior:** Does **NOT** open the standard Signup flow. Links to `/government-solutions`.
    

## 3. The Authentication Gateway (`/auth`)

Triggered when clicking `Get Started`.

### **Step 1: Identity Provider**

- **UI:** Clean modal.
    
- **Option A:** `Continue with LinkedIn` (Preferred for Startups/Scouts).
    
- **Option B:** `Corporate Login (SSO)` (Microsoft Entra / Okta - Preferred for Clients).
    
- **Option C:** `Continue with Email` (Triggers Magic Link).
    
- **Micro-copy:** "We use Geo-Intelligent defaults to configure your region and currency automatically."
    

## 4. Role Selection (The Fork)

Once authenticated, the user must declare their intent. This is a visual grid selection.

**Headline:** "How do you want to use Bridge?"

|   |   |   |
|---|---|---|
|**Card A: I want to solve problems**|**Card B: I want to find solutions**|**Card C: I want to refer startups**|
|**Role:** Startup (Solver)|**Role:** Enterprise Client (Seeker)|**Role:** Scout (Connector)|
|**Action:** Goes to Flow A|**Action:** Goes to Flow B|**Action:** Goes to Flow C|

## 5. Flow A: Startup Onboarding (The "Solver")

**Goal:** Get the profile 80% full in under 60 seconds.

### **Step 1: The "Deck-to-Data" Drop**

- **UI:** Large drag-and-drop zone.
    
- **Copy:** "Don't like forms? Drop your Pitch Deck (PDF) here to auto-fill your profile."
    
- **Fallback:** `Skip and fill manually`.
    

### **Step 2: The "Similar-To" Shortcut**

- **Question:** "Which company are you most like?" (e.g., "We are the Plaid for [Vertical]").
    
- **Action:** User selects "Plaid" + "Logistics". System auto-tags: `API`, `Fintech`, `Infrastructure`.
    

### **Step 3: Competitor Cloaking (Privacy)**

- **UI:** "Who should NOT see your sensitive data?"
    
- **Input:** Multi-select input for domains (e.g., `competitor.com`).
    

### **Step 4: Activation (The "Match Potential" Meter)**

- **Transition:** User lands on Dashboard.
    
- **Overlay:** A circular meter sits at 20%.
    
- **Tooltip:** "Add your **Tech Stack** tags to unlock 12 potential matches."
    
- **State:** User is marked with `probationaryStatus: true`.
    
    - **Probation Unlock:** "Complete your first Micro-Diligence call or Liveness Check to unlock Instant Apply."
        

## 6. Flow B: Enterprise Client Onboarding (The "Seeker")

**Goal:** Overcome "Writer's Block" and fear of public posting.

### **Path 1: Cold Arrival (Standard)**

- **Step 1: Team Auto-Discovery:** Check email domain (`@acme.com`). If colleagues exist, prompt to join.
    
- **Step 2: Pain Point Picker:** Select chips (`Supply Chain`, `High Churn`) to auto-generate a draft.
    
- **Step 3: The Ghost Challenge:** Land on dashboard with a pre-filled "Draft Challenge" (State: `isDraft: true`).
    

### **Path 2: The "Claim" Arrival (From Digital Twin Email)**

- **Entry:** User clicks "Claim this Challenge" in a cold email.
    
- **Action:** Magic Link logs them in directly to the specific **Challenge Editor**.
    
- **State:** Challenge is already populated with data scraped from their PDF.
    
- **CTA:** "We found 12 matches for this. Click 'Publish' to see them."
    

## 7. Flow C: Innovation Scout Onboarding (The "Connector")

**Goal:** Enable referrals immediately without complex setup.

### **Step 1: Profile Verification**

- **Input:** "Link your LinkedIn Profile" (if not done via Auth).
    

### **Step 2: The "Invite Dashboard" (Low Friction)**

- **Transition:** Land on Scout Dashboard.
    
- **UI:** A simple card: **"Invite a Founder."**
    
- **Fields:** `Founder Email`, `Founder Name`, `Startup Name`.
    
- **Action:** Scout clicks "Send Invite."
    
- **Backend:** System checks suppression list -> Generates token -> Sends branded email template (No custom message allowed).
    

### **Step 3: Asset Generation**

- **Transition:** Show "Invite Sent" success state.
    
- **Secondary Action:** "Install Clipper Extension" (Optional power tool).
    

## 8. Flow D: The Policymaker (Gated Access)

This flow occurs **outside** the standard app signup.

### **Entry Point: `/government-solutions`**

- Accessed via the Footer.
    

### **Step 1: The "Teaser" Download**

- **UI:** "Download the Q3 National Innovation Index (Sample)."
    
- **Goal:** Show value before asking for the meeting.
    
- **Action:** User provides email to download PDF.
    

### **Step 2: The "Request Access" Form**

- **Fields:** Name, Title, Government Entity, Work Email (`.gov`).
    
- **Submission State:** "Thank you. Your request has been routed to our Government Liaison team."
    
- **First Login:** The Policymaker lands directly on the **National Economic Dashboard** (God Mode).
    

## 9. Handling "Concierge" Requests & Demo Mode

- **Concierge:** Visible in Flows A & B. Small FAB: _"Too busy? Let us set this up for you."_ -> Uploads PDF.
    
    - **Resilience:** If the `conciergeQueueSize` is > 20, the button toggles to **"Join Waitlist (Current Wait: 48h)."**
        
- **Demo Mode (Try Before You Buy):**
    
    - Accessible from Landing Page (`Try Demo`).
        
    - User enters a fully populated, read-only dashboard with fake data.
        
    - Any "Write" action (Create Challenge, Apply) triggers the **Signup Modal**.