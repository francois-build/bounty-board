
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';

admin.initializeApp({
  projectId: 'demo-test',
});

const db = getFirestore();

const createAdmin = async () => {
  const adminEmail = 'admin@bridge.com';
  const adminId = faker.string.uuid();
  const adminRef = db.collection('users').doc(adminId);
  await adminRef.set({
    email: adminEmail,
    role: 'admin',
    createdAt: admin.firestore.Timestamp.now(),
  });
  console.log(`Admin user created with email: ${adminEmail}`);
};

const createMockChallenges = async () => {
  const challengesRef = db.collection('challenges');
  for (let i = 0; i < 50; i++) {
    const challengeId = faker.string.uuid();
    const challengeRef = challengesRef.doc(challengeId);
    await challengeRef.set({
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraphs(),
      isStealth: faker.datatype.boolean(),
      ownerId: faker.string.uuid(),
      createdAt: admin.firestore.Timestamp.now(),
    });
  }
  console.log('50 mock challenges created.');
};

const createMockUsers = async () => {
  const usersRef = db.collection('users');
  for (let i = 0; i < 100; i++) {
    const userId = faker.string.uuid();
    const userRef = usersRef.doc(userId);
    await userRef.set({
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(['startup', 'scout']),
      createdAt: admin.firestore.Timestamp.now(),
    });
  }
  console.log('100 mock users created.');
};

const createMockLeads = async () => {
  const leadsRef = db.collection('leads');
  for (let i = 0; i < 10; i++) {
    const leadId = faker.string.uuid();
    const leadRef = leadsRef.doc(leadId);
    await leadRef.set({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      claimed: false,
      createdAt: admin.firestore.Timestamp.now(),
    });
  }
  console.log('10 mock leads created.');
};

const createMockShortLinks = async () => {
  const shortLinksRef = db.collection('short_links');
  for (let i = 0; i < 10; i++) {
    const slug = faker.lorem.slug(1);
    const shortLinkRef = shortLinksRef.doc(slug);
    await shortLinkRef.set({
      destinationUrl: faker.internet.url(),
      createdAt: admin.firestore.Timestamp.now(),
      creatorId: faker.string.uuid(),
      clicks: faker.number.int({ min: 0, max: 100 }),
    });
  }
  console.log('10 mock short links created.');
};

const seed = async () => {
  console.log('Seeding local database...');
  await createAdmin();
  await createMockChallenges();
  await createMockUsers();
  await createMockLeads();
  await createMockShortLinks();
  console.log('Database seeding complete!');
};

seed().catch(console.error);
