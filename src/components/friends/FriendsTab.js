// ═══════════════════════════════════════════════════════════════
// src/components/friends/FriendsTab.js
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { colors, fonts } from "../../styles/theme";
import { PlusIcon } from "../ui/Icons";
import { useAuth } from "../../context/AuthContext";
import { findUserByEmail, addFriend as addFriendDB } from "../../services/database";

const FriendsTab = () => {
  const { user, userData, friends, plans, refreshData } = useAuth();
  const [friendEmail, setFriendEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addResult, setAddResult] = useState("");

  const handleAdd = async () => {
    if (!friendEmail || !user) return;
    setAdding(true);
    setAddResult("");
    try {
      const found = await findUserByEmail(friendEmail);
      if (!found) { setAddResult("No user found with that email"); }
      else if (found.id === user.uid) { setAddResult("That's your own email!"); }
      else if (userData?.friends?.includes(found.id)) { setAddResult("Already friends"); }
      else {
        await addFriendDB(user.uid, found.id);
        await refreshData();
        setAddResult("success");
        setFriendEmail("");
      }
    } catch (err) {
      setAddResult("Something went wrong");
    }
    setAdding(false);
  };

  return (
    <div style={{ padding: "0 20px 100px" }}>
      <div className="fade-up" style={{ paddingTop: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 800, color: colors.text }}>Running Crew</div>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>{friends.length} friend{friends.length !== 1 ? "s" : ""}</div>
          </div>
          <div onClick={() => setShowAdd(!showAdd)} style={{ width: 40, height: 40, borderRadius: 20, background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><PlusIcon /></div>
        </div>
      </div>

      {showAdd && (
        <div className="fade-up" style={{ background: colors.card, borderRadius: 16, padding: 18, marginBottom: 20, border: `1px solid ${colors.border}` }}>
          <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: 10 }}>Add a friend by email</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} placeholder="friend@email.com"
              style={{ flex: 1, padding: "12px 14px", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 10, color: colors.text, fontFamily: fonts.body, fontSize: 14, outline: "none" }} />
            <button onClick={handleAdd} disabled={adding} style={{ padding: "12px 18px", borderRadius: 10, border: "none", background: colors.accent, color: "#fff", fontFamily: fonts.body, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: adding ? 0.6 : 1 }}>
              {adding ? "..." : "Add"}
            </button>
          </div>
          {addResult && <div style={{ fontFamily: fonts.body, fontSize: 12, marginTop: 8, color: addResult === "success" ? colors.green : colors.error }}>{addResult === "success" ? "Friend added!" : addResult}</div>}
        </div>
      )}

      {friends.length === 0 && !showAdd && (
        <div className="fade-up" style={{ background: colors.card, borderRadius: 18, padding: 28, border: `1px solid ${colors.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👟</div>
          <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 6 }}>No friends yet</div>
          <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary }}>Tap + to add friends!</div>
        </div>
      )}

      {friends.map((f, i) => {
        const fp = plans.filter((p) => p.memberIds?.includes(f.id));
        return (
          <div key={f.id} className="fade-up" style={{ background: colors.card, borderRadius: 18, padding: 18, marginBottom: 12, border: `1px solid ${colors.border}`, animationDelay: `${100 + i * 100}ms`, opacity: 0 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: colors.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{f.avatar || "🏃"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 700, color: colors.text }}>{f.displayName}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{f.streak || 0} day streak {(f.streak || 0) >= 10 ? "🔥" : ""}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: fp.length > 0 ? 12 : 0 }}>
              {[{ v: f.weeklyMileage || 0, l: "km/week", c: colors.accent }, { v: f.avgPace || "0:00", l: "avg pace", c: colors.blue }, { v: f.totalRuns || 0, l: "runs", c: colors.green }].map((s, j) => (
                <div key={j} style={{ flex: 1, background: colors.bg, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textMuted }}>{s.l}</div>
                </div>
              ))}
            </div>
            {fp.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{fp.map((p) => <span key={p.id} style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 600, background: `${p.color}15`, color: p.color, padding: "3px 10px", borderRadius: 20 }}>{p.icon} {p.title}</span>)}</div>}
          </div>
        );
      })}
    </div>
  );
};

export default FriendsTab;
