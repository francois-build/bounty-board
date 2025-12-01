# Operator's Manual: Bridge

## Architecture

This project is a monorepo containing three separate applications:

*   **`apps/core`**: The main application, built with React and Vite.
*   **`apps/www`**: The marketing website, built with React and Vite.
*   **`apps/link`**: A viral link-sharing tool (future development).

All applications share code from the `packages/shared` directory.

## Quickstart

1.  **Install Dependencies:** `npm install`
2.  **Seed the Database:** `npm run seed`
3.  **Run All Apps:** `npm run dev:all`

## Credentials

*   **Client:** `demo-client` / `password123`
*   **Enterprise:** `demo-enterprise` / `password123`
*   **Scout:** `demo-scout` / `password123`

## Features

*   [x] AI-Powered Search & Recommendations
*   [x] Stealth Mode for Enterprise Clients
*   [x] Integrated Stripe Payments & Fee Waivers
*   [x] "Zero Liquidity" Dead Zone Defense
*   [x] Admin Tooling for Event Management
*   [x] Monorepo Architecture for Code Sharing
*   [x] Centralized Environment Configuration
