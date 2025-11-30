import * as admin from 'firebase-admin';

export function useFirebaseAdmin() {
  // This function should not be used in the client-side code.
  return admin;
}