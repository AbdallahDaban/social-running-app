// ═══════════════════════════════════════════════════════════════
// src/context/AuthContext.js — Authentication context provider
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthChanged } from "../services/auth";
import {
  getUserProfile,
  createUserProfile,
  getPlans,
  seedPlans,
  getActivities,
  getFriendProfiles,
} from "../services/database";
import DEFAULT_PLANS from "../data/plans";
import { getTimeAgo } from "../utils/helpers";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadAllData(firebaseUser.uid);
      } else {
        setUser(null);
        setUserData(null);
        setPlans([]);
        setFriends([]);
        setActivities([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async (uid) => {
    try {
      // Load or create user profile
      let profile = await getUserProfile(uid);
      if (!profile) {
        await createUserProfile(uid, {});
        profile = await getUserProfile(uid);
      }
      setUserData({ ...profile, id: uid });

      // Load friends
      if (profile?.friends?.length > 0) {
        const friendsData = await getFriendProfiles(profile.friends);
        setFriends(friendsData);
      } else {
        setFriends([]);
      }

      // Load or seed plans
      let plansData = await getPlans();
      if (plansData.length === 0) {
        await seedPlans(DEFAULT_PLANS);
        plansData = DEFAULT_PLANS;
      }
      setPlans(plansData);

      // Load activities
      const acts = await getActivities(20);
      setActivities(acts.map((a) => ({ ...a, timeAgo: getTimeAgo(a.createdAt) })));
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const refreshData = async () => {
    if (user) {
      await loadAllData(user.uid);
    }
  };

  const value = {
    user,
    userData,
    plans,
    friends,
    activities,
    loading,
    refreshData,
    setUser,
    setUserData,
    setPlans,
    setFriends,
    setActivities,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
