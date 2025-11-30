import admin from 'firebase-admin';

// --- Configuration ---
// Connect to the emulator if FIRESTORE_EMULATOR_HOST is set, otherwise connect to the actual project
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Using Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
  admin.initializeApp({
    projectId: 'demo-project', // A mock project ID for the emulator
  });
} else {
  // IMPORTANT: For production, ensure you have GOOGLE_APPLICATION_CREDENTIALS set
  console.log('Connecting to live Firebase project...');
  admin.initializeApp();
}


const auth = admin.auth();
const db = admin.firestore();

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log('Starting database seeding...');
  const password = 'password123';

  // --- 1. Create Users (The Cast) ---
  const usersToCreate = [
    { uid: 'demo-client', email: 'client@demo.com', role: 'client', displayName: 'Demo Client' },
    { uid: 'demo-startup', email: 'startup@demo.com', role: 'startup', displayName: 'Demo Startup' },
    { uid: 'demo-scout', email: 'scout@demo.com', role: 'scout', displayName: 'Demo Scout' },
  ];

  for (const user of usersToCreate) {
    try {
      // Create auth user
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: password,
        displayName: user.displayName,
        emailVerified: true,
      });
      console.log(`Successfully created auth user: ${user.email}`);

      // Create corresponding Firestore document
      const userDocRef = db.collection('users').doc(user.uid);
      await userDocRef.set({
        ownerId: user.uid,
        role: user.role,
        status: 'active',
        gmv_total: 0,
        // Add any other role-specific initial data here
      });
      console.log(`Successfully created Firestore user doc: ${user.uid}`);

    } catch (error: any) {
      if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
        console.log(`User ${user.email} already exists, skipping creation.`);
      } else {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
  }

  // --- 2. Create Challenges (The Scenarios) ---
  const challenges = {
    standard: {
      id: 'challenge-standard',
      title: 'Enterprise Chatbot Pilot',
      description: 'We are looking for a next-generation chatbot to integrate into our enterprise customer support system. Must handle over 10,000 queries per day and support multiple languages.',
      status: 'active',
      is_stealth: false,
      bounty: 25000,
      tags: ['AI', 'NLP', 'Customer Support', 'Enterprise'],
      ownerId: 'demo-client',
    },
    stealth: {
      id: 'challenge-stealth',
      title: 'Project Chimera',
      description: 'Highly confidential project in the autonomous vehicle space. Details available upon NDA.',
      status: 'active',
      is_stealth: true,
      bounty: 500000,
      tags: ['Robotics', 'Autonomous Vehicles', 'Computer Vision'],
      ownerId: 'demo-client',
    },
    ai_trigger: {
      id: 'challenge-ai-trigger',
      title: 'Unprocessed Raw Text',
      description: "We have a massive logistics and supply chain operation. We're looking for a python backend developer to build a system that can optimize our routing and predict delivery times. Experience with machine learning is a plus.",
      status: 'draft',
      is_stealth: false,
      bounty: 75000,
      tags: [], // Intentionally left empty to be populated by the AI trigger
      ownerId: 'demo-client',
    }
  };

  for (const key in challenges) {
    const challenge = challenges[key as keyof typeof challenges];
    try {
      await db.collection('challenges').doc(challenge.id).set(challenge);
      console.log(`Successfully created challenge: "${challenge.title}"`);
    } catch (error) {
      console.error(`Error creating challenge "${challenge.title}":`, error);
    }
  }

  // --- 3. Create a Submission ---
  try {
    const submissionRef = db.collection('submissions').doc('submission-demo');
    await submissionRef.set({
      challengeId: 'challenge-standard',
      startupId: 'demo-startup',
      status: 'pending_review',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      pitch: "Our revolutionary chatbot technology is the perfect fit for your enterprise needs."
    });
    console.log('Successfully created a demo submission.');
  } catch (error) {
    console.error('Error creating submission:', error);
  }


  console.log('\n--- Seeding Complete! ---');
  console.log(`
  === DEMO CREDENTIALS ===
  Client: client@demo.com
  Startup: startup@demo.com
  Scout: scout@demo.com
  Password: ${password}
  ========================
  `);
}

seedDatabase().catch(console.error);
