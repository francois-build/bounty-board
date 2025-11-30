# Project Blueprint

## Overview

This document outlines the architecture and implementation plan for the "Bounty Board" application. The goal is to create a dynamic and responsive marketplace for challenges, focusing on a fast, secure, and seamless user experience.

## Implemented Features

*   **Initial Project Setup:**
    *   Configured a React-based web application.
    *   Initialized Firebase for backend services.
    *   Set up Cloud Functions for serverless logic.
    *   Integrated Typesense for a fast search experience.
*   **User Authentication:**
    *   Implemented email/password and Google sign-in.
    *   Created user profile management.
    *   Role-based access control (RBAC) with "client," "startup," and "admin" roles.
*   **Core Backend:**
    *   Cloud Functions triggers for `onUserCreate`, `onChallengeWrite`.
    *   Firestore security rules to protect data.
    *   Secrets management for API keys (Resend, Typesense).

## Current Plan: Browse Challenges Marketplace

This plan details the creation of the 'Browse Challenges' page and associated functionality.

### 1. Backend: `searchOrPivot` Cloud Function

*   **Objective:** Implement a Cloud Function to provide "synthetic liquidity." If a user's search returns few results, the function will pivot to a broader, skill-based search.
*   **Logic:**
    1.  Receive a search query from the client.
    2.  Execute the primary search on the "challenges" collection in Typesense.
    3.  If the result count is below a threshold (e.g., 5), extract relevant skills from the query.
    4.  Perform a secondary search against the `tags` or `skills` field in the "challenges" collection.
    5.  Return the combined or pivoted results.
*   **File:** `functions/src/searchOrPivot.ts`

### 2. Frontend: 'Browse Challenges' Page

*   **Objective:** Create the main marketplace feed where users can browse, search, and filter challenges.
*   **File:** `src/pages/BrowseChallenges.jsx`

#### Key Features:

*   **Typesense Search:**
    *   Integrate the `typesense-js` client SDK for all search operations.
    *   **Constraint:** Do NOT query Firestore directly from the client for browsing challenges.
    *   **Security:** All public searches will include the parameter `filter_by: 'isStealth:false'` to comply with Firestore security rules.

*   **State Management with React Query:**
    *   Use `react-query` to manage server state, caching, and data fetching.
    *   **Optimistic UI:** When a user creates a new challenge, use `onMutate` to immediately add the challenge to the local query cache for a seamless experience.

*   **Infinite Scroll:**
    *   Implement an infinite scroll mechanism using `react-query`'s `useInfiniteQuery` hook.
    *   Fetch challenges in pages of 20.
    *   Use an intersection observer to trigger fetching the next page when the user scrolls near the bottom.

*   **Privacy-Aware Rendering:**
    *   Check the user's authentication status.
    *   If the user is not logged in or is unverified, display the challenge's `publicAlias` field.
    *   If the user is logged in and verified, display the actual client name.

### 3. Routing

*   Add a new route for the browse page.
*   **File:** `src/App.jsx`
*   **Route:** `/browse`

### 4. Dependencies

*   `react-query`: For server state management.
*   `typesense-js`: For interacting with the Typesense search service.
*   `react-router-dom`: For client-side routing.
*   `react-intersection-observer`: To trigger infinite scroll.
