// ═══════════════════════════════════════════════════════════════
// src/components/run/RunHistory.js — Past runs list
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { colors, fonts } from "../../styles/theme";
import { BackIcon, ClockIcon, MapPinIcon } from "../ui/Icons";
import { useAuth } from "../../context/AuthContext";
import { getUserRuns } from "../../services/database";
import { formatDuration, formatDistance, formatDate, getTimeAgo } from "../../utils/helpers";
import { Spinner } from "../ui/SharedUI";

const RunHistory = ({ onBack }) => {
  const { user } = useAuth();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRuns = async () => {
      if (!user) return;
      try {
        const data = await getUserRuns(user.uid, 50);
        setRuns(data);
      } catch (err) {
        console.error("Error loading runs:", err);
      }
      setLoading(false);
    };
    loadRuns();
  }, [user]);

  // Calculate stats
  const totalDistance = runs.reduce((a, r) => a + (r.distance || 0), 0);
  const totalTime = runs.reduce((a, r) => a + (r.duration || 0), 0);

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 24 }}>
        <div onClick={onBack} style={{ cursor: "pointer", color: colors.textSecondary, padding: 4 }}>
          <BackIcon />
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.text }}>
          Run History
        </div>
      </div>

      {/* Summary stats */}
      <div className="fade-up" style={{
        display: "flex", gap: 10, marginBottom: 24,
      }}>
        <div style={{
          flex: 1, background: colors.card, borderRadius: 16, padding: "14px 12px",
          border: `1px solid ${colors.border}`, textAlign: "center",
        }}>
          <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.accent }}>{runs.length}</div>
          <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textMuted }}>Total Runs</div>
        </div>
        <div style={{
          flex: 1, background: colors.card, borderRadius: 16, padding: "14px 12px",
          border: `1px solid ${colors.border}`, textAlign: "center",
        }}>
          <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.blue }}>{formatDistance(totalDistance)}</div>
          <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textMuted }}>Total km</div>
        </div>
        <div style={{
          flex: 1, background: colors.card, borderRadius: 16, padding: "14px 12px",
          border: `1px solid ${colors.border}`, textAlign: "center",
        }}>
          <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.green }}>{formatDuration(totalTime)}</div>
          <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textMuted }}>Total Time</div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spinner />
        </div>
      )}

      {/* Empty state */}
      {!loading && runs.length === 0 && (
        <div style={{
          background: colors.card, borderRadius: 18, padding: 28,
          border: `1px solid ${colors.border}`, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👟</div>
          <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
            No runs yet
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary }}>
            Start your first run to see it here!
          </div>
        </div>
      )}

      {/* Run list */}
      {runs.map((run, i) => (
        <div key={run.id} className="fade-up" style={{
          background: colors.card, borderRadius: 16, padding: 16, marginBottom: 10,
          border: `1px solid ${colors.border}`,
          borderLeft: `3px solid ${run.type === "gps" ? colors.accent : colors.blue}`,
          animationDelay: `${i * 60}ms`, opacity: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
                {formatDate(run.createdAt)} · {getTimeAgo(run.createdAt)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {run.type === "gps" ? <MapPinIcon size={14} style={{ color: colors.accent }} /> : <ClockIcon size={14} style={{ color: colors.blue }} />}
                <span style={{ fontFamily: fonts.body, fontSize: 12, color: run.type === "gps" ? colors.accent : colors.blue, fontWeight: 600, textTransform: "uppercase" }}>
                  {run.type === "gps" ? "GPS Run" : "Manual"}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, color: colors.text }}>
                {formatDistance(run.distance || 0)}
                <span style={{ fontSize: 11, fontWeight: 500, color: colors.textSecondary, marginLeft: 2 }}>km</span>
              </div>
            </div>
            <div style={{ width: 1, background: colors.border }} />
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, color: colors.textSecondary }}>
                {formatDuration(run.duration || 0)}
              </div>
            </div>
            <div style={{ width: 1, background: colors.border }} />
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, color: colors.green }}>
                {run.pace || "--:--"}
                <span style={{ fontSize: 11, fontWeight: 500, color: colors.textSecondary, marginLeft: 2 }}>/km</span>
              </div>
            </div>
          </div>
          {/* Splits */}
          {run.splits && run.splits.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
              {run.splits.map((s, j) => (
                <span key={j} style={{
                  fontFamily: fonts.body, fontSize: 10, color: colors.textSecondary,
                  background: colors.surface, padding: "2px 8px", borderRadius: 6,
                }}>
                  Km{s.km}: {s.pace}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RunHistory;
