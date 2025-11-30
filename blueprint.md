# Blueprint: Authentication & User Creation

This document outlines the plan for implementing the authentication and user creation logic for the application.

## Overview

The goal is to provide a secure and seamless authentication experience for users, supporting multiple social login providers. The system will also handle user creation and invitations.

## Plan

### 1. Interactive Configuration

*   [ ] **Action:** Prompt the user for OAuth Client IDs and Secrets for Google, LinkedIn, and Microsoft.
*   [ ] **Action:** Explain how to configure the Callback URLs in the Firebase Console.

### 2. Frontend (apps/web)

*   [ ] **Component:** Create a `LoginPage` component to display the social login buttons.
*   [ ] **Routing:** Add a `/login` route for the `LoginPage`.
*   [ ] **Providers:**
    *   [ ] Integrate Firebase Authentication with the Google provider.
    *   [ ] Integrate Firebase Authentication with the LinkedIn (OIDC) provider.
    *   [ ] Integrate Firebase Authentication with the Microsoft (SSO) provider.
*   [ ] **UI:**
    *   [ ] Create a loading/polling state after login to wait for the user profile to be created by the `onUserCreate` function.
    *   [ ] Create an "Invalid Link" page for expired or invalid magic links.
    *   [ ] Add a "Resend Invite" button to the "Invalid Link" page.

### 3. Backend (Cloud Functions)

*   [ ] **Function:** Implement the `onUserCreate` Cloud Function (`functions/src/triggers/onUserCreate.ts`).
    *   [ ] Create a new user document in the `users` collection in Firestore.
    *   [ ] Check the `leads` collection for a matching email and claim the shadow profile.
    *   [ ] Set the `probationaryStatus` field to `true`.
    *   [ ] Assign a default avatar URL.
*   [ ] **Function:** Implement the `sendScoutInvite` callable Cloud Function (`functions/src/triggers/sendScoutInvite.ts`).
    *   [ ] Verify that the caller is a registered "Scout" by checking their custom claims.
    *   [ ] Implement a suppression check to avoid sending emails to users who have opted out.
    *   [ ] Use the `resend` library to send the invitation email.
    *   [ ] Set the `Reply-To` header of the email to the Scout's verified email address.

### 4. Error Handling

*   [ ] **UI:** Create a dedicated "Invalid Link" page.
*   [ ] **Logic:** If a Magic Link token is expired or invalid, redirect the user to the "Invalid Link" page.
*   [ ] **Functionality:** The "Resend Invite" button should trigger a function to send a new invitation.

