// ═══════════════════════════════════════════════════════════════
// src/services/location.js — GPS & Geolocation service
// ═══════════════════════════════════════════════════════════════

/**
 * Request location permission and get current position.
 * Returns { latitude, longitude, accuracy }
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

/**
 * Start watching position continuously.
 * Returns a watchId that can be used to stop watching.
 *
 * @param {Function} onPosition - Called with { latitude, longitude, accuracy, speed, timestamp }
 * @param {Function} onError - Called with error
 * @returns {number} watchId
 */
export const watchPosition = (onPosition, onError) => {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation is not supported"));
    return null;
  }
  return navigator.geolocation.watchPosition(
    (pos) =>
      onPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      }),
    onError,
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
  );
};

/**
 * Stop watching position.
 * @param {number} watchId
 */
export const clearWatch = (watchId) => {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula.
 * Returns distance in meters.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Calculate pace from distance (meters) and time (seconds).
 * Returns pace as "M:SS" per km string.
 */
export const calculatePace = (distanceMeters, timeSeconds) => {
  if (distanceMeters <= 0 || timeSeconds <= 0) return "0:00";
  const distanceKm = distanceMeters / 1000;
  const paceSeconds = timeSeconds / distanceKm;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Calculate speed from distance (meters) and time (seconds).
 * Returns speed in km/h.
 */
export const calculateSpeed = (distanceMeters, timeSeconds) => {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  return (distanceMeters / 1000) / (timeSeconds / 3600);
};

/**
 * Check if location services are available and permitted.
 */
export const checkLocationPermission = async () => {
  if (!navigator.geolocation) return "unavailable";
  if (!navigator.permissions) return "unknown";

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state; // "granted", "denied", or "prompt"
  } catch {
    return "unknown";
  }
};

/**
 * Filter out GPS jitter — ignore points that are too close or too inaccurate.
 */
export const isValidGPSPoint = (newPoint, lastPoint, minDistance = 3, maxAccuracy = 30) => {
  if (newPoint.accuracy > maxAccuracy) return false;
  if (!lastPoint) return true;

  const dist = calculateDistance(
    lastPoint.latitude,
    lastPoint.longitude,
    newPoint.latitude,
    newPoint.longitude
  );
  return dist >= minDistance;
};
