import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6n7GJb1ax_1jCVzf7N8CnMvzJJABEDwo",
  authDomain: "gita-wisdom-b2990.firebaseapp.com",
  projectId: "gita-wisdom-b2990",
  storageBucket: "gita-wisdom-b2990.firebasestorage.app",
  messagingSenderId: "705249126390",
  appId: "1:705249126390:web:d3d3516a5693cbaef389d7",
  measurementId: "G-3CFJT7QK8M"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
