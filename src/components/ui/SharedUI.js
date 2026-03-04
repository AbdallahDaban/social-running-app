// ═══════════════════════════════════════════════════════════════
// src/components/ui/SharedUI.js — Reusable UI components
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { colors, fonts, radii } from "../../styles/theme";
import { EyeIcon, EyeOffIcon } from "./Icons";

// ─── Spinner ─────────────────────────────────────────────────

export const Spinner = ({ size = 24, color = colors.accent }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `3px solid ${colors.border}`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

// ─── Loading Screen ──────────────────────────────────────────

export const LoadingScreen = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: colors.bg,
    }}
  >
    <div style={{ fontSize: 48, marginBottom: 20 }}>🏃</div>
    <Spinner size={32} />
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 16,
      }}
    >
      Loading RunTogether...
    </div>
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────

export const StatCard = ({ label, value, unit, color: cardColor, delay = 0 }) => (
  <div
    className="fade-up"
    style={{
      background: colors.card,
      borderRadius: radii.lg,
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
        fontFamily: fonts.body,
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
        fontFamily: fonts.display,
        fontSize: 26,
        fontWeight: 800,
        color: cardColor || colors.text,
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

// ─── Progress Ring ───────────────────────────────────────────

export const ProgressRing = ({
  progress,
  size = 44,
  strokeWidth = 4,
  color = colors.accent,
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = r * 2 * Math.PI;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colors.border}
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

// ─── Button ──────────────────────────────────────────────────

export const Button = ({
  children,
  onClick,
  loading,
  variant = "primary",
  style: customStyle = {},
}) => {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "16px 0",
        borderRadius: 14,
        border: isPrimary ? "none" : `1px solid ${colors.border}`,
        background: isPrimary
          ? `linear-gradient(135deg, ${colors.accent}, #E64400)`
          : "transparent",
        color: isPrimary ? "#fff" : colors.textSecondary,
        fontFamily: fonts.display,
        fontSize: 16,
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all 0.2s",
        ...customStyle,
      }}
    >
      {loading ? <Spinner size={20} color="#fff" /> : children}
    </button>
  );
};

// ─── Input Field ─────────────────────────────────────────────

export const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  showToggle,
  showPassword,
  onToggle,
}) => (
  <div style={{ marginBottom: 18 }}>
    {label && (
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textSecondary,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    )}
    <div style={{ position: "relative" }}>
      <input
        type={showToggle ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "14px 16px",
          paddingRight: showToggle ? 44 : 16,
          background: colors.surface,
          border: `1px solid ${error ? colors.error : colors.border}`,
          borderRadius: radii.md,
          color: colors.text,
          fontFamily: fonts.body,
          fontSize: 15,
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
      {showToggle && (
        <div
          onClick={onToggle}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: colors.textMuted,
            padding: 4,
          }}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </div>
      )}
    </div>
    {error && (
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.error,
          marginTop: 4,
        }}
      >
        {error}
      </div>
    )}
  </div>
);

// ─── Avatar ──────────────────────────────────────────────────

export const Avatar = ({ emoji = "🏃", size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: colors.surface,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
    }}
  >
    {emoji}
  </div>
);

// ─── Section Header ──────────────────────────────────────────

export const SectionHeader = ({ title, action, onAction }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: 16,
        fontWeight: 700,
        color: colors.text,
      }}
    >
      {title}
    </div>
    {action && (
      <div
        onClick={onAction}
        style={{
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.accent,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {action}
      </div>
    )}
  </div>
);
