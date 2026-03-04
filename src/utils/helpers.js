// ═══════════════════════════════════════════════════════════════
// src/utils/helpers.js — Utility functions
// ═══════════════════════════════════════════════════════════════

/**
 * Format seconds into HH:MM:SS or MM:SS
 */
export const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Format meters to km with 2 decimal places
 */
export const formatDistance = (meters) => {
  return (meters / 1000).toFixed(2);
};

/**
 * Get time ago string from a timestamp
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/**
 * Format a date to readable string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format pace string (M:SS /km)
 */
export const formatPace = (paceString) => {
  if (!paceString || paceString === "0:00") return "--:--";
  return `${paceString} /km`;
};

/**
 * Calculate total sessions in a plan
 */
export const getTotalSessions = (schedule) => {
  if (!schedule) return 0;
  return schedule.reduce((acc, week) => acc + (week.sessions?.length || 0), 0);
};

/**
 * Calculate completed sessions count for a user in a plan
 */
export const getCompletedCount = (completedSessions, uid) => {
  if (!completedSessions) return 0;
  return Object.keys(completedSessions).filter(
    (k) => k.startsWith(uid) && completedSessions[k]
  ).length;
};

/**
 * Debounce a function
 */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
