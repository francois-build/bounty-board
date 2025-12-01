import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "TODO: REPLACE_WITH_YOUR_API_KEY",
  authDomain: "TODO: REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "TODO: REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "TODO: REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "TODO: REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "TODO: REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
