
# Project Blueprint

## Overview

This project demonstrates a monorepo setup with a React-based web application (`apps/web`) and a shared package (`packages/shared`). The key feature of this setup is the enforcement of a "type boundary" between the client-side and server-side code. This ensures that server-side modules, such as `firebase-admin`, are not accidentally imported into the client-side application, which would cause build failures and runtime errors.

## Type Boundary Test

To validate the type boundary, a test was conducted to ensure that the Vite build process for the `apps/web` application would fail if it attempted to import a server-side module from the `packages/shared` directory.

### Steps

1.  **Project Setup**: A monorepo structure was created with `apps/web` for the React application and `packages/shared` for the shared code.
2.  **Shared Packages**: Two files were created in `packages/shared`:
    *   `firebase-admin.ts`: Exports the `firebase-admin` module, marking it as a server-side only module.
    *   `firebase-client.ts`: Exports the `firebase/app` module, intended for client-side use.
3.  **Web Application**: A basic React application was created in `apps/web` with the following key files:
    *   `package.json`: Defines the project dependencies and build scripts.
    *   `vite.config.ts`: Configures the Vite build process, including an alias for the `@bridge/shared` package.
    *   `src/main.tsx`: The main entry point for the React application.
    *   `src/App.tsx`: The root component of the application.
    *   `index.html`: The main HTML file for the web app.
4.  **The Test**: The `App.tsx` component was modified to import `useFirebaseAdmin` from `@bridge/shared/firebase-admin`. This is an invalid import because `firebase-admin` is a server-side module.
5.  **Build Execution**: The `npm run build --prefix apps/web` command was executed to build the web application.

### Results

The build process failed with an error indicating that the `firebase-admin` module could not be resolved. This is the expected outcome and confirms that the type boundary is working correctly. The Vite build system, through its configuration and the nature of the modules, prevented the server-side code from being bundled with the client-side application.

### Conclusion

This test successfully demonstrates the effectiveness of the type boundary in this monorepo setup. By isolating server-side code and preventing its inclusion in the client-side bundle, we can avoid potential runtime errors and ensure a clear separation of concerns between the frontend and backend code.
