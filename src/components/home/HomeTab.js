// ═══════════════════════════════════════════════════════════════
// src/components/home/HomeTab.js
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { colors, fonts } from "../../styles/theme";
import { StatCard, ProgressRing, Avatar, SectionHeader } from "../ui/SharedUI";
import { CheckIcon } from "../ui/Icons";
import { useAuth } from "../../context/AuthContext";
import { getGreeting } from "../../utils/helpers";

const HomeTab = ({ setSelectedPlan, onStartRun, onViewHistory }) => {
  const { userData, plans, activities } = useAuth();
  const userPlans = plans.filter((p) => p.memberIds?.includes(userData?.id));

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Greeting */}
      <div className="fade-up" style={{ paddingTop: 20, marginBottom: 28 }}>
        <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
          {getGreeting()}
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 800, color: colors.text }}>
          Let's run <span style={{ color: colors.accent }}>together</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="This Week" value={userData?.weeklyMileage || 0} unit="km" color={colors.accent} delay={100} />
        <StatCard label="Avg Pace" value={userData?.avgPace || "0:00"} unit="/km" delay={200} />
        <StatCard label="Streak" value={userData?.streak || 0} unit="days" color={colors.green} delay={300} />
      </div>

      {/* Quick Actions */}
      <div className="fade-up" style={{ display: "flex", gap: 10, marginBottom: 28, animationDelay: "200ms", opacity: 0 }}>
        <div onClick={onStartRun} style={{
          flex: 1, background: `linear-gradient(135deg, ${colors.accent}20, ${colors.card})`,
          border: `1px solid ${colors.accent}30`, borderRadius: 16, padding: "16px 14px",
          cursor: "pointer", textAlign: "center",
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🏃</div>
          <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: colors.accent }}>Start Run</div>
        </div>
        <div onClick={onViewHistory} style={{
          flex: 1, background: colors.card, border: `1px solid ${colors.border}`,
          borderRadius: 16, padding: "16px 14px", cursor: "pointer", textAlign: "center",
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📊</div>
          <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: colors.blue }}>Run History</div>
        </div>
      </div>

      {/* Active Plans */}
      {userPlans.length > 0 && (
        <div className="fade-up" style={{ marginBottom: 28, animationDelay: "350ms", opacity: 0 }}>
          <SectionHeader title="Your Active Plans" />
          {userPlans.map((plan) => {
            const mp = plan.memberProgress?.[userData.id] || { progress: 0, currentWeek: 1 };
            return (
              <div key={plan.id} onClick={() => setSelectedPlan(plan)} style={{
                background: `linear-gradient(135deg, ${plan.color}15, ${colors.card})`,
                border: `1px solid ${plan.color}30`, borderRadius: 18, padding: 18,
                cursor: "pointer", marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.text }}>{plan.icon} {plan.title}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>Week {mp.currentWeek} of {plan.weeks}</div>
                  </div>
                  <ProgressRing progress={mp.progress} color={plan.color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {(plan.memberIds || []).slice(0, 4).map((_, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: 14, background: colors.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginLeft: i > 0 ? -8 : 0, border: `2px solid ${colors.card}`, position: "relative", zIndex: 10 - i }}>🏃</div>
                  ))}
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary }}>{plan.memberIds?.length || 0} runners</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Feed */}
      <div className="fade-up" style={{ animationDelay: "450ms", opacity: 0 }}>
        <SectionHeader title="Recent Activity" />
        {activities.length === 0 && (
          <div style={{ background: colors.card, borderRadius: 16, padding: 24, border: `1px solid ${colors.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👟</div>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary }}>No activity yet. Start a run!</div>
          </div>
        )}
        {activities.map((item, i) => (
          <div key={item.id || i} className="fade-up" style={{
            background: colors.card, borderRadius: 16, padding: 16, marginBottom: 10,
            border: `1px solid ${colors.border}`, animationDelay: `${500 + i * 80}ms`, opacity: 0,
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar emoji={item.avatar || "🏃"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.text }}>
                  <strong>{item.userName}</strong> <span style={{ color: colors.textSecondary }}>{item.action}</span>
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 3 }}>{item.detail}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6 }}>{item.timeAgo || ""}</div>
              </div>
              {item.action?.includes("completed") && <div style={{ color: colors.green }}><CheckIcon /></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
