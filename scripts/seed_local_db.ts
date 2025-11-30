
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, Timestamp, connectFirestoreEmulator } from "firebase/firestore";
import { faker } from "@faker-js/faker";

// Initialize Firebase
const firebaseConfig = {
  projectId: "demo-test",
  // For local emulator, we don't need real auth credentials
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const createAdmin = async () => {
  const adminEmail = "admin@bridge.com";
  const adminId = faker.string.uuid();
  const adminRef = doc(db, "users", adminId);
  await setDoc(adminRef, {
    email: adminEmail,
    role: "admin",
    createdAt: Timestamp.now(),
  });
  console.log(`Admin user created with email: ${adminEmail}`);
};

const createMockChallenges = async () => {
  const challengesRef = collection(db, "challenges");
  for (let i = 0; i < 50; i++) {
    const challengeId = faker.string.uuid();
    const challengeRef = doc(challengesRef, challengeId);
    await setDoc(challengeRef, {
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraphs(),
      isStealth: faker.datatype.boolean(),
      ownerId: faker.string.uuid(),
      createdAt: Timestamp.now(),
    });
  }
  console.log("50 mock challenges created.");
};

const createMockUsers = async () => {
  const usersRef = collection(db, "users");
  for (let i = a; i < 100; i++) {
    const userId = faker.string.uuid();
    const userRef = doc(usersRef, userId);
    await setDoc(userRef, {
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(["startup", "scout"]),
      createdAt: Timestamp.now(),
    });
  }
  console.log("100 mock users created.");
};

const createMockLeads = async () => {
  const leadsRef = collection(db, "leads");
  for (let i = 0; i < 10; i++) {
    const leadId = faker.string.uuid();
    const leadRef = doc(leadsRef, leadId);
    await setDoc(leadRef, {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      claimed: false,
      createdAt: Timestamp.now(),
    });
  }
  console.log("10 mock leads created.");
};

const createMockShortLinks = async () => {
  const shortLinksRef = collection(db, "short_links");
  for (let i = 0; i < 10; i++) {
    const slug = faker.lorem.slug(1);
    const shortLinkRef = doc(shortLinksRef, slug);
    await setDoc(shortLinkRef, {
      destinationUrl: faker.internet.url(),
      createdAt: Timestamp.now(),
      creatorId: faker.string.uuid(),
      clicks: faker.number.int({ min: 0, max: 100 }),
    });
  }
  console.log("10 mock short links created.");
};

const seed = async () => {
  console.log("Seeding local database...");
  await createAdmin();
  await createMockChallenges();
  await createMockUsers();
  await createMockLeads();
  await createMockShortLinks();
  console.log("Database seeding complete!");
};

seed().catch(console.error);
