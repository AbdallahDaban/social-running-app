import React from "react";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";

// ═══════════════════════════════════════════════════════════════════════════
// RUNTOGETHER — Phase 1 with Firebase Backend
// ═══════════════════════════════════════════════════════════════════════════
//
// SETUP INSTRUCTIONS (read carefully):
//
// 1. Install Firebase:
//    cd C:\Users\User\Desktop\Apps\runtogether
//    npm install firebase
//
// 2. Go to https://console.firebase.google.com
//    - Click "Create a project" → name it "runtogether"
//    - Disable Google Analytics (optional, keeps it simple)
//    - Click "Create project"
//
// 3. Add a Web App:
//    - Click the web icon (</>) on the project overview page
//    - Name it "runtogether-web"
//    - Click "Register app"
//    - Copy the firebaseConfig object (you'll paste it below)
//
// 4. Enable Authentication:
//    - In Firebase console sidebar, click "Authentication"
//    - Click "Get started"
//    - Enable "Email/Password" provider
//
// 5. Enable Firestore Database:
//    - In sidebar, click "Firestore Database"
//    - Click "Create database"
//    - Choose "Start in test mode" (we'll secure it later)
//    - Pick the closest region to you
//    - Click "Enable"
//
// 6. Paste your Firebase config below (replace the placeholder):
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── Firebase Config ─────────────────────────────────────────────────────
// ⚠️ REPLACE THIS with your actual config from Firebase Console
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBGy5gwXFQf2jXM-yfKLMtVgVWPQGZ3PxQ",
  authDomain: "runtogether-a2c76.firebaseapp.com",
  projectId: "runtogether-a2c76",
  storageBucket: "runtogether-a2c76.firebasestorage.app",
  messagingSenderId: "851653093561",
  appId: "1:851653093561:web:652a21f51854cbd5e69368",
};

// ─── Firebase Initialization ─────────────────────────────────────────────
let firebaseApp = null;
let auth = null;
let db = null;
let firebaseReady = false;

const initFirebase = async () => {
  if (firebaseReady) return { auth, db };
  try {
    const firebase = await import("firebase/app");
    const authModule = await import("firebase/auth");
    const firestoreModule = await import("firebase/firestore");
    if (!firebase.getApps || firebase.getApps().length === 0) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      firebaseApp = firebase.getApps()[0];
    }
    auth = authModule.getAuth(firebaseApp);
    db = firestoreModule.getFirestore(firebaseApp);
    firebaseReady = true;
    return { auth, db };
  } catch (err) {
    console.error("Firebase init error:", err);
    return { auth: null, db: null };
  }
};

