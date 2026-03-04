// ═══════════════════════════════════════════════════════════════
// src/components/run/RunScreen.js — Live GPS run tracking
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import { colors, fonts } from "../../styles/theme";
import { BackIcon, PlayIcon, PauseIcon, StopIcon, AlertIcon } from "../ui/Icons";
import { Button } from "../ui/SharedUI";
import { formatDuration, formatDistance } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import { saveRun, postActivity, updateUserProfile as updateUserDB } from "../../services/database";
import useRunTracker from "../../hooks/useRunTracker";
import ManualRunForm from "./ManualRunForm";

const RunScreen = ({ onBack }) => {
  const { user, userData, refreshData } = useAuth();
  const [mode, setMode] = useState("choose"); // choose | gps | manual | summary
  const [paceAlerts, setPaceAlerts] = useState([]);
  const [saving, setSaving] = useState(false);

  const handlePaceAlert = useCallback((type, pace, km) => {
    const msg =
      type === "fast"
        ? `Km ${km}: ${pace}/km — Slow down!`
        : `Km ${km}: ${pace}/km — Pick it up!`;
    setPaceAlerts((prev) => [...prev, { type, msg, km, timestamp: Date.now() }]);

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(type === "fast" ? [200, 100, 200] : [500]);
    }
  }, []);

  const tracker = useRunTracker({
    onPaceAlert: handlePaceAlert,
  });

  const handleSaveRun = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveRun({
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        distance: tracker.distance,
        duration: tracker.elapsedTime,
        pace: tracker.currentPace,
        route: tracker.route.length > 500
          ? tracker.route.filter((_, i) => i % Math.ceil(tracker.route.length / 500) === 0)
          : tracker.route,
        splits: tracker.splits,
        type: "gps",
      });

      await updateUserDB(user.uid, {
        totalRuns: (userData?.totalRuns || 0) + 1,
        totalDistance: (userData?.totalDistance || 0) + tracker.distance,
      });

      await postActivity({
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        avatar: "🏃",
        action: "completed a run",
        detail: `${formatDistance(tracker.distance)} km in ${formatDuration(tracker.elapsedTime)} — ${tracker.currentPace}/km`,
      });

      await refreshData();
      setMode("summary");
    } catch (err) {
      console.error("Error saving run:", err);
    }
    setSaving(false);
  };

  const handleManualSave = async (runData) => {
    if (!user) return;
    setSaving(true);
    try {
      await saveRun({
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        distance: runData.distance * 1000,
        duration: runData.duration,
        pace: runData.pace,
        route: [],
        splits: [],
        type: "manual",
      });

      await updateUserDB(user.uid, {
        totalRuns: (userData?.totalRuns || 0) + 1,
        totalDistance: (userData?.totalDistance || 0) + runData.distance * 1000,
      });

      await postActivity({
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        avatar: "🏃",
        action: "logged a run",
        detail: `${runData.distance.toFixed(2)} km in ${formatDuration(runData.duration)} — ${runData.pace}/km`,
      });

      await refreshData();
      setMode("summary");
    } catch (err) {
      console.error("Error saving manual run:", err);
    }
    setSaving(false);
  };

  // ─── Choose Mode ───────────────────────────────────────────

  if (mode === "choose") {
    return (
      <div style={{ padding: "0 20px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 30 }}>
          <div onClick={onBack} style={{ cursor: "pointer", color: colors.textSecondary, padding: 4 }}><BackIcon /></div>
          <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 800, color: colors.text }}>Start a Run</div>
        </div>

        <div className="fade-up" onClick={() => setMode("gps")} style={{
          background: `linear-gradient(135deg, ${colors.accent}15, ${colors.card})`,
          border: `1px solid ${colors.accent}30`, borderRadius: 20, padding: 24,
          cursor: "pointer", marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: colors.accent }} />
          <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 6 }}>GPS Tracking</div>
          <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 }}>
            Track your run live with GPS. See real-time pace, distance, route, and splits.
          </div>
        </div>

        <div className="fade-up" onClick={() => setMode("manual")} style={{
          background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 20,
          padding: 24, cursor: "pointer", animationDelay: "100ms", opacity: 0,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: colors.blue }} />
          <div style={{ fontSize: 36, marginBottom: 12 }}>✏️</div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 6 }}>Log Manually</div>
          <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 }}>
            Enter distance and time from a treadmill, track, or watched run.
          </div>
        </div>
      </div>
    );
  }

  // ─── Manual Entry ──────────────────────────────────────────

  if (mode === "manual") {
    return (
      <ManualRunForm
        onBack={() => setMode("choose")}
        onSave={handleManualSave}
        saving={saving}
      />
    );
  }

  // ─── Summary ───────────────────────────────────────────────

  if (mode === "summary") {
    return (
      <div style={{ padding: "0 20px 100px" }}>
        <div className="fade-up" style={{ paddingTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: colors.text, marginBottom: 8 }}>
            Great Run!
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: 32 }}>
            Your run has been saved
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            {[
              { label: "Distance", value: formatDistance(tracker.distance), unit: "km", color: colors.accent },
              { label: "Time", value: formatDuration(tracker.elapsedTime), color: colors.blue },
              { label: "Pace", value: tracker.currentPace, unit: "/km", color: colors.green },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: colors.card, borderRadius: 16, padding: "18px 12px", border: `1px solid ${colors.border}` }}>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: s.color }}>
                  {s.value}{s.unit && <span style={{ fontSize: 12, color: colors.textSecondary }}>{s.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => { tracker.reset(); setMode("choose"); setPaceAlerts([]); }}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  // ─── GPS Tracking View ─────────────────────────────────────

  const isRunning = tracker.status === "running";
  const isPaused = tracker.status === "paused";
  const isFinished = tracker.status === "finished";

  return (
    <div style={{ height: "100vh", background: colors.bg, display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={tracker.status === "idle" ? onBack : undefined}
          style={{ cursor: tracker.status === "idle" ? "pointer" : "default", color: colors.textSecondary, padding: 4, opacity: tracker.status === "idle" ? 1 : 0.3 }}>
          <BackIcon />
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.accent }}>
          {tracker.status === "idle" ? "READY" : tracker.status === "running" ? "RUNNING" : tracker.status === "paused" ? "PAUSED" : "FINISHED"}
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* Main Stats */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
        {/* Timer */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Duration</div>
          <div style={{
            fontFamily: fonts.display, fontSize: 64, fontWeight: 900, color: colors.text,
            letterSpacing: -2, lineHeight: 1,
            textShadow: isRunning ? `0 0 40px ${colors.accentGlow}` : "none",
          }}>
            {formatDuration(tracker.elapsedTime)}
          </div>
        </div>

        {/* Distance & Pace */}
        <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 340, marginBottom: 32 }}>
          <div className="fade-up" style={{ flex: 1, textAlign: "center", animationDelay: "100ms", opacity: 0 }}>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Distance</div>
            <div style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 800, color: colors.accent }}>
              {formatDistance(tracker.distance)}
              <span style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 4 }}>km</span>
            </div>
          </div>
          <div style={{ width: 1, background: colors.border }} />
          <div className="fade-up" style={{ flex: 1, textAlign: "center", animationDelay: "200ms", opacity: 0 }}>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Pace</div>
            <div style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 800, color: colors.green }}>
              {tracker.currentPace}
              <span style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 4 }}>/km</span>
            </div>
          </div>
        </div>

        {/* Splits */}
        {tracker.splits.length > 0 && (
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 20 }}>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Splits</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tracker.splits.map((split, i) => (
                <div key={i} style={{
                  background: colors.card, borderRadius: 10, padding: "6px 12px",
                  border: `1px solid ${colors.border}`,
                }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted }}>Km {split.km}: </span>
                  <span style={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 700, color: colors.text }}>{split.pace}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pace Alerts */}
        {paceAlerts.length > 0 && (
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 16 }}>
            {paceAlerts.slice(-2).map((alert, i) => (
              <div key={i} style={{
                background: alert.type === "fast" ? `${colors.warning}15` : `${colors.error}15`,
                border: `1px solid ${alert.type === "fast" ? colors.warning : colors.error}30`,
                borderRadius: 12, padding: "8px 14px", marginBottom: 6,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <AlertIcon size={14} style={{ color: alert.type === "fast" ? colors.warning : colors.error }} />
                <span style={{ fontFamily: fonts.body, fontSize: 12, color: alert.type === "fast" ? colors.warning : colors.error }}>{alert.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {tracker.error && (
          <div style={{
            background: `${colors.error}15`, border: `1px solid ${colors.error}30`,
            borderRadius: 12, padding: "10px 14px", marginBottom: 16,
            fontFamily: fonts.body, fontSize: 13, color: colors.error, maxWidth: 340,
          }}>
            {tracker.error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: "20px 20px 40px", display: "flex", justifyContent: "center", gap: 16 }}>
        {tracker.status === "idle" && (
          <button onClick={tracker.start} style={{
            width: 80, height: 80, borderRadius: 40, border: "none",
            background: `linear-gradient(135deg, ${colors.accent}, #E64400)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", animation: "glow 2s ease infinite", color: "#fff",
          }}>
            <PlayIcon size={32} />
          </button>
        )}

        {isRunning && (
          <button onClick={tracker.pause} style={{
            width: 80, height: 80, borderRadius: 40, border: "none",
            background: colors.yellow, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: colors.bg,
          }}>
            <PauseIcon size={32} />
          </button>
        )}

        {isPaused && (
          <>
            <button onClick={tracker.stop} style={{
              width: 64, height: 64, borderRadius: 32, border: `2px solid ${colors.error}`,
              background: "transparent", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: colors.error,
            }}>
              <StopIcon size={28} />
            </button>
            <button onClick={tracker.resume} style={{
              width: 80, height: 80, borderRadius: 40, border: "none",
              background: `linear-gradient(135deg, ${colors.green}, #00C853)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}>
              <PlayIcon size={32} />
            </button>
          </>
        )}

        {isFinished && (
          <div style={{ width: "100%", maxWidth: 300 }}>
            <Button onClick={handleSaveRun} loading={saving}>
              Save Run
            </Button>
            <div style={{ height: 10 }} />
            <Button variant="secondary" onClick={() => { tracker.reset(); setMode("choose"); setPaceAlerts([]); }}>
              Discard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunScreen;
