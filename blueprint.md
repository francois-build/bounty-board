# Admin Panel Blueprint

## Overview

This document outlines the structure and functionality of the admin panel for the application. The admin panel is a web-based interface that allows administrators to perform various administrative tasks. The panel is built with React and Firebase and provides a command menu for easy access to different actions.

## Features

The admin panel includes the following features:

*   **Manual Account Verification:** Admins can manually verify user and scout accounts.
*   **User Impersonation:** Admins can generate a custom token to sign in as another user for debugging and support purposes.
*   **Ledger Reconciliation:** Admins can manually mark milestones as funded to reconcile offline payments.
*   **Bulk Lead Importer:** Admins can import leads from a CSV file into the Shadow Directory (`leads` collection).

## Project Structure

The admin panel is located in the `apps/admin` directory and has the following structure:

```
apps/admin/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── BulkLeadImporter.tsx
│   │   ├── ForceEscrowFunded.tsx
│   │   ├── Impersonate.tsx
│   │   └── ManualVerify.tsx
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── functions/
│   └── index.ts
├── package.json
└── tsconfig.json
```

*   **`public/`**: Contains the main HTML file for the admin panel.
*   **`src/`**: Contains the React source code for the frontend.
*   **`src/components/`**: Contains the individual React components for each admin action.
*   **`functions/`**: Contains the backend Cloud Functions for the admin panel.
*   **`package.json`**: Defines the project dependencies and scripts.
*   **`tsconfig.json`**: Configures the TypeScript compiler.

## Backend

The backend logic for the admin panel is implemented as a set of Cloud Functions in `functions/index.ts`. These functions are responsible for handling the administrative tasks securely.

### Cloud Functions

*   **`manualVerify`**: Verifies a user or scout account by updating their profile in Firestore.
*   **`impersonate`**: Generates a custom token for a given user UID, allowing an admin to sign in as that user.
*   **`forceEscrowFunded`**: Manually marks a milestone as funded in Firestore.
*   **`importLeads`**: Bulk-imports leads from a CSV file into the `leads` collection in Firestore.

## Getting Started

To run the admin panel locally, you will need to have the Firebase CLI installed and configured. Once the CLI is set up, you can run the following commands:

```bash
npm install
npm run dev
```

This will start the development server and you can access the admin panel at `http://localhost:5173`.
