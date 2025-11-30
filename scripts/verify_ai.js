
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK to connect to the Firestore emulator
console.log(`Using Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
admin.initializeApp({
  projectId: 'demo-project', // Must match the project ID used in the emulator
});

const db = admin.firestore();

async function verifyAiTrigger() {
  console.log('Waiting 10 seconds for the AI trigger to execute...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('Checking for AI-generated tags on "challenge-ai-trigger"...');

  const challengeRef = db.collection('challenges').doc('challenge-ai-trigger');
  const doc = await challengeRef.get();

  if (!doc.exists) {
    console.error('Error: Document "challenge-ai-trigger" not found!');
    process.exit(1); // Exit with an error code
  }

  const data = doc.data();
  const tags = data.tags;

  console.log('\n--- Verification Result: The AI Magic ---');
  if (tags && Array.isArray(tags) && tags.length > 0) {
    console.log(`✅ Success! The "onChallengeWrite" function worked as expected.`);
    console.log(`   The "tags" field was automatically populated with: [${tags.join(', ')}]`);
  } else {
    console.log('❌ Failure: The "tags" field was not populated by the AI function.');
    console.log('   Please check the Cloud Function logs for errors in the Firebase Emulator UI.');
  }
  console.log('------------------------------------------\n');
}

verifyAiTrigger().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
