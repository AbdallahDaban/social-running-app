// ═══════════════════════════════════════════════════════════════
// src/hooks/useRunTracker.js — GPS run tracking hook
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import {
  watchPosition,
  clearWatch,
  calculateDistance,
  calculatePace,
  isValidGPSPoint,
} from "../services/location";

/**
 * Hook that manages the full run tracking lifecycle:
 * - Timer (start, pause, resume, stop)
 * - GPS tracking with route recording
 * - Live pace, distance, and split calculations
 * - Pace alerts
 */
const useRunTracker = (options = {}) => {
  const { targetPaceMin, targetPaceMax, onPaceAlert } = options;

  // ─── State ───────────────────────────────────────────────
  const [status, setStatus] = useState("idle"); // idle | running | paused | finished
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const [distance, setDistance] = useState(0); // meters
  const [currentPace, setCurrentPace] = useState("0:00");
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [route, setRoute] = useState([]); // array of { lat, lng, timestamp }
  const [splits, setSplits] = useState([]); // km splits with pace
  const [error, setError] = useState(null);

  // ─── Refs (persist across renders) ───────────────────────
  const timerRef = useRef(null);
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const lastPointRef = useRef(null);
  const distanceRef = useRef(0);
  const lastSplitDistRef = useRef(0);
  const lastSplitTimeRef = useRef(0);

  // ─── Timer logic ─────────────────────────────────────────

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - startTimeRef.current + pausedTimeRef.current) / 1000
      );
      setElapsedTime(elapsed);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ─── GPS position handler ────────────────────────────────

  const handlePosition = useCallback(
    (position) => {
      const point = {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        timestamp: position.timestamp,
      };

      // Filter out bad GPS readings
      if (!isValidGPSPoint(point, lastPointRef.current)) return;

      // Calculate distance from last valid point
      if (lastPointRef.current) {
        const segmentDist = calculateDistance(
          lastPointRef.current.latitude,
          lastPointRef.current.longitude,
          point.latitude,
          point.longitude
        );
        distanceRef.current += segmentDist;
        setDistance(distanceRef.current);

        // Update pace
        const now = Date.now();
        const totalTime = (now - startTimeRef.current + pausedTimeRef.current) / 1000;
        const pace = calculatePace(distanceRef.current, totalTime);
        setCurrentPace(pace);

        // Speed from GPS or calculated
        if (point.speed && point.speed > 0) {
          setCurrentSpeed((point.speed * 3.6).toFixed(1)); // m/s to km/h
        }

        // Check for km split
        const currentKm = Math.floor(distanceRef.current / 1000);
        const lastSplitKm = Math.floor(lastSplitDistRef.current / 1000);
        if (currentKm > lastSplitKm && currentKm > 0) {
          const splitTime = totalTime - lastSplitTimeRef.current;
          const splitDist = distanceRef.current - lastSplitDistRef.current;
          const splitPace = calculatePace(splitDist, splitTime);
          setSplits((prev) => [
            ...prev,
            { km: currentKm, pace: splitPace, time: splitTime },
          ]);
          lastSplitDistRef.current = distanceRef.current;
          lastSplitTimeRef.current = totalTime;

          // Pace alert check
          if (targetPaceMin && targetPaceMax && onPaceAlert) {
            const paceSeconds = splitTime / (splitDist / 1000);
            const paceMinutes = paceSeconds / 60;
            const [minMin] = targetPaceMin.split(":").map(Number);
            const [maxMin] = targetPaceMax.split(":").map(Number);
            if (paceMinutes < minMin) {
              onPaceAlert("fast", splitPace, currentKm);
            } else if (paceMinutes > maxMin) {
              onPaceAlert("slow", splitPace, currentKm);
            }
          }
        }
      }

      // Store route point
      setRoute((prev) => [
        ...prev,
        { lat: point.latitude, lng: point.longitude, timestamp: point.timestamp },
      ]);
      lastPointRef.current = point;
    },
    [targetPaceMin, targetPaceMax, onPaceAlert]
  );

  const handleGPSError = useCallback((err) => {
    console.error("GPS error:", err);
    setError(`GPS error: ${err.message}`);
  }, []);

  // ─── Controls ────────────────────────────────────────────

  const start = useCallback(() => {
    setError(null);
    setStatus("running");
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    distanceRef.current = 0;
    lastPointRef.current = null;
    lastSplitDistRef.current = 0;
    lastSplitTimeRef.current = 0;
    setDistance(0);
    setElapsedTime(0);
    setRoute([]);
    setSplits([]);
    setCurrentPace("0:00");

    startTimer();
    watchIdRef.current = watchPosition(handlePosition, handleGPSError);
  }, [startTimer, handlePosition, handleGPSError]);

  const pause = useCallback(() => {
    setStatus("paused");
    stopTimer();
    pausedTimeRef.current += Date.now() - startTimeRef.current;
    clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, [stopTimer]);

  const resume = useCallback(() => {
    setStatus("running");
    startTimeRef.current = Date.now();
    startTimer();
    watchIdRef.current = watchPosition(handlePosition, handleGPSError);
  }, [startTimer, handlePosition, handleGPSError]);

  const stop = useCallback(() => {
    setStatus("finished");
    stopTimer();
    clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, [stopTimer]);

  const reset = useCallback(() => {
    setStatus("idle");
    setElapsedTime(0);
    setDistance(0);
    setCurrentPace("0:00");
    setCurrentSpeed(0);
    setRoute([]);
    setSplits([]);
    setError(null);
    distanceRef.current = 0;
    lastPointRef.current = null;
    lastSplitDistRef.current = 0;
    lastSplitTimeRef.current = 0;
    pausedTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (watchIdRef.current) clearWatch(watchIdRef.current);
    };
  }, [stopTimer]);

  return {
    status,
    elapsedTime,
    distance,
    currentPace,
    currentSpeed,
    route,
    splits,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};

export default useRunTracker;