// ─── Firestore helpers ───────────────────────────────────────────────────
const FS = {
  async getDoc(path) {
    const fs = await import("firebase/firestore");
    const ref = fs.doc(db, path);
    const snap = await fs.getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async setDoc(path, data, merge = true) {
    const fs = await import("firebase/firestore");
    await fs.setDoc(fs.doc(db, path), data, { merge });
  },
  async updateDoc(path, data) {
    const fs = await import("firebase/firestore");
    await fs.updateDoc(fs.doc(db, path), data);
  },
  async addDoc(collPath, data) {
    const fs = await import("firebase/firestore");
    return await fs.addDoc(fs.collection(db, collPath), data);
  },
  async queryDocs(collPath, ...constraints) {
    const fs = await import("firebase/firestore");
    const ref = fs.collection(db, collPath);
    const q = constraints.length > 0 ? fs.query(ref, ...constraints) : ref;
    const snap = await fs.getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async helpers() {
    const fs = await import("firebase/firestore");
    return {
      where: fs.where,
      orderBy: fs.orderBy,
      limit: fs.limit,
      arrayUnion: fs.arrayUnion,
      arrayRemove: fs.arrayRemove,
      serverTimestamp: fs.serverTimestamp,
      Timestamp: fs.Timestamp,
    };
  },
};

const AUTH = {
  async signUp(email, pw) {
    const m = await import("firebase/auth");
    return m.createUserWithEmailAndPassword(auth, email, pw);
  },
  async signIn(email, pw) {
    const m = await import("firebase/auth");
    return m.signInWithEmailAndPassword(auth, email, pw);
  },
  async signOut() {
    const m = await import("firebase/auth");
    return m.signOut(auth);
  },
  async updateProfile(user, data) {
    const m = await import("firebase/auth");
    return m.updateProfile(user, data);
  },
  onAuthChanged(cb) {
    import("firebase/auth").then((m) => m.onAuthStateChanged(auth, cb));
  },
};

// ─── Default Training Plans ──────────────────────────────────────────────
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
    ],
    memberIds: [],
    memberProgress: {},
    completedSessions: {},
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────
const font = `'DM Sans', sans-serif`;
const fontDisplay = `'Outfit', sans-serif`;
const C = {
  bg: "#0A0A0F",
  card: "#141420",
  accent: "#FF4D00",
  accentGlow: "rgba(255,77,0,0.25)",
  green: "#00E676",
  blue: "#448AFF",
  purple: "#B388FF",
  text: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555570",
  border: "#1E1E35",
  surface: "#111118",
  error: "#FF5252",
};

// ─── Icons ───────────────────────────────────────────────────────────────
const I = {
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
  Plus: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  LogOut: () => (
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
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Eye: () => (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
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
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
};

const GlobalStyles = () => (
  <style>{`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: ${C.bg}; overflow: hidden; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes progressFill { from { width: 0%; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 20px ${C.accentGlow}; } 50% { box-shadow: 0 0 40px ${C.accentGlow}; } }
  .fade-up { animation: fadeUp 0.5s ease forwards; }
  ::-webkit-scrollbar { width: 0; height: 0; }
  input::placeholder { color: ${C.textMuted}; }
`}</style>
);

// ─── Shared Components ───────────────────────────────────────────────────
const Spinner = ({ size = 24, color = C.accent }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `3px solid ${C.border}`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

const LoadingScreen = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: C.bg,
    }}
  >
    <GlobalStyles />
    <div style={{ fontSize: 48, marginBottom: 20 }}>🏃</div>
    <Spinner size={32} />
    <div
      style={{
        fontFamily: fontDisplay,
        fontSize: 14,
        color: C.textSecondary,
        marginTop: 16,
      }}
    >
      Loading RunTogether...
    </div>
  </div>
);

const StatCard = ({ label, value, unit, color: cc, delay = 0 }) => (
  <div
    className="fade-up"
    style={{
      background: C.card,
      borderRadius: 16,
      padding: "16px 14px",
      flex: 1,
      minWidth: 0,
      animationDelay: `${delay}ms`,
      opacity: 0,
      border: `1px solid ${C.border}`,
    }}
  >
    <div
      style={{
        fontFamily: font,
        fontSize: 11,
        color: C.textSecondary,
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
        color: cc || C.text,
        lineHeight: 1,
      }}
    >
      {value}
      {unit && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.textSecondary,
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
  color = C.accent,
}) => {
  const r = (size - strokeWidth) / 2,
    circ = r * 2 * Math.PI;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.border}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={circ - (progress / 100) * circ}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
};

