// ═══════════════════════════════════════════════════════════════
// src/services/firebase.js — Firebase initialization
// ═══════════════════════════════════════════════════════════════
//
// ⚠️  REPLACE the config below with your real Firebase config
//     from https://console.firebase.google.com
//

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGy5gwXFQf2jXM-yfKLMtVgVWPQGZ3PxQ",
  authDomain: "runtogether-a2c76.firebaseapp.com",
  projectId: "runtogether-a2c76",
  storageBucket: "runtogether-a2c76.firebasestorage.app",
  messagingSenderId: "851653093561",
  appId: "1:851653093561:web:652a21f51854cbd5e69368",
};

// Initialize Firebase (prevent double-init in dev hot reload)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
