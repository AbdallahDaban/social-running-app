// ═══════════════════════════════════════════════════════════════
// src/services/auth.js — Authentication helpers
// ═══════════════════════════════════════════════════════════════

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

export const updateUserProfile = (user, data) => updateProfile(user, data);

export const onAuthChanged = (callback) => onAuthStateChanged(auth, callback);

// Friendly error messages
export const getAuthErrorMessage = (code) => {
  const messages = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "This email is already registered",
    "auth/invalid-email": "Invalid email address",
    "auth/too-many-requests": "Too many attempts. Try again later",
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/invalid-credential": "Invalid email or password",
  };
  return messages[code] || "Something went wrong. Please try again";
};