const Btn = ({
  children,
  onClick,
  loading,
  variant = "primary",
  style: s = {},
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      width: "100%",
      padding: "16px 0",
      borderRadius: 14,
      border: variant === "primary" ? "none" : `1px solid ${C.border}`,
      background:
        variant === "primary"
          ? `linear-gradient(135deg, ${C.accent}, #E64400)`
          : "transparent",
      color: variant === "primary" ? "#fff" : C.textSecondary,
      fontFamily: fontDisplay,
      fontSize: 16,
      fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      ...s,
    }}
  >
    {loading ? <Spinner size={20} color="#fff" /> : children}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (mode === "signup" && !displayName) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await AUTH.signUp(email, password);
        await AUTH.updateProfile(cred.user, { displayName });
        await FS.setDoc(`users/${cred.user.uid}`, {
          displayName,
          email,
          avatar: "🏃",
          createdAt: new Date().toISOString(),
          weeklyMileage: 0,
          totalRuns: 0,
          avgPace: "0:00",
          streak: 0,
          friends: [],
          joinedPlans: [],
        });
        onAuth(cred.user);
      } else {
        const cred = await AUTH.signIn(email, password);
        onAuth(cred.user);
      }
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "No account with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/email-already-in-use": "Email already registered",
        "auth/invalid-email": "Invalid email",
        "auth/too-many-requests": "Too many attempts, try later",
      };
      setError(msgs[err.code] || "Something went wrong");
    }
    setLoading(false);
  };

  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "14px 16px",
    background: C.surface,
    border: `1px solid ${hasErr ? C.error : C.border}`,
    borderRadius: 12,
    color: C.text,
    fontFamily: font,
    fontSize: 15,
    outline: "none",
  });

  return (
    <div
      style={{
        height: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      <GlobalStyles />
      <div
        className="fade-up"
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏃</div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 32,
            fontWeight: 900,
            color: C.text,
          }}
        >
          Run<span style={{ color: C.accent }}>Together</span>
        </div>
        <div
          style={{
            fontFamily: font,
            fontSize: 14,
            color: C.textSecondary,
            marginTop: 6,
          }}
        >
          {mode === "login" ? "Welcome back, runner" : "Join the crew"}
        </div>
      </div>
      <div className="fade-up" style={{ animationDelay: "100ms", opacity: 0 }}>
        {mode === "signup" && (
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontFamily: font,
                fontSize: 12,
                color: C.textSecondary,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your Name
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Abdallah"
              style={inputStyle(false)}
            />
          </div>
        )}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: font,
              fontSize: 12,
              color: C.textSecondary,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Email
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="runner@example.com"
            style={inputStyle(false)}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: font,
              fontSize: 12,
              color: C.textSecondary,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Password
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{ ...inputStyle(false), paddingRight: 44 }}
            />
            <div
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: C.textMuted,
                padding: 4,
              }}
            >
              {showPw ? <I.EyeOff /> : <I.Eye />}
            </div>
          </div>
        </div>
        {error && (
          <div
            style={{
              background: `${C.error}15`,
              border: `1px solid ${C.error}30`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 16,
              fontFamily: font,
              fontSize: 13,
              color: C.error,
            }}
          >
            {error}
          </div>
        )}
        <Btn onClick={submit} loading={loading}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </Btn>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span
            style={{ fontFamily: font, fontSize: 14, color: C.textSecondary }}
          >
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <span
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            style={{
              fontFamily: font,
              fontSize: 14,
              color: C.accent,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// APP TABS
// ═══════════════════════════════════════════════════════════════════════════
const HomeTab = ({ userData, plans, activities, setSelectedPlan }) => {
  const userPlans = plans.filter((p) => p.memberIds?.includes(userData?.id));
  const h = new Date().getHours();
  const greeting =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "0 20px 100px" }}>
      <div className="fade-up" style={{ paddingTop: 20, marginBottom: 28 }}>
        <div
          style={{
            fontFamily: font,
            fontSize: 14,
            color: C.textSecondary,
            marginBottom: 4,
          }}
        >
          {greeting}
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 30,
            fontWeight: 800,
            color: C.text,
          }}
        >
          Let's run <span style={{ color: C.accent }}>together</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <StatCard
          label="This Week"
          value={userData?.weeklyMileage || 0}
          unit="km"
          color={C.accent}
          delay={100}
        />
        <StatCard
          label="Avg Pace"
          value={userData?.avgPace || "0:00"}
          unit="/km"
          delay={200}
        />
        <StatCard
          label="Streak"
          value={userData?.streak || 0}
          unit="days"
          color={C.green}
          delay={300}
        />
      </div>
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
              color: C.text,
              marginBottom: 14,
            }}
          >
            Your Active Plans
          </div>
          {userPlans.map((plan) => {
            const mp = plan.memberProgress?.[userData.id] || {
              progress: 0,
              currentWeek: 1,
            };
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  background: `linear-gradient(135deg, ${plan.color}15, ${C.card})`,
                  border: `1px solid ${plan.color}30`,
                  borderRadius: 18,
                  padding: 18,
                  cursor: "pointer",
                  marginBottom: 10,
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
                        color: C.text,
                      }}
                    >
                      {plan.icon} {plan.title}
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        color: C.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      Week {mp.currentWeek} of {plan.weeks}
                    </div>
                  </div>
                  <ProgressRing progress={mp.progress} color={plan.color} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {(plan.memberIds || []).slice(0, 4).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        background: C.surface,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        marginLeft: i > 0 ? -8 : 0,
                        border: `2px solid ${C.card}`,
                        position: "relative",
                        zIndex: 10 - i,
                      }}
                    >
                      🏃
                    </div>
                  ))}
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 12,
                      color: C.textSecondary,
                    }}
                  >
                    {plan.memberIds?.length || 0} runners
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="fade-up" style={{ animationDelay: "450ms", opacity: 0 }}>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            marginBottom: 14,
          }}
        >
          Recent Activity
        </div>
        {activities.length === 0 && (
          <div
            style={{
              background: C.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${C.border}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>👟</div>
            <div
              style={{ fontFamily: font, fontSize: 14, color: C.textSecondary }}
            >
              No activity yet. Join a plan to get started!
            </div>
          </div>
        )}
        {activities.map((item, i) => (
          <div
            key={item.id || i}
            className="fade-up"
            style={{
              background: C.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              border: `1px solid ${C.border}`,
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
                  background: C.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {item.avatar || "🏃"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: font, fontSize: 14, color: C.text }}>
                  <strong>{item.userName}</strong>{" "}
                  <span style={{ color: C.textSecondary }}>{item.action}</span>
                </div>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: 13,
                    color: C.textSecondary,
                    marginTop: 3,
                  }}
                >
                  {item.detail}
                </div>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    color: C.textMuted,
                    marginTop: 6,
                  }}
                >
                  {item.timeAgo || ""}
                </div>
              </div>
              {item.action === "completed" && (
                <div style={{ color: C.green }}>
                  <I.Check />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlansTab = ({ plans, userData, setSelectedPlan }) => (
  <div style={{ padding: "0 20px 100px" }}>
    <div className="fade-up" style={{ paddingTop: 20, marginBottom: 24 }}>
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 26,
          fontWeight: 800,
          color: C.text,
        }}
      >
        Training Plans
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: 14,
          color: C.textSecondary,
          marginTop: 4,
        }}
      >
        Train smarter, run together
      </div>
    </div>
    {plans.map((plan, i) => (
      <div
        key={plan.id}
        className="fade-up"
        onClick={() => setSelectedPlan(plan)}
        style={{
          background: C.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 14,
          border: `1px solid ${C.border}`,
          cursor: "pointer",
          animationDelay: `${100 + i * 100}ms`,
          opacity: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
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
                  color: C.text,
                }}
              >
                {plan.title}
              </div>
            </div>
            <div
              style={{
                fontFamily: font,
                fontSize: 13,
                color: C.textSecondary,
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
                  background: C.surface,
                  color: C.textSecondary,
                }}
              >
                {plan.weeks} weeks
              </span>
              <span
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: C.surface,
                  color: C.textSecondary,
                }}
              >
                {plan.memberIds?.length || 0} runners
              </span>
            </div>
          </div>
          {plan.memberIds?.includes(userData?.id) && (
            <div
              style={{
                background: `${C.green}20`,
                color: C.green,
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
      </div>
    ))}
  </div>
);

const PlanDetail = ({
  plan,
  userData,
  friends,
  onBack,
  onJoin,
  onComplete,
}) => {
  const [joined, setJoined] = useState(plan.memberIds?.includes(userData?.id));
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    await onJoin(plan.id);
    setJoined(true);
    setJoining(false);
  };

  const memberList = (plan.memberIds || []).map((mid) => {
    const mp = plan.memberProgress?.[mid] || { progress: 0, currentWeek: 1 };
    if (mid === userData?.id)
      return { id: mid, name: "You", avatar: "🏃", ...mp };
    const f = friends.find((fr) => fr.id === mid);
    return {
      id: mid,
      name: f?.displayName || "Runner",
      avatar: f?.avatar || "🏃",
      ...mp,
    };
  });

  return (
    <div style={{ padding: "0 20px 100px" }}>
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
          style={{ cursor: "pointer", color: C.textSecondary, padding: 4 }}
        >
          <I.Back />
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
          }}
        >
          {plan.icon} {plan.title}
        </div>
      </div>
      <div
        className="fade-up"
        style={{
          background: `linear-gradient(135deg, ${plan.color}10, ${C.card})`,
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
            color: C.textSecondary,
            lineHeight: 1.6,
          }}
        >
          {plan.description}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {[
            { v: plan.weeks, l: "Weeks" },
            {
              v: plan.schedule?.reduce((a, w) => a + w.sessions.length, 0) || 0,
              l: "Sessions",
            },
            { v: plan.memberIds?.length || 0, l: "Runners" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: C.bg,
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
                {s.v}
              </div>
              <div
                style={{ fontFamily: font, fontSize: 11, color: C.textMuted }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!joined ? (
        <div
          className="fade-up"
          style={{ animationDelay: "150ms", opacity: 0, marginBottom: 24 }}
        >
          <Btn onClick={handleJoin} loading={joining}>
            Join This Plan
          </Btn>
        </div>
      ) : (
        <div
          className="fade-up"
          style={{
            background: `${C.green}12`,
            border: `1px solid ${C.green}30`,
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
          <I.Check />
          <span
            style={{
              fontFamily: font,
              fontSize: 14,
              color: C.green,
              fontWeight: 600,
            }}
          >
            You're in this plan
          </span>
        </div>
      )}
      {memberList.length > 0 && (
        <div
          className="fade-up"
          style={{ marginBottom: 24, animationDelay: "200ms", opacity: 0 }}
        >
          <div
            style={{
              fontFamily: fontDisplay,
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              marginBottom: 14,
            }}
          >
            Group Progress
          </div>
          {memberList.map((m, i) => (
            <div
              key={m.id}
              className="fade-up"
              style={{
                background: C.card,
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                border: `1px solid ${C.border}`,
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
                      background: C.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                    }}
                  >
                    {m.avatar}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 11,
                        color: C.textMuted,
                      }}
                    >
                      Week {m.currentWeek || 1}
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
                  {m.progress || 0}%
                </div>
              </div>
              <div
                style={{
                  background: C.bg,
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
                    width: `${m.progress || 0}%`,
                    animation: "progressFill 1s ease forwards",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fade-up" style={{ animationDelay: "350ms", opacity: 0 }}>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            marginBottom: 14,
          }}
        >
          Weekly Schedule
        </div>
        {(plan.schedule || []).map((week, wi) => (
          <div key={wi} style={{ marginBottom: 10 }}>
            <div
              onClick={() => setExpandedWeek(expandedWeek === wi ? -1 : wi)}
              style={{
                background: expandedWeek === wi ? `${plan.color}10` : C.card,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                border: `1px solid ${expandedWeek === wi ? `${plan.color}30` : C.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: font,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.text,
                }}
              >
                Week {week.week}
              </span>
              <span
                style={{
                  color: C.textSecondary,
                  fontSize: 12,
                  transform:
                    expandedWeek === wi ? "rotate(90deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}
              >
                ▶
              </span>
            </div>
            {expandedWeek === wi && (
              <div style={{ marginTop: 6 }}>
                {week.sessions.map((session, si) => {
                  const sKey = `${userData.id}_w${week.week}_s${si}`;
                  const isDone = plan.completedSessions?.[sKey] === true;
                  return (
                    <div
                      key={si}
                      style={{
                        background: C.surface,
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: `3px solid ${isDone ? C.green : C.textMuted}`,
                      }}
                    >
                      <div style={{ flex: 1 }}>
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
                              color: C.textMuted,
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
                              color: isDone ? C.textSecondary : C.text,
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {session.type}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: font,
                            fontSize: 12,
                            color: C.textMuted,
                            marginTop: 2,
                            marginLeft: 36,
                          }}
                        >
                          {session.distance}km
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
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
                        {joined && !isDone && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onComplete(plan.id, sKey, week.week);
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              background: `${C.green}15`,
                              border: `1.5px solid ${C.green}40`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <I.Check />
                          </div>
                        )}
                        {isDone && (
                          <div style={{ color: C.green }}>
                            <I.Check />
                          </div>
                        )}
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

const FriendsTab = ({ friends, userData, plans, onAddFriend }) => {
  const [friendEmail, setFriendEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addResult, setAddResult] = useState("");

  const handleAdd = async () => {
    if (!friendEmail) return;
    setAdding(true);
    setAddResult("");
    const r = await onAddFriend(friendEmail);
    setAddResult(r);
    if (r === "success") setFriendEmail("");
    setAdding(false);
  };

  return (
    <div style={{ padding: "0 20px 100px" }}>
      <div className="fade-up" style={{ paddingTop: 20, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 26,
                fontWeight: 800,
                color: C.text,
              }}
            >
              Running Crew
            </div>
            <div
              style={{
                fontFamily: font,
                fontSize: 14,
                color: C.textSecondary,
                marginTop: 4,
              }}
            >
              {friends.length} friend{friends.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div
            onClick={() => setShowAdd(!showAdd)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <I.Plus />
          </div>
        </div>
      </div>
      {showAdd && (
        <div
          className="fade-up"
          style={{
            background: C.card,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontFamily: font,
              fontSize: 13,
              color: C.textSecondary,
              marginBottom: 10,
            }}
          >
            Add a friend by their email
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@email.com"
              style={{
                flex: 1,
                padding: "12px 14px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                color: C.text,
                fontFamily: font,
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: "none",
                background: C.accent,
                color: "#fff",
                fontFamily: font,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                opacity: adding ? 0.6 : 1,
              }}
            >
              {adding ? "..." : "Add"}
            </button>
          </div>
          {addResult && (
            <div
              style={{
                fontFamily: font,
                fontSize: 12,
                marginTop: 8,
                color: addResult === "success" ? C.green : C.error,
              }}
            >
              {addResult === "success" ? "Friend added!" : addResult}
            </div>
          )}
        </div>
      )}
      {friends.length === 0 && (
        <div
          className="fade-up"
          style={{
            background: C.card,
            borderRadius: 18,
            padding: 28,
            border: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>👟</div>
          <div
            style={{
              fontFamily: fontDisplay,
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              marginBottom: 6,
            }}
          >
            No friends yet
          </div>
          <div
            style={{ fontFamily: font, fontSize: 14, color: C.textSecondary }}
          >
            Tap + to add friends and run together!
          </div>
        </div>
      )}
      {friends.map((f, i) => {
        const fp = plans.filter((p) => p.memberIds?.includes(f.id));
        return (
          <div
            key={f.id}
            className="fade-up"
            style={{
              background: C.card,
              borderRadius: 18,
              padding: 18,
              marginBottom: 12,
              border: `1px solid ${C.border}`,
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
                  background: C.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                {f.avatar || "🏃"}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: 17,
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {f.displayName}
                </div>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: 12,
                    color: C.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {f.streak || 0} day streak {(f.streak || 0) >= 10 ? "🔥" : ""}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: fp.length > 0 ? 12 : 0,
              }}
            >
              {[
                { v: f.weeklyMileage || 0, l: "km/week", c: C.accent },
                { v: f.avgPace || "0:00", l: "avg pace", c: C.blue },
                { v: f.totalRuns || 0, l: "runs", c: C.green },
              ].map((s, j) => (
                <div
                  key={j}
                  style={{
                    flex: 1,
                    background: C.bg,
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
                      color: s.c,
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontFamily: font,
                      fontSize: 10,
                      color: C.textMuted,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            {fp.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {fp.map((p) => (
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
    </div>
  );
};

const ProfileTab = ({ userData, onSignOut }) => {
  const badges = [
    {
      icon: "🏅",
      label: "First Run",
      unlocked: (userData?.totalRuns || 0) >= 1,
    },
    {
      icon: "🔥",
      label: "10-Day Streak",
      unlocked: (userData?.streak || 0) >= 10,
    },
    {
      icon: "💪",
      label: "50 Runs",
      unlocked: (userData?.totalRuns || 0) >= 50,
    },
    {
      icon: "⚡",
      label: "100 Runs",
      unlocked: (userData?.totalRuns || 0) >= 100,
    },
    { icon: "🌙", label: "Night Runner", unlocked: false },
    {
      icon: "🤝",
      label: "Team Player",
      unlocked: (userData?.joinedPlans?.length || 0) >= 1,
    },
  ];
  return (
    <div style={{ padding: "0 20px 100px" }}>
      <div
        className="fade-up"
        style={{ paddingTop: 20, textAlign: "center", marginBottom: 28 }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: `linear-gradient(135deg, ${C.accent}30, ${C.card})`,
            border: `3px solid ${C.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 14px",
          }}
        >
          {userData?.avatar || "🏃"}
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 24,
            fontWeight: 800,
            color: C.text,
          }}
        >
          {userData?.displayName || "Runner"}
        </div>
        <div
          style={{
            fontFamily: font,
            fontSize: 13,
            color: C.textSecondary,
            marginTop: 4,
          }}
        >
          {userData?.email}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Total Runs"
          value={userData?.totalRuns || 0}
          delay={100}
        />
        <StatCard
          label="This Week"
          value={userData?.weeklyMileage || 0}
          unit="km"
          color={C.accent}
          delay={200}
        />
        <StatCard
          label="Avg Pace"
          value={userData?.avgPace || "0:00"}
          unit="/km"
          delay={300}
        />
        <StatCard
          label="Streak"
          value={userData?.streak || 0}
          unit="days"
          color={C.green}
          delay={400}
        />
      </div>
      <div
        className="fade-up"
        style={{ animationDelay: "300ms", opacity: 0, marginBottom: 28 }}
      >
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
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
                background: b.unlocked ? C.card : C.surface,
                borderRadius: 14,
                padding: "14px 8px",
                textAlign: "center",
                border: `1px solid ${b.unlocked ? C.border : "transparent"}`,
                opacity: b.unlocked ? 1 : 0.4,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{b.icon}</div>
              <div
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  color: b.unlocked ? C.textSecondary : C.textMuted,
                }}
              >
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fade-up" style={{ animationDelay: "450ms", opacity: 0 }}>
        <button
          onClick={onSignOut}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.error,
            fontFamily: font,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <I.LogOut /> Sign Out
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
export default function RunTogether() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    (async () => {
      await initFirebase();
      AUTH.onAuthChanged(async (fbUser) => {
        if (fbUser) {
          setUser(fbUser);
          await loadAll(fbUser.uid);
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      });
    })();
  }, []);

  const loadAll = async (uid) => {
    try {
      // Load user
      let ud = await FS.getDoc(`users/${uid}`);
      if (!ud) {
        const profile = {
          displayName: "Runner",
          email: "",
          avatar: "🏃",
          createdAt: new Date().toISOString(),
          weeklyMileage: 0,
          totalRuns: 0,
          avgPace: "0:00",
          streak: 0,
          friends: [],
          joinedPlans: [],
        };
        await FS.setDoc(`users/${uid}`, profile);
        ud = { id: uid, ...profile };
      }
      setUserData({ ...ud, id: uid });

      // Load friends
      if (ud.friends?.length > 0) {
        const fData = [];
        for (const fid of ud.friends) {
          const fd = await FS.getDoc(`users/${fid}`);
          if (fd) fData.push({ ...fd, id: fid });
        }
        setFriends(fData);
      } else {
        setFriends([]);
      }

      // Load plans
      let p = await FS.queryDocs("plans");
      if (p.length === 0) {
        for (const dp of DEFAULT_PLANS) await FS.setDoc(`plans/${dp.id}`, dp);
        p = DEFAULT_PLANS;
      }
      setPlans(p);

      // Load activities
      const { orderBy, limit } = await FS.helpers();
      const acts = await FS.queryDocs(
        "activities",
        orderBy("createdAt", "desc"),
        limit(20),
      );
      setActivities(acts.map((a) => ({ ...a, timeAgo: timeAgo(a.createdAt) })));
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  const timeAgo = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const handleJoinPlan = async (planId) => {
    if (!user) return;
    try {
      const { arrayUnion, serverTimestamp } = await FS.helpers();
      await FS.updateDoc(`plans/${planId}`, {
        memberIds: arrayUnion(user.uid),
        [`memberProgress.${user.uid}`]: { progress: 0, currentWeek: 1 },
      });
      await FS.updateDoc(`users/${user.uid}`, {
        joinedPlans: arrayUnion(planId),
      });
      const plan = plans.find((p) => p.id === planId);
      await FS.addDoc("activities", {
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        avatar: userData?.avatar || "🏃",
        action: "joined",
        detail: plan?.title || "a plan",
        createdAt: serverTimestamp(),
      });
      await loadAll(user.uid);
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  const handleCompleteSession = async (planId, sessionKey, weekNum) => {
    if (!user) return;
    try {
      const { serverTimestamp } = await FS.helpers();
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;
      await FS.updateDoc(`plans/${planId}`, {
        [`completedSessions.${sessionKey}`]: true,
      });
      const total = plan.schedule.reduce((a, w) => a + w.sessions.length, 0);
      const done =
        Object.keys(plan.completedSessions || {}).filter(
          (k) => k.startsWith(user.uid) && plan.completedSessions[k],
        ).length + 1;
      const prog = Math.round((done / total) * 100);
      await FS.updateDoc(`plans/${planId}`, {
        [`memberProgress.${user.uid}.progress`]: prog,
        [`memberProgress.${user.uid}.currentWeek`]: weekNum,
      });
      await FS.updateDoc(`users/${user.uid}`, {
        totalRuns: (userData?.totalRuns || 0) + 1,
      });
      const session = plan.schedule
        .find((w) => w.week === weekNum)
        ?.sessions.find((_, i) => sessionKey.endsWith(`_s${i}`));
      await FS.addDoc("activities", {
        userId: user.uid,
        userName: userData?.displayName || "Runner",
        avatar: "🏃",
        action: "completed",
        detail: `${session?.type || "session"} — ${session?.distance || "?"}km @ ${session?.pace || "?"}`,
        createdAt: serverTimestamp(),
      });
      await loadAll(user.uid);
      const updatedPlan = (await FS.queryDocs("plans")).find(
        (p) => p.id === planId,
      );
      if (updatedPlan) setSelectedPlan(updatedPlan);
    } catch (err) {
      console.error("Complete error:", err);
    }
  };

  const handleAddFriend = async (email) => {
    if (!user) return "Not logged in";
    try {
      const { where, arrayUnion } = await FS.helpers();
      const results = await FS.queryDocs("users", where("email", "==", email));
      if (results.length === 0) return "No user found with that email";
      if (results[0].id === user.uid) return "That's your own email!";
      if (userData?.friends?.includes(results[0].id)) return "Already friends";
      await FS.updateDoc(`users/${user.uid}`, {
        friends: arrayUnion(results[0].id),
      });
      await FS.updateDoc(`users/${results[0].id}`, {
        friends: arrayUnion(user.uid),
      });
      await loadAll(user.uid);
      return "success";
    } catch (err) {
      console.error("Friend error:", err);
      return "Something went wrong";
    }
  };

  const handleSignOut = async () => {
    await AUTH.signOut();
    setUser(null);
    setUserData(null);
    setPlans([]);
    setFriends([]);
    setActivities([]);
  };
  const handleAuth = async (fbUser) => {
    setUser(fbUser);
    setLoading(true);
    await loadAll(fbUser.uid);
    setLoading(false);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const tabs = [
    { id: "home", label: "Home", Icon: I.Home },
    { id: "plans", label: "Plans", Icon: I.Plan },
    { id: "friends", label: "Crew", Icon: I.Friends },
    { id: "profile", label: "Profile", Icon: I.Profile },
  ];

  return (
    <div
      style={{
        fontFamily: font,
        background: C.bg,
        color: C.text,
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
            color: C.text,
          }}
        >
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 14,
            fontWeight: 700,
            color: C.accent,
            letterSpacing: 0.5,
          }}
        >
          RunTogether
        </div>
        <div
          style={{
            width: 16,
            height: 10,
            border: `1.5px solid ${C.text}`,
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
              background: C.text,
              borderRadius: 0.5,
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {selectedPlan ? (
          <PlanDetail
            plan={selectedPlan}
            userData={userData}
            friends={friends}
            onBack={() => setSelectedPlan(null)}
            onJoin={handleJoinPlan}
            onComplete={handleCompleteSession}
          />
        ) : activeTab === "home" ? (
          <HomeTab
            userData={userData}
            plans={plans}
            activities={activities}
            setSelectedPlan={setSelectedPlan}
          />
        ) : activeTab === "plans" ? (
          <PlansTab
            plans={plans}
            userData={userData}
            setSelectedPlan={setSelectedPlan}
          />
        ) : activeTab === "friends" ? (
          <FriendsTab
            friends={friends}
            userData={userData}
            plans={plans}
            onAddFriend={handleAddFriend}
          />
        ) : (
          <ProfileTab userData={userData} onSignOut={handleSignOut} />
        )}
      </div>
      <div
        style={{
          height: 82,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-around",
          paddingTop: 10,
          background: `linear-gradient(to top, ${C.bg} 60%, transparent)`,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id && !selectedPlan;
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
                color: active ? C.accent : C.textMuted,
                transition: "color 0.2s",
                padding: "4px 16px",
              }}
            >
              <tab.Icon />
              <span
                style={{
                  fontFamily: font,
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
              {active && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: C.accent,
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
