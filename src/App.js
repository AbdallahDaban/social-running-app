import React from "react";
import { useState, useEffect, useCallback } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────
const MOCK_USER = {
  id: "u1",
  name: "You",
  avatar: "🏃",
  weeklyMileage: 32.4,
  totalRuns: 147,
  avgPace: "5:24",
  streak: 12,
  friends: ["u2", "u3", "u4"],
};

const MOCK_FRIENDS = [
  {
    id: "u2",
    name: "Sarah K.",
    avatar: "🏃‍♀️",
    weeklyMileage: 28.1,
    avgPace: "5:45",
    streak: 8,
  },
  {
    id: "u3",
    name: "Mike R.",
    avatar: "🏃‍♂️",
    weeklyMileage: 41.2,
    avgPace: "4:58",
    streak: 21,
  },
  {
    id: "u4",
    name: "Lina T.",
    avatar: "🏃‍♀️",
    weeklyMileage: 19.6,
    avgPace: "6:12",
    streak: 5,
  },
];

const TRAINING_PLANS = [
  {
    id: "tp1",
    title: "10K Race Ready",
    subtitle: "8-week progressive plan",
    difficulty: "Intermediate",
    weeks: 8,
    color: "#FF5733",
    icon: "🔥",
    description:
      "Build your speed and endurance for a strong 10K finish. Includes tempo runs, intervals, and strategic long runs.",
    schedule: [
      {
        week: 1,
        sessions: [
          {
            day: "Mon",
            type: "Easy Run",
            distance: 4,
            pace: "6:00-6:30",
            done: true,
          },
          {
            day: "Wed",
            type: "Tempo Run",
            distance: 5,
            pace: "5:15-5:30",
            done: true,
          },
          {
            day: "Fri",
            type: "Intervals",
            distance: 6,
            pace: "4:45-5:00",
            done: true,
          },
          {
            day: "Sun",
            type: "Long Run",
            distance: 8,
            pace: "6:00-6:20",
            done: false,
          },
        ],
      },
      {
        week: 2,
        sessions: [
          {
            day: "Mon",
            type: "Easy Run",
            distance: 5,
            pace: "6:00-6:30",
            done: false,
          },
          {
            day: "Wed",
            type: "Tempo Run",
            distance: 6,
            pace: "5:10-5:25",
            done: false,
          },
          {
            day: "Fri",
            type: "Intervals",
            distance: 6,
            pace: "4:40-4:55",
            done: false,
          },
          {
            day: "Sun",
            type: "Long Run",
            distance: 10,
            pace: "5:50-6:15",
            done: false,
          },
        ],
      },
      {
        week: 3,
        sessions: [
          {
            day: "Mon",
            type: "Recovery",
            distance: 3,
            pace: "6:30-7:00",
            done: false,
          },
          {
            day: "Wed",
            type: "Hill Repeats",
            distance: 5,
            pace: "5:00-5:20",
            done: false,
          },
          {
            day: "Fri",
            type: "Tempo Run",
            distance: 7,
            pace: "5:10-5:25",
            done: false,
          },
          {
            day: "Sun",
            type: "Long Run",
            distance: 11,
            pace: "5:50-6:10",
            done: false,
          },
        ],
      },
    ],
    members: [
      { id: "u1", name: "You", avatar: "🏃", progress: 37, currentWeek: 1 },
      { id: "u3", name: "Mike R.", avatar: "🏃‍♂️", progress: 50, currentWeek: 2 },
    ],
  },
  {
    id: "tp2",
    title: "Half Marathon",
    subtitle: "12-week endurance builder",
    difficulty: "Advanced",
    weeks: 12,
    color: "#2196F3",
    icon: "🏔️",
    description:
      "A comprehensive 12-week program to get you across the half marathon finish line with confidence.",
    schedule: [
      {
        week: 1,
        sessions: [
          {
            day: "Mon",
            type: "Easy Run",
            distance: 5,
            pace: "6:00-6:30",
            done: false,
          },
          {
            day: "Wed",
            type: "Tempo Run",
            distance: 6,
            pace: "5:20-5:40",
            done: false,
          },
          {
            day: "Fri",
            type: "Easy Run",
            distance: 5,
            pace: "6:00-6:30",
            done: false,
          },
          {
            day: "Sun",
            type: "Long Run",
            distance: 12,
            pace: "6:00-6:30",
            done: false,
          },
        ],
      },
    ],
    members: [
      {
        id: "u2",
        name: "Sarah K.",
        avatar: "🏃‍♀️",
        progress: 25,
        currentWeek: 3,
      },
    ],
  },
  {
    id: "tp3",
    title: "Couch to 5K",
    subtitle: "6-week beginner plan",
    difficulty: "Beginner",
    weeks: 6,
    color: "#4CAF50",
    icon: "🌱",
    description:
      "Start your running journey with this gentle, progressive plan designed for absolute beginners.",
    schedule: [
      {
        week: 1,
        sessions: [
          {
            day: "Mon",
            type: "Walk/Run",
            distance: 2,
            pace: "7:30-8:00",
            done: false,
          },
          {
            day: "Wed",
            type: "Walk/Run",
            distance: 2,
            pace: "7:30-8:00",
            done: false,
          },
          {
            day: "Fri",
            type: "Walk/Run",
            distance: 2.5,
            pace: "7:00-7:30",
            done: false,
          },
        ],
      },
    ],
    members: [
      { id: "u4", name: "Lina T.", avatar: "🏃‍♀️", progress: 60, currentWeek: 4 },
    ],
  },
];

