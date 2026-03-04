// ═══════════════════════════════════════════════════════════════
// src/components/plans/PlanDetail.js
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { colors, fonts } from "../../styles/theme";
import { BackIcon, CheckIcon } from "../ui/Icons";
import { Button, SectionHeader } from "../ui/SharedUI";
import { useAuth } from "../../context/AuthContext";
import { joinPlan, completeSession, postActivity, updateUserProfile as updateUserDB } from "../../services/database";
import { getTotalSessions, getCompletedCount, formatDistance, formatDuration } from "../../utils/helpers";

const PlanDetail = ({ plan, onBack }) => {
  const { user, userData, friends, refreshData } = useAuth();
  const [joined, setJoined] = useState(plan.memberIds?.includes(userData?.id));
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    try {
      await joinPlan(plan.id, user.uid);
      await postActivity({
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        avatar: "🏃",
        action: "joined",
        detail: plan.title,
      });
      await refreshData();
      setJoined(true);
    } catch (err) {
      console.error("Join error:", err);
    }
    setJoining(false);
  };

  const handleComplete = async (sessionKey, weekNum) => {
    if (!user) return;
    try {
      const total = getTotalSessions(plan.schedule);
      const done = getCompletedCount(plan.completedSessions, user.uid) + 1;
      const progress = Math.round((done / total) * 100);
      await completeSession(plan.id, sessionKey, user.uid, progress, weekNum);
      await updateUserDB(user.uid, { totalRuns: (userData?.totalRuns || 0) + 1 });
      const session = plan.schedule.find((w) => w.week === weekNum)?.sessions.find((_, i) => sessionKey.endsWith(`_s${i}`));
      await postActivity({
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        avatar: "🏃",
        action: "completed",
        detail: `${session?.type || "session"} — ${session?.distance || "?"}km @ ${session?.pace || "?"}`,
      });
      await refreshData();
    } catch (err) {
      console.error("Complete error:", err);
    }
  };

  const memberList = (plan.memberIds || []).map((mid) => {
    const mp = plan.memberProgress?.[mid] || { progress: 0, currentWeek: 1 };
    if (mid === userData?.id) return { id: mid, name: "You", avatar: "🏃", ...mp };
    const f = friends.find((fr) => fr.id === mid);
    return { id: mid, name: f?.displayName || "Runner", avatar: f?.avatar || "🏃", ...mp };
  });

  return (
    <div style={{ padding: "0 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 20 }}>
        <div onClick={onBack} style={{ cursor: "pointer", color: colors.textSecondary, padding: 4 }}><BackIcon /></div>
        <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.text }}>{plan.icon} {plan.title}</div>
      </div>

      {/* Description + stats */}
      <div className="fade-up" style={{ background: `linear-gradient(135deg, ${plan.color}10, ${colors.card})`, borderRadius: 18, padding: 20, marginBottom: 20, border: `1px solid ${plan.color}25` }}>
        <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 }}>{plan.description}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {[{ v: plan.weeks, l: "Weeks" }, { v: getTotalSessions(plan.schedule), l: "Sessions" }, { v: plan.memberIds?.length || 0, l: "Runners" }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: colors.bg, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, color: plan.color }}>{s.v}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Join / Joined */}
      {!joined ? (
        <div className="fade-up" style={{ animationDelay: "150ms", opacity: 0, marginBottom: 24 }}>
          <Button onClick={handleJoin} loading={joining}>Join This Plan</Button>
        </div>
      ) : (
        <div className="fade-up" style={{ background: `${colors.green}12`, border: `1px solid ${colors.green}30`, borderRadius: 14, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, animationDelay: "150ms", opacity: 0 }}>
          <CheckIcon /><span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.green, fontWeight: 600 }}>You're in this plan</span>
        </div>
      )}

      {/* Group progress */}
      {memberList.length > 0 && (
        <div className="fade-up" style={{ marginBottom: 24, animationDelay: "200ms", opacity: 0 }}>
          <SectionHeader title="Group Progress" />
          {memberList.map((m, i) => (
            <div key={m.id} className="fade-up" style={{ background: colors.card, borderRadius: 14, padding: 14, marginBottom: 8, border: `1px solid ${colors.border}`, animationDelay: `${250 + i * 80}ms`, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 17, background: colors.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{m.avatar}</div>
                  <div>
                    <div style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.text }}>{m.name}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>Week {m.currentWeek || 1}</div>
                  </div>
                </div>
                <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: plan.color }}>{m.progress || 0}%</div>
              </div>
              <div style={{ background: colors.bg, borderRadius: 6, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${plan.color}, ${plan.color}AA)`, width: `${m.progress || 0}%`, animation: "progressFill 1s ease forwards" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="fade-up" style={{ animationDelay: "350ms", opacity: 0 }}>
        <SectionHeader title="Weekly Schedule" />
        {(plan.schedule || []).map((week, wi) => (
          <div key={wi} style={{ marginBottom: 10 }}>
            <div onClick={() => setExpandedWeek(expandedWeek === wi ? -1 : wi)} style={{
              background: expandedWeek === wi ? `${plan.color}10` : colors.card,
              borderRadius: 14, padding: "14px 16px", cursor: "pointer",
              border: `1px solid ${expandedWeek === wi ? `${plan.color}30` : colors.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.text }}>Week {week.week}</span>
              <span style={{ color: colors.textSecondary, fontSize: 12, transform: expandedWeek === wi ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
            </div>
            {expandedWeek === wi && (
              <div style={{ marginTop: 6 }}>
                {week.sessions.map((session, si) => {
                  const sKey = `${userData?.id}_w${week.week}_s${si}`;
                  const isDone = plan.completedSessions?.[sKey] === true;
                  return (
                    <div key={si} style={{ background: colors.surface, borderRadius: 12, padding: "12px 16px", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${isDone ? colors.green : colors.textMuted}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, width: 30 }}>{session.day}</span>
                          <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: isDone ? colors.textSecondary : colors.text, textDecoration: isDone ? "line-through" : "none" }}>{session.type}</span>
                        </div>
                        <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2, marginLeft: 36 }}>{session.distance}km</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 600, color: plan.color, background: `${plan.color}12`, padding: "3px 8px", borderRadius: 8 }}>{session.pace} /km</div>
                        {joined && !isDone && (
                          <div onClick={(e) => { e.stopPropagation(); handleComplete(sKey, week.week); }} style={{ width: 28, height: 28, borderRadius: 14, background: `${colors.green}15`, border: `1.5px solid ${colors.green}40`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><CheckIcon /></div>
                        )}
                        {isDone && <div style={{ color: colors.green }}><CheckIcon /></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDetail;
