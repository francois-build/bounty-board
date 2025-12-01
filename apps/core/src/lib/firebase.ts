import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: 'bridge-by-mosaic',
  appId: '1:571030184974:web:c075a652a8da366393485f',
  storageBucket: 'bridge-by-mosaic.firebasestorage.app',
  apiKey: 'AIzaSyAbPZCgfpVdf6QjqUBaejpnD775793fgA4',
  authDomain: 'bridge-by-mosaic.firebaseapp.com',
  messagingSenderId: '571030184974',
  projectNumber: '571030184974',
  version: '2'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };