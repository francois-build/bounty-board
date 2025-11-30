// This script verifies the AI Matchmaker pipeline by creating a test challenge
// and waiting for a Cloud Function to automatically populate it with tags.

// Hardcode environment variables to ensure connection to the local Firebase emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "demo-project";

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

async function verifyAiPipeline() {
  console.log('Initializing Firebase Admin for verification...');
  // Initialize the app with a specific project ID for the emulator
  initializeApp({ projectId: "demo-project" });

  const db = getFirestore();
  console.log('Firebase Admin initialized successfully.');

  try {
    // Step 1: Create a new document in the 'challenges' collection
    const challengeData = {
      status: "draft",
      description: "I need a Python expert to build a machine learning model for fintech data analysis.",
      ownerId: "test-verifier",
      createdAt: FieldValue.serverTimestamp() // Ensures trigger sees a new doc
    };
    const challengeRef = await db.collection('challenges').add(challengeData);
    console.log(`Created new challenge document with ID: ${challengeRef.id}`);

    // Step 2: Log that we are waiting for the trigger
    console.log("Waiting for AI Trigger...");

    // Set up a timeout to prevent the script from running indefinitely
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 15000)
    );

    // Step 3: Set up a snapshot listener on the new document
    const snapshotPromise = new Promise((resolve, reject) => {
      const unsubscribe = challengeRef.onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          // Step 4: Check if the 'tags' field has been populated
          if (data && Array.isArray(data.tags) && data.tags.length > 0) {
            unsubscribe(); // Stop listening for changes
            resolve(data.tags);
          }
        }
      }, reject);
    });

    // Wait for either the tags to be generated or the timeout to occur
    const tags = await Promise.race([snapshotPromise, timeoutPromise]);
    console.log(`✅ SUCCESS: AI Tags Generated: [${tags.join(', ')}]`);
    process.exit(0);

  } catch (error) {
    if (error.message === 'Timeout') {
      console.log("❌ TIMEOUT: AI Trigger did not fire.");
    } else {
      console.error("An unexpected error occurred:", error);
    }
    process.exit(1);
  }
}

verifyAiPipeline();
