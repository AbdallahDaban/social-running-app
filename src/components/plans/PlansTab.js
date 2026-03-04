// ═══════════════════════════════════════════════════════════════
// src/components/plans/PlansTab.js
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { colors, fonts } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

const PlansTab = ({ setSelectedPlan }) => {
  const { userData, plans } = useAuth();

  return (
    <div style={{ padding: "0 20px 100px" }}>
      <div className="fade-up" style={{ paddingTop: 20, marginBottom: 24 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 800, color: colors.text }}>Training Plans</div>
        <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>Train smarter, run together</div>
      </div>
      {plans.map((plan, i) => (
        <div key={plan.id} className="fade-up" onClick={() => setSelectedPlan(plan)} style={{
          background: colors.card, borderRadius: 20, padding: 20, marginBottom: 14,
          border: `1px solid ${colors.border}`, cursor: "pointer",
          animationDelay: `${100 + i * 100}ms`, opacity: 0, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: plan.color, borderRadius: "20px 0 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{plan.icon}</span>
                <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.text }}>{plan.title}</div>
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: 10 }}>{plan.subtitle}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontFamily: fonts.body, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${plan.color}15`, color: plan.color, fontWeight: 600 }}>{plan.difficulty}</span>
                <span style={{ fontFamily: fonts.body, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: colors.surface, color: colors.textSecondary }}>{plan.weeks} weeks</span>
                <span style={{ fontFamily: fonts.body, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: colors.surface, color: colors.textSecondary }}>{plan.memberIds?.length || 0} runners</span>
              </div>
            </div>
            {plan.memberIds?.includes(userData?.id) && (
              <div style={{ background: `${colors.green}20`, color: colors.green, fontFamily: fonts.body, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>Joined</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlansTab;