const ACTIVITY_FEED = [
  {
    id: "a1",
    user: MOCK_FRIENDS[1],
    action: "completed",
    detail: "Tempo Run — 6km @ 5:12/km",
    time: "2h ago",
    plan: "10K Race Ready",
  },
  {
    id: "a2",
    user: MOCK_FRIENDS[0],
    action: "joined",
    detail: "Half Marathon plan",
    time: "5h ago",
    plan: null,
  },
  {
    id: "a3",
    user: MOCK_FRIENDS[2],
    action: "completed",
    detail: "Walk/Run — 2.5km",
    time: "1d ago",
    plan: "Couch to 5K",
  },
  {
    id: "a4",
    user: MOCK_FRIENDS[1],
    action: "milestone",
    detail: "Finished Week 1 of 10K Race Ready 🎉",
    time: "1d ago",
    plan: null,
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────
const font = `'DM Sans', sans-serif`;
const fontDisplay = `'Outfit', sans-serif`;

const colors = {
  bg: "#0A0A0F",
  card: "#141420",
  cardHover: "#1A1A2E",
  accent: "#FF4D00",
  accentGlow: "rgba(255, 77, 0, 0.25)",
  accentSoft: "#FF4D0020",
  green: "#00E676",
  blue: "#448AFF",
  purple: "#B388FF",
  text: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555570",
  border: "#1E1E35",
  surface: "#111118",
};

// ─── Icons (inline SVG components) ───────────────────────────────────────
const Icons = {
  Home: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Plan: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Friends: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Profile: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Arrow: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Back: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Fire: () => <span style={{ fontSize: 18 }}>🔥</span>,
  Heart: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
};

// ─── Animations via style tag ────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { background: ${colors.bg}; overflow: hidden; }
    
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px ${colors.accentGlow}; }
      50% { box-shadow: 0 0 40px ${colors.accentGlow}, 0 0 60px rgba(255,77,0,0.1); }
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    
    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .slide-in { animation: slideIn 0.4s ease forwards; }
    
    ::-webkit-scrollbar { width: 0; height: 0; }
  `}</style>
);

// ─── Components ──────────────────────────────────────────────────────────

const StatCard = ({ label, value, unit, color, delay = 0 }) => (
  <div
    className="fade-up"
    style={{
      background: colors.card,
      borderRadius: 16,
      padding: "16px 14px",
      flex: 1,
      minWidth: 0,
      animationDelay: `${delay}ms`,
      opacity: 0,
      border: `1px solid ${colors.border}`,
    }}
  >
    <div
      style={{
        fontFamily: font,
        fontSize: 11,
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: fontDisplay,
        fontSize: 26,
        fontWeight: 800,
        color: color || colors.text,
        lineHeight: 1,
      }}
    >
      {value}
      {unit && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: colors.textSecondary,
            marginLeft: 3,
          }}
        >
          {unit}
        </span>
      )}
    </div>
  </div>
);

const ProgressRing = ({
  progress,
  size = 44,
  strokeWidth = 4,
  color = colors.accent,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.border}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
};

// ─── Tab: Home / Feed ────────────────────────────────────────────────────
const HomeTab = ({ setActiveTab, setSelectedPlan }) => {
  const userPlans = TRAINING_PLANS.filter((p) =>
    p.members.some((m) => m.id === "u1"),
  );
  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Header */}
      <div className="fade-up" style={{ paddingTop: 20, marginBottom: 28 }}>
        <div
          style={{
            fontFamily: font,
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 4,
          }}
        >
          Good morning
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 30,
            fontWeight: 800,
            color: colors.text,
          }}
        >
          Let's run <span style={{ color: colors.accent }}>together</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <StatCard
          label="This Week"
          value={MOCK_USER.weeklyMileage}
          unit="km"
          color={colors.accent}
          delay={100}
        />
        <StatCard
          label="Avg Pace"
          value={MOCK_USER.avgPace}
          unit="/km"
          delay={200}
        />
        <StatCard
          label="Streak"
          value={MOCK_USER.streak}
          unit="days"
          color={colors.green}
          delay={300}
        />
      </div>

      {/* Active Plan Preview */}
      {userPlans.length > 0 && (
        <div
          className="fade-up"
          style={{ marginBottom: 28, animationDelay: "350ms", opacity: 0 }}
        >
          <div
            style={{
              fontFamily: fontDisplay,
              fontSize: 16,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Your Active Plan
          </div>
          {userPlans.map((plan) => {
            const me = plan.members.find((m) => m.id === "u1");
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  background: `linear-gradient(135deg, ${plan.color}15, ${colors.card})`,
                  border: `1px solid ${plan.color}30`,
                  borderRadius: 18,
                  padding: 18,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: fontDisplay,
                        fontSize: 18,
                        fontWeight: 700,
                        color: colors.text,
                      }}
                    >
                      {plan.icon} {plan.title}
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      Week {me.currentWeek} of {plan.weeks}
                    </div>
                  </div>
                  <ProgressRing progress={me.progress} color={plan.color} />
                </div>
                {/* Next session */}
                {plan.schedule[0] && (
                  <div
                    style={{
                      background: colors.bg,
                      borderRadius: 12,
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: 12,
                          color: colors.textMuted,
                          marginBottom: 2,
                        }}
                      >
                        NEXT SESSION
                      </div>
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: 14,
                          fontWeight: 600,
                          color: colors.text,
                        }}
                      >
                        {plan.schedule[0].sessions.find((s) => !s.done)?.type ||
                          "All done!"}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 12,
                        color: plan.color,
                        background: `${plan.color}15`,
                        padding: "4px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {plan.schedule[0].sessions.find((s) => !s.done)?.pace ||
                        "—"}
                    </div>
                  </div>
                )}
                {/* Members */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 12,
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex" }}>
                    {plan.members.map((m, i) => (
                      <div
                        key={m.id}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          background: colors.surface,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          marginLeft: i > 0 ? -8 : 0,
                          border: `2px solid ${colors.card}`,
                          position: "relative",
                          zIndex: plan.members.length - i,
                        }}
                      >
                        {m.avatar}
                      </div>
                    ))}
                  </div>
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    {plan.members.length} runner
                    {plan.members.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Feed */}
      <div className="fade-up" style={{ animationDelay: "450ms", opacity: 0 }}>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 14,
          }}
        >
          Friend Activity
        </div>
        {ACTIVITY_FEED.map((item, i) => (
          <div
            key={item.id}
            className="fade-up"
            style={{
              background: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              border: `1px solid ${colors.border}`,
              animationDelay: `${500 + i * 80}ms`,
              opacity: 0,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: colors.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {item.user.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontFamily: font, fontSize: 14, color: colors.text }}
                >
                  <strong>{item.user.name}</strong>
                  <span style={{ color: colors.textSecondary }}>
                    {" "}
                    {item.action === "completed"
                      ? "completed"
                      : item.action === "joined"
                        ? "joined"
                        : "hit a milestone"}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginTop: 3,
                  }}
                >
                  {item.detail}
                </div>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    color: colors.textMuted,
                    marginTop: 6,
                  }}
                >
                  {item.time}
                </div>
              </div>
              {item.action === "completed" && (
                <div style={{ color: colors.green, marginTop: 2 }}>
                  <Icons.Check />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Training Plans ─────────────────────────────────────────────────
const PlansTab = ({ setSelectedPlan }) => (
  <div style={{ padding: "0 20px 100px" }}>
    <div className="fade-up" style={{ paddingTop: 20, marginBottom: 24 }}>
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 26,
          fontWeight: 800,
          color: colors.text,
        }}
      >
        Training Plans
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 4,
        }}
      >
        Train smarter, run together
      </div>
    </div>

    {TRAINING_PLANS.map((plan, i) => {
      const isJoined = plan.members.some((m) => m.id === "u1");
      return (
        <div
          key={plan.id}
          className="fade-up"
          onClick={() => setSelectedPlan(plan)}
          style={{
            background: colors.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 14,
            border: `1px solid ${colors.border}`,
            cursor: "pointer",
            animationDelay: `${100 + i * 100}ms`,
            opacity: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              height: "100%",
              background: plan.color,
              borderRadius: "20px 0 0 20px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 22 }}>{plan.icon}</span>
                <div
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: 20,
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  {plan.title}
                </div>
              </div>
              <div
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 10,
                }}
              >
                {plan.subtitle}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: `${plan.color}15`,
                    color: plan.color,
                    fontWeight: 600,
                  }}
                >
                  {plan.difficulty}
                </span>
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: colors.surface,
                    color: colors.textSecondary,
                  }}
                >
                  {plan.weeks} weeks
                </span>
              </div>
            </div>
            {isJoined && (
              <div
                style={{
                  background: `${colors.green}20`,
                  color: colors.green,
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                }}
              >
                Joined
              </div>
            )}
          </div>

          {/* Members */}
          {plan.members.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 14,
                gap: 8,
              }}
            >
              <div style={{ display: "flex" }}>
                {plan.members.slice(0, 4).map((m, j) => (
                  <div
                    key={m.id}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      background: colors.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      marginLeft: j > 0 ? -6 : 0,
                      border: `2px solid ${colors.card}`,
                      position: "relative",
                      zIndex: 10 - j,
                    }}
                  >
                    {m.avatar}
                  </div>
                ))}
              </div>
              <span
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                {plan.members.map((m) => m.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Plan Detail View ────────────────────────────────────────────────────
const PlanDetail = ({ plan, onBack }) => {
  const [joined, setJoined] = useState(plan.members.some((m) => m.id === "u1"));
  const [expandedWeek, setExpandedWeek] = useState(0);

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingTop: 20,
          marginBottom: 20,
        }}
      >
        <div
          onClick={onBack}
          style={{ cursor: "pointer", color: colors.textSecondary, padding: 4 }}
        >
          <Icons.Back />
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
          }}
        >
          {plan.icon} {plan.title}
        </div>
      </div>

      {/* Description */}
      <div
        className="fade-up"
        style={{
          background: `linear-gradient(135deg, ${plan.color}10, ${colors.card})`,
          borderRadius: 18,
          padding: 20,
          marginBottom: 20,
          border: `1px solid ${plan.color}25`,
        }}
      >
        <div
          style={{
            fontFamily: font,
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.6,
          }}
        >
          {plan.description}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <div
            style={{
              flex: 1,
              background: colors.bg,
              borderRadius: 12,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 20,
                fontWeight: 800,
                color: plan.color,
              }}
            >
              {plan.weeks}
            </div>
            <div
              style={{
                fontFamily: font,
                fontSize: 11,
                color: colors.textMuted,
              }}
            >
              Weeks
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: colors.bg,
              borderRadius: 12,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 20,
                fontWeight: 800,
                color: plan.color,
              }}
            >
              {plan.schedule.reduce((a, w) => a + w.sessions.length, 0)}
            </div>
            <div
              style={{
                fontFamily: font,
                fontSize: 11,
                color: colors.textMuted,
              }}
            >
              Sessions
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: colors.bg,
              borderRadius: 12,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 20,
                fontWeight: 800,
                color: plan.color,
              }}
            >
              {plan.members.length}
            </div>
            <div
              style={{
                fontFamily: font,
                fontSize: 11,
                color: colors.textMuted,
              }}
            >
              Runners
            </div>
          </div>
        </div>
      </div>

      {/* Join Button */}
      {!joined && (
        <div
          className="fade-up"
          style={{ animationDelay: "150ms", opacity: 0, marginBottom: 24 }}
        >
          <button
            onClick={() => setJoined(true)}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 16,
              border: "none",
              background: `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`,
              color: "#fff",
              fontFamily: fontDisplay,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              animation: "glow 2s ease infinite",
            }}
          >
            Join This Plan
          </button>
        </div>
      )}
      {joined && (
        <div
          className="fade-up"
          style={{
            background: `${colors.green}12`,
            border: `1px solid ${colors.green}30`,
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 8,
            animationDelay: "150ms",
            opacity: 0,
          }}
        >
          <Icons.Check />
          <span
            style={{
              fontFamily: font,
              fontSize: 14,
              color: colors.green,
              fontWeight: 600,
            }}
          >
            You're in this plan
          </span>
        </div>
      )}

      {/* Group Progress */}
      <div
        className="fade-up"
        style={{ marginBottom: 24, animationDelay: "200ms", opacity: 0 }}
      >
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 14,
          }}
        >
          Group Progress
        </div>
        {plan.members.map((member, i) => (
          <div
            key={member.id}
            className="fade-up"
            style={{
              background: colors.card,
              borderRadius: 14,
              padding: 14,
              marginBottom: 8,
              border: `1px solid ${colors.border}`,
              animationDelay: `${250 + i * 80}ms`,
              opacity: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    background: colors.surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                  }}
                >
                  {member.avatar}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: font,
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.text,
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontFamily: font,
                      fontSize: 11,
                      color: colors.textMuted,
                    }}
                  >
                    Week {member.currentWeek}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontFamily: fontDisplay,
                  fontSize: 18,
                  fontWeight: 700,
                  color: plan.color,
                }}
              >
                {member.progress}%
              </div>
            </div>
            <div
              style={{
                background: colors.bg,
                borderRadius: 6,
                height: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${plan.color}, ${plan.color}AA)`,
                  width: `${member.progress}%`,
                  animation: "progressFill 1s ease forwards",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Schedule */}
      <div className="fade-up" style={{ animationDelay: "350ms", opacity: 0 }}>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 14,
          }}
        >
          Weekly Schedule
        </div>
        {plan.schedule.map((week, wi) => (
          <div key={wi} style={{ marginBottom: 10 }}>
            <div
              onClick={() => setExpandedWeek(expandedWeek === wi ? -1 : wi)}
              style={{
                background:
                  expandedWeek === wi ? `${plan.color}10` : colors.card,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                border: `1px solid ${expandedWeek === wi ? `${plan.color}30` : colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  fontFamily: font,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                Week {week.week}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  {week.sessions.filter((s) => s.done).length}/
                  {week.sessions.length}
                </span>
                <span
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    transform:
                      expandedWeek === wi ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    display: "inline-block",
                  }}
                >
                  ▶
                </span>
              </div>
            </div>
            {expandedWeek === wi && (
              <div style={{ marginTop: 6 }}>
                {week.sessions.map((session, si) => (
                  <div
                    key={si}
                    style={{
                      background: colors.surface,
                      borderRadius: 12,
                      padding: "12px 16px",
                      marginBottom: 4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderLeft: `3px solid ${session.done ? colors.green : colors.textMuted}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: font,
                            fontSize: 11,
                            color: colors.textMuted,
                            width: 30,
                          }}
                        >
                          {session.day}
                        </span>
                        <span
                          style={{
                            fontFamily: font,
                            fontSize: 13,
                            fontWeight: 600,
                            color: session.done
                              ? colors.textSecondary
                              : colors.text,
                            textDecoration: session.done
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {session.type}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 2,
                          marginLeft: 36,
                        }}
                      >
                        {session.distance}km
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 11,
                        fontWeight: 600,
                        color: plan.color,
                        background: `${plan.color}12`,
                        padding: "3px 8px",
                        borderRadius: 8,
                      }}
                    >
                      {session.pace} /km
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Friends ────────────────────────────────────────────────────────
const FriendsTab = () => (
  <div style={{ padding: "0 20px 100px" }}>
    <div className="fade-up" style={{ paddingTop: 20, marginBottom: 24 }}>
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 26,
          fontWeight: 800,
          color: colors.text,
        }}
      >
        Running Crew
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 4,
        }}
      >
        {MOCK_FRIENDS.length} friends
      </div>
    </div>

    {MOCK_FRIENDS.map((friend, i) => {
      const friendPlans = TRAINING_PLANS.filter((p) =>
        p.members.some((m) => m.id === friend.id),
      );
      return (
        <div
          key={friend.id}
          className="fade-up"
          style={{
            background: colors.card,
            borderRadius: 18,
            padding: 18,
            marginBottom: 12,
            border: `1px solid ${colors.border}`,
            animationDelay: `${100 + i * 100}ms`,
            opacity: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                background: colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              {friend.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: fontDisplay,
                  fontSize: 17,
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                {friend.name}
              </div>
              <div
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {friend.streak} day streak {friend.streak >= 10 ? "🔥" : ""}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                flex: 1,
                background: colors.bg,
                borderRadius: 12,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: fontDisplay,
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.accent,
                }}
              >
                {friend.weeklyMileage}
              </div>
              <div
                style={{
                  fontFamily: font,
                  fontSize: 10,
                  color: colors.textMuted,
                }}
              >
                km/week
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: colors.bg,
                borderRadius: 12,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: fontDisplay,
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.blue,
                }}
              >
                {friend.avgPace}
              </div>
              <div
                style={{
                  fontFamily: font,
                  fontSize: 10,
                  color: colors.textMuted,
                }}
              >
                avg pace
              </div>
            </div>
          </div>
          {friendPlans.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {friendPlans.map((p) => (
                <span
                  key={p.id}
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    fontWeight: 600,
                    background: `${p.color}15`,
                    color: p.color,
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {p.icon} {p.title}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    })}

    {/* Invite */}
    <div
      className="fade-up"
      style={{
        background: colors.card,
        borderRadius: 18,
        padding: 20,
        border: `1px dashed ${colors.textMuted}`,
        textAlign: "center",
        marginTop: 8,
        animationDelay: "500ms",
        opacity: 0,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>👟</div>
      <div
        style={{ fontFamily: font, fontSize: 14, color: colors.textSecondary }}
      >
        Invite friends to run together
      </div>
      <button
        style={{
          marginTop: 12,
          padding: "10px 28px",
          borderRadius: 12,
          border: "none",
          background: colors.accent,
          color: "#fff",
          fontFamily: font,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Share Invite Link
      </button>
    </div>
  </div>
);

// ─── Tab: Profile ────────────────────────────────────────────────────────
const ProfileTab = () => {
  const badges = [
    { icon: "🏅", label: "100+ Runs", unlocked: true },
    { icon: "🔥", label: "10 Day Streak", unlocked: true },
    { icon: "⚡", label: "Sub-5 Pace", unlocked: false },
    { icon: "🏔️", label: "Half Marathon", unlocked: false },
    { icon: "🌙", label: "Night Runner", unlocked: true },
    { icon: "🤝", label: "Team Player", unlocked: true },
  ];

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Profile Header */}
      <div
        className="fade-up"
        style={{
          paddingTop: 20,
          textAlign: "center",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: `linear-gradient(135deg, ${colors.accent}30, ${colors.card})`,
            border: `3px solid ${colors.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 14px",
          }}
        >
          {MOCK_USER.avatar}
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 24,
            fontWeight: 800,
            color: colors.text,
          }}
        >
          Runner
        </div>
        <div
          style={{
            fontFamily: font,
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 4,
          }}
        >
          Member since 2024
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 28,
        }}
      >
        <StatCard label="Total Runs" value={MOCK_USER.totalRuns} delay={100} />
        <StatCard
          label="This Week"
          value={MOCK_USER.weeklyMileage}
          unit="km"
          color={colors.accent}
          delay={200}
        />
        <StatCard
          label="Avg Pace"
          value={MOCK_USER.avgPace}
          unit="/km"
          delay={300}
        />
        <StatCard
          label="Streak"
          value={MOCK_USER.streak}
          unit="days"
          color={colors.green}
          delay={400}
        />
      </div>

      {/* Badges */}
      <div
        className="fade-up"
        style={{ animationDelay: "300ms", opacity: 0, marginBottom: 28 }}
      >
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 14,
          }}
        >
          Achievements
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {badges.map((b, i) => (
            <div
              key={i}
              style={{
                background: b.unlocked ? colors.card : colors.surface,
                borderRadius: 14,
                padding: "14px 8px",
                textAlign: "center",
                border: `1px solid ${b.unlocked ? colors.border : "transparent"}`,
                opacity: b.unlocked ? 1 : 0.4,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{b.icon}</div>
              <div
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  color: b.unlocked ? colors.textSecondary : colors.textMuted,
                }}
              >
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings placeholders */}
      <div className="fade-up" style={{ animationDelay: "450ms", opacity: 0 }}>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 14,
          }}
        >
          Settings
        </div>
        {[
          "Edit Profile",
          "Notifications",
          "Units & Preferences",
          "Privacy",
          "Help & Support",
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: colors.card,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 6,
              border: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <span
              style={{ fontFamily: font, fontSize: 14, color: colors.text }}
            >
              {item}
            </span>
            <span style={{ color: colors.textMuted, fontSize: 14 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────────
export default function RunTogether() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const tabs = [
    { id: "home", label: "Home", Icon: Icons.Home },
    { id: "plans", label: "Plans", Icon: Icons.Plan },
    { id: "friends", label: "Crew", Icon: Icons.Friends },
    { id: "profile", label: "Profile", Icon: Icons.Profile },
  ];

  const handleBack = useCallback(() => setSelectedPlan(null), []);

  return (
    <div
      style={{
        fontFamily: font,
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
      <GlobalStyles />

      {/* Status bar mockup */}
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
        <span
          style={{
            fontFamily: font,
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          9:41
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div
            style={{
              width: 16,
              height: 10,
              border: `1.5px solid ${colors.text}`,
              borderRadius: 2,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 1.5,
                left: 1.5,
                bottom: 1.5,
                right: 3,
                background: colors.text,
                borderRadius: 0.5,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {selectedPlan ? (
          <PlanDetail plan={selectedPlan} onBack={handleBack} />
        ) : activeTab === "home" ? (
          <HomeTab
            setActiveTab={setActiveTab}
            setSelectedPlan={setSelectedPlan}
          />
        ) : activeTab === "plans" ? (
          <PlansTab setSelectedPlan={setSelectedPlan} />
        ) : activeTab === "friends" ? (
          <FriendsTab />
        ) : (
          <ProfileTab />
        )}
      </div>

      {/* Tab Bar */}
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
          const isActive = activeTab === tab.id && !selectedPlan;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedPlan(null);
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
              <span
                style={{
                  fontFamily: font,
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: colors.accent,
                    marginTop: -2,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
