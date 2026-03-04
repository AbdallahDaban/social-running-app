// ═══════════════════════════════════════════════════════════════
// src/components/run/ManualRunForm.js — Manual run entry form
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { colors, fonts } from "../../styles/theme";
import { BackIcon } from "../ui/Icons";
import { Button } from "../ui/SharedUI";
import { calculatePace } from "../../services/location";

const ManualRunForm = ({ onBack, onSave, saving }) => {
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    const dist = parseFloat(distance);
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;

    if (!dist || dist <= 0) {
      setError("Please enter a valid distance");
      return;
    }
    if (totalSeconds <= 0) {
      setError("Please enter a valid time");
      return;
    }

    const pace = calculatePace(dist * 1000, totalSeconds);
    onSave({ distance: dist, duration: totalSeconds, pace });
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: 600,
    outline: "none",
    textAlign: "center",
  };

  const labelStyle = {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: "center",
  };

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 30 }}>
        <div onClick={onBack} style={{ cursor: "pointer", color: colors.textSecondary, padding: 4 }}>
          <BackIcon />
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.text }}>
          Log a Run
        </div>
      </div>

      {/* Distance */}
      <div className="fade-up" style={{
        background: colors.card, borderRadius: 18, padding: 20, marginBottom: 16,
        border: `1px solid ${colors.border}`,
      }}>
        <div style={labelStyle}>Distance (km)</div>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="0.00"
          step="0.01"
          style={inputStyle}
        />
      </div>

      {/* Time */}
      <div className="fade-up" style={{
        background: colors.card, borderRadius: 18, padding: 20, marginBottom: 16,
        border: `1px solid ${colors.border}`, animationDelay: "100ms", opacity: 0,
      }}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>Duration</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              min="0"
              max="23"
              style={inputStyle}
            />
            <div style={{ ...labelStyle, marginTop: 6, marginBottom: 0 }}>Hours</div>
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: 24, color: colors.textMuted, paddingBottom: 20 }}>:</div>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="00"
              min="0"
              max="59"
              style={inputStyle}
            />
            <div style={{ ...labelStyle, marginTop: 6, marginBottom: 0 }}>Min</div>
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: 24, color: colors.textMuted, paddingBottom: 20 }}>:</div>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              placeholder="00"
              min="0"
              max="59"
              style={inputStyle}
            />
            <div style={{ ...labelStyle, marginTop: 6, marginBottom: 0 }}>Sec</div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {distance && (parseInt(hours) || parseInt(minutes) || parseInt(seconds)) ? (
        <div className="fade-up" style={{
          background: `${colors.green}10`, borderRadius: 14, padding: "14px 18px",
          border: `1px solid ${colors.green}25`, marginBottom: 20,
          textAlign: "center", animationDelay: "200ms", opacity: 0,
        }}>
          <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Estimated Pace</div>
          <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 800, color: colors.green }}>
            {calculatePace(
              parseFloat(distance) * 1000,
              (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
            )}{" "}
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.textSecondary }}>/km</span>
          </div>
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <div style={{
          background: `${colors.error}15`, border: `1px solid ${colors.error}30`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 16,
          fontFamily: fonts.body, fontSize: 13, color: colors.error,
        }}>
          {error}
        </div>
      )}

      {/* Save */}
      <div className="fade-up" style={{ animationDelay: "300ms", opacity: 0 }}>
        <Button onClick={handleSave} loading={saving}>
          Save Run
        </Button>
      </div>
    </div>
  );
};

export default ManualRunForm;
