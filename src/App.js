// ═══════════════════════════════════════════════════════════════
// src/App.js — Root application component
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import "./styles/global.css";
import { colors, fonts } from "./styles/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingScreen } from "./components/ui/SharedUI";
import { HomeIcon, PlanIcon, FriendsIcon, ProfileIcon } from "./components/ui/Icons";
import AuthScreen from "./components/auth/AuthScreen";
import HomeTab from "./components/home/HomeTab";
import PlansTab from "./components/plans/PlansTab";
import PlanDetail from "./components/plans/PlanDetail";
import FriendsTab from "./components/friends/FriendsTab";
import ProfileTab from "./components/profile/ProfileTab";
import RunScreen from "./components/run/RunScreen";
import RunHistory from "./components/run/RunHistory";

// ─── Inner App (uses auth context) ──────────────────────────

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showRun, setShowRun] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;

  // Full-screen overlays
  if (showRun) {
    return <RunScreen onBack={() => setShowRun(false)} />;
  }

  if (showHistory) {
    return (
      <AppShell>
        <RunHistory onBack={() => setShowHistory(false)} />
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} onClear={() => { setSelectedPlan(null); setShowHistory(false); }} />
      </AppShell>
    );
  }

  const tabs = {
    home: (
      <HomeTab
        setSelectedPlan={setSelectedPlan}
        onStartRun={() => setShowRun(true)}
        onViewHistory={() => setShowHistory(true)}
      />
    ),
    plans: <PlansTab setSelectedPlan={setSelectedPlan} />,
    friends: <FriendsTab />,
    profile: <ProfileTab />,
  };

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {selectedPlan ? (
          <PlanDetail plan={selectedPlan} onBack={() => setSelectedPlan(null)} />
        ) : (
          tabs[activeTab]
        )}
      </div>
      <TabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClear={() => setSelectedPlan(null)}
      />
    </AppShell>
  );
};

// ─── App Shell (status bar + container) ──────────────────────

const AppShell = ({ children }) => (
  <div
    style={{
      fontFamily: fonts.body,
      background: colors.bg,
      color: colors.text,
      width: "100%",
      maxWidth: 430,
      margin: "0 auto",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Status bar */}
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.text }}>
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
      <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.accent, letterSpacing: 0.5 }}>
        RunTogether
      </div>
      <div style={{ width: 16, height: 10, border: `1.5px solid ${colors.text}`, borderRadius: 2, position: "relative" }}>
        <div style={{ position: "absolute", top: 1.5, left: 1.5, bottom: 1.5, right: 3, background: colors.text, borderRadius: 0.5 }} />
      </div>
    </div>
    {children}
  </div>
);

// ─── Tab Bar ─────────────────────────────────────────────────

const TabBar = ({ activeTab, setActiveTab, onClear }) => {
  const tabs = [
    { id: "home", label: "Home", Icon: HomeIcon },
    { id: "plans", label: "Plans", Icon: PlanIcon },
    { id: "friends", label: "Crew", Icon: FriendsIcon },
    { id: "profile", label: "Profile", Icon: ProfileIcon },
  ];

  return (
    <div
      style={{
        height: 82,
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: 10,
        background: `linear-gradient(to top, ${colors.bg} 60%, transparent)`,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (onClear) onClear();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: isActive ? colors.accent : colors.textMuted,
              transition: "color 0.2s",
              padding: "4px 16px",
            }}
          >
            <tab.Icon />
            <span style={{ fontFamily: fonts.body, fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{ width: 4, height: 4, borderRadius: 2, background: colors.accent, marginTop: -2 }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Root Export ──────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
