// ═══════════════════════════════════════════════════════════════
// src/data/plans.js — Default training plans
// ═══════════════════════════════════════════════════════════════

const DEFAULT_PLANS = [
  {
    id: "plan_10k",
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
          { day: "Mon", type: "Easy Run", distance: 4, pace: "6:00-6:30" },
          { day: "Wed", type: "Tempo Run", distance: 5, pace: "5:15-5:30" },
          { day: "Fri", type: "Intervals", distance: 6, pace: "4:45-5:00" },
          { day: "Sun", type: "Long Run", distance: 8, pace: "6:00-6:20" },
        ],
      },
      {
        week: 2,
        sessions: [
          { day: "Mon", type: "Easy Run", distance: 5, pace: "6:00-6:30" },
          { day: "Wed", type: "Tempo Run", distance: 6, pace: "5:10-5:25" },
          { day: "Fri", type: "Intervals", distance: 6, pace: "4:40-4:55" },
          { day: "Sun", type: "Long Run", distance: 10, pace: "5:50-6:15" },
        ],
      },
      {
        week: 3,
        sessions: [
          { day: "Mon", type: "Recovery", distance: 3, pace: "6:30-7:00" },
          { day: "Wed", type: "Hill Repeats", distance: 5, pace: "5:00-5:20" },
          { day: "Fri", type: "Tempo Run", distance: 7, pace: "5:10-5:25" },
          { day: "Sun", type: "Long Run", distance: 11, pace: "5:50-6:10" },
        ],
      },
      {
        week: 4,
        sessions: [
          { day: "Mon", type: "Easy Run", distance: 4, pace: "6:00-6:30" },
          { day: "Wed", type: "Fartlek", distance: 6, pace: "5:00-6:00" },
          { day: "Fri", type: "Tempo Run", distance: 7, pace: "5:05-5:20" },
          { day: "Sun", type: "Long Run", distance: 12, pace: "5:50-6:10" },
        ],
      },
    ],
    memberIds: [],
    memberProgress: {},
    completedSessions: {},
  },
  {
    id: "plan_half",
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
          { day: "Mon", type: "Easy Run", distance: 5, pace: "6:00-6:30" },
          { day: "Wed", type: "Tempo Run", distance: 6, pace: "5:20-5:40" },
          { day: "Fri", type: "Easy Run", distance: 5, pace: "6:00-6:30" },
          { day: "Sun", type: "Long Run", distance: 12, pace: "6:00-6:30" },
        ],
      },
      {
        week: 2,
        sessions: [
          { day: "Mon", type: "Easy Run", distance: 6, pace: "5:50-6:20" },
          { day: "Wed", type: "Intervals", distance: 7, pace: "5:00-5:20" },
          { day: "Fri", type: "Recovery", distance: 4, pace: "6:30-7:00" },
          { day: "Sun", type: "Long Run", distance: 14, pace: "5:55-6:20" },
        ],
      },
      {
        week: 3,
        sessions: [
          { day: "Mon", type: "Easy Run", distance: 6, pace: "5:50-6:20" },
          { day: "Wed", type: "Tempo Run", distance: 8, pace: "5:15-5:35" },
          { day: "Fri", type: "Hill Repeats", distance: 5, pace: "5:00-5:20" },
          { day: "Sun", type: "Long Run", distance: 16, pace: "5:55-6:15" },
        ],
      },
    ],
    memberIds: [],
    memberProgress: {},
    completedSessions: {},
  },
  {
    id: "plan_c25k",
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
          { day: "Mon", type: "Walk/Run", distance: 2, pace: "7:30-8:00" },
          { day: "Wed", type: "Walk/Run", distance: 2, pace: "7:30-8:00" },
          { day: "Fri", type: "Walk/Run", distance: 2.5, pace: "7:00-7:30" },
        ],
      },
      {
        week: 2,
        sessions: [
          { day: "Mon", type: "Walk/Run", distance: 2.5, pace: "7:00-7:30" },
          { day: "Wed", type: "Easy Run", distance: 3, pace: "7:00-7:30" },
          { day: "Fri", type: "Easy Run", distance: 3, pace: "6:45-7:15" },
        ],
      },
      {
        week: 3,
        sessions: [
          { day: "Mon", type: "Easy Run", distance: 3, pace: "6:45-7:15" },
          { day: "Wed", type: "Easy Run", distance: 3.5, pace: "6:30-7:00" },
          { day: "Fri", type: "Easy Run", distance: 4, pace: "6:30-7:00" },
        ],
      },
    ],
    memberIds: [],
    memberProgress: {},
    completedSessions: {},
  },
];

export default DEFAULT_PLANS;
