// ═══════════════════════════════════════════════════════════════
// src/services/database.js — Firestore database operations
// ═══════════════════════════════════════════════════════════════

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Generic helpers ─────────────────────────────────────────

export const getDocument = async (path) => {
  const snap = await getDoc(doc(db, path));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const setDocument = (path, data, merge = true) =>
  setDoc(doc(db, path), data, { merge });

export const updateDocument = (path, data) =>
  updateDoc(doc(db, path), data);

export const addDocument = (collectionPath, data) =>
  addDoc(collection(db, collectionPath), data);

export const queryDocuments = async (collectionPath, ...constraints) => {
  const ref = collection(db, collectionPath);
  const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToDocument = (path, callback) =>
  onSnapshot(doc(db, path), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });

export const subscribeToCollection = (collectionPath, callback, ...constraints) => {
  const ref = collection(db, collectionPath);
  const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── User operations ─────────────────────────────────────────

export const createUserProfile = (uid, data) =>
  setDocument(`users/${uid}`, {
    displayName: data.displayName || "Runner",
    email: data.email || "",
    avatar: "🏃",
    createdAt: new Date().toISOString(),
    weeklyMileage: 0,
    totalRuns: 0,
    totalDistance: 0,
    avgPace: "0:00",
    streak: 0,
    friends: [],
    joinedPlans: [],
    ...data,
  });

export const getUserProfile = (uid) => getDocument(`users/${uid}`);

export const updateUserProfile = (uid, data) =>
  updateDocument(`users/${uid}`, data);

// ─── Friends operations ──────────────────────────────────────

export const findUserByEmail = async (email) => {
  const results = await queryDocuments("users", where("email", "==", email));
  return results.length > 0 ? results[0] : null;
};

export const addFriend = async (myUid, friendUid) => {
  await updateDocument(`users/${myUid}`, { friends: arrayUnion(friendUid) });
  await updateDocument(`users/${friendUid}`, { friends: arrayUnion(myUid) });
};

export const removeFriend = async (myUid, friendUid) => {
  await updateDocument(`users/${myUid}`, { friends: arrayRemove(friendUid) });
  await updateDocument(`users/${friendUid}`, { friends: arrayRemove(myUid) });
};

export const getFriendProfiles = async (friendIds) => {
  const profiles = [];
  for (const fid of friendIds) {
    const profile = await getDocument(`users/${fid}`);
    if (profile) profiles.push({ ...profile, id: fid });
  }
  return profiles;
};

// ─── Plans operations ────────────────────────────────────────

export const getPlans = () => queryDocuments("plans");

export const seedPlans = async (defaultPlans) => {
  for (const plan of defaultPlans) {
    await setDocument(`plans/${plan.id}`, plan);
  }
};

export const joinPlan = async (planId, uid) => {
  await updateDocument(`plans/${planId}`, {
    memberIds: arrayUnion(uid),
    [`memberProgress.${uid}`]: { progress: 0, currentWeek: 1 },
  });
  await updateDocument(`users/${uid}`, {
    joinedPlans: arrayUnion(planId),
  });
};

export const completeSession = async (planId, sessionKey, uid, progress, weekNum) => {
  await updateDocument(`plans/${planId}`, {
    [`completedSessions.${sessionKey}`]: true,
    [`memberProgress.${uid}.progress`]: progress,
    [`memberProgress.${uid}.currentWeek`]: weekNum,
  });
};

// ─── Activity feed ───────────────────────────────────────────

export const postActivity = (data) =>
  addDocument("activities", {
    ...data,
    createdAt: serverTimestamp(),
  });

export const getActivities = (maxCount = 20) =>
  queryDocuments("activities", orderBy("createdAt", "desc"), limit(maxCount));

// ─── Run history ─────────────────────────────────────────────

export const saveRun = (data) =>
  addDocument("runs", {
    ...data,
    createdAt: serverTimestamp(),
  });

export const getUserRuns = (uid, maxCount = 50) =>
  queryDocuments("runs", where("userId", "==", uid), orderBy("createdAt", "desc"), limit(maxCount));

// Re-export for convenience
export { where, orderBy, limit, arrayUnion, serverTimestamp };
