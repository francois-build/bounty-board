import admin from 'firebase-admin';

// Connect to the Firestore emulator
admin.initializeApp({
  projectId: 'demo-project', // Use the same mock project ID as the seed script
});

const db = admin.firestore();

async function verifyAiTrigger() {
  console.log('Checking for AI-generated tags on "challenge-ai-trigger"...');

  // Wait for a few seconds to give the Cloud Function time to execute
  await new Promise(resolve => setTimeout(resolve, 8000));

  const challengeRef = db.collection('challenges').doc('challenge-ai-trigger');
  const doc = await challengeRef.get();

  if (!doc.exists) {
    console.error('Error: Document "challenge-ai-trigger" not found!');
    return;
  }

  const data = doc.data();
  const tags = data?.tags;

  console.log('--- Verification Result ---');
  if (tags && tags.length > 0) {
    console.log('✅ Success! The AI trigger successfully populated the tags:');
    console.log(tags);
  } else {
    console.log('❌ Failure: The tags field is still empty.');
    console.log('Please check the function logs for errors.');
  }
  console.log('-------------------------');
}

verifyAiTrigger().catch(console.error);
