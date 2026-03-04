// ═══════════════════════════════════════════════════════════════
// src/components/profile/ProfileTab.js
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { colors, fonts } from "../../styles/theme";
import { LogOutIcon } from "../ui/Icons";
import { StatCard, SectionHeader } from "../ui/SharedUI";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../services/auth";

const ProfileTab = () => {
  const { userData } = useAuth();

  const badges = [
    { icon: "🏅", label: "First Run", unlocked: (userData?.totalRuns || 0) >= 1 },
    { icon: "🔥", label: "10-Day Streak", unlocked: (userData?.streak || 0) >= 10 },
    { icon: "💪", label: "50 Runs", unlocked: (userData?.totalRuns || 0) >= 50 },
    { icon: "⚡", label: "100 Runs", unlocked: (userData?.totalRuns || 0) >= 100 },
    { icon: "🌙", label: "Night Runner", unlocked: false },
    { icon: "🤝", label: "Team Player", unlocked: (userData?.joinedPlans?.length || 0) >= 1 },
  ];

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Profile Header */}
      <div className="fade-up" style={{ paddingTop: 20, textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: `linear-gradient(135deg, ${colors.accent}30, ${colors.card})`,
          border: `3px solid ${colors.accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, margin: "0 auto 14px",
        }}>
          {userData?.avatar || "🏃"}
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 800, color: colors.text }}>
          {userData?.displayName || "Runner"}
        </div>
        <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
          {userData?.email}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        <StatCard label="Total Runs" value={userData?.totalRuns || 0} delay={100} />
        <StatCard label="This Week" value={userData?.weeklyMileage || 0} unit="km" color={colors.accent} delay={200} />
        <StatCard label="Avg Pace" value={userData?.avgPace || "0:00"} unit="/km" delay={300} />
        <StatCard label="Streak" value={userData?.streak || 0} unit="days" color={colors.green} delay={400} />
      </div>

      {/* Achievements */}
      <div className="fade-up" style={{ animationDelay: "300ms", opacity: 0, marginBottom: 28 }}>
        <SectionHeader title="Achievements" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {badges.map((b, i) => (
            <div key={i} style={{
              background: b.unlocked ? colors.card : colors.surface,
              borderRadius: 14, padding: "14px 8px", textAlign: "center",
              border: `1px solid ${b.unlocked ? colors.border : "transparent"}`,
              opacity: b.unlocked ? 1 : 0.4,
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{b.icon}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: b.unlocked ? colors.textSecondary : colors.textMuted }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="fade-up" style={{ animationDelay: "450ms", opacity: 0 }}>
        <button onClick={handleSignOut} style={{
          width: "100%", padding: "14px 0", borderRadius: 14,
          border: `1px solid ${colors.border}`, background: "transparent",
          color: colors.error, fontFamily: fonts.body, fontSize: 15, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <LogOutIcon /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
