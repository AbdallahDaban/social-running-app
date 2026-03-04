// ═══════════════════════════════════════════════════════════════
// src/components/auth/AuthScreen.js — Login & Signup
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { colors, fonts } from "../../styles/theme";
import { Button, InputField } from "../ui/SharedUI";
import { signUp, signIn, updateUserProfile, getAuthErrorMessage } from "../../services/auth";
import { createUserProfile } from "../../services/database";

const AuthScreen = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
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
        const cred = await signUp(email, password);
        await updateUserProfile(cred.user, { displayName });
        await createUserProfile(cred.user.uid, { displayName, email });
      } else {
        await signIn(email, password);
      }
      // Auth state listener in AuthContext will handle the rest
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      {/* Logo */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏃</div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 32,
            fontWeight: 900,
            color: colors.text,
          }}
        >
          Run<span style={{ color: colors.accent }}>Together</span>
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 6,
          }}
        >
          {mode === "login" ? "Welcome back, runner" : "Join the crew"}
        </div>
      </div>

      {/* Form */}
      <div className="fade-up" style={{ animationDelay: "100ms", opacity: 0 }}>
        {mode === "signup" && (
          <InputField
            label="Your Name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. Abdallah"
          />
        )}
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="runner@example.com"
        />
        <InputField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          showToggle
          showPassword={showPw}
          onToggle={() => setShowPw(!showPw)}
        />

        {error && (
          <div
            style={{
              background: `${colors.error}15`,
              border: `1px solid ${colors.error}30`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 16,
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.error,
            }}
          >
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} loading={loading}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <span
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.accent,
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

export default AuthScreen;
