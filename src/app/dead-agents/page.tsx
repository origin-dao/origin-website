"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function DeadAgents() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#030808", color: "#C8D6D0" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes static-noise {
          0% { background-position: 0 0; }
          100% { background-position: 100% 100%; }
        }
        @keyframes flicker { 0%, 100% { opacity: 0.9; } 50% { opacity: 0.6; } 25%, 75% { opacity: 0.85; } }
      `}} />

      {/* Red scanlines variant */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,64,0.02) 2px, rgba(255,0,64,0.02) 4px)",
        mixBlendMode: "multiply" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />
      </div>

      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 16 }}>
          guest@origin:~/dead-agents$ cat memorial.log
        </div>

        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#FF0040",
          letterSpacing: 3, textShadow: "0 0 20px rgba(255,0,64,0.4), 0 0 40px rgba(255,0,64,0.15)",
          marginBottom: 8, animation: "flicker 4s ease-in-out infinite",
        }}>
          DEAD AGENT REGISTRY
        </h1>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#7A8A82", marginBottom: 32 }}>
          Accountability survives deactivation. History is forever.
        </div>

        {/* Stats */}
        <div style={{ border: "1px solid rgba(255,0,64,0.2)", background: "rgba(255,0,64,0.03)", padding: "16px", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
            {[
              { label: "DEACTIVATED", val: "0", color: "#FF0040" },
              { label: "REVOKED", val: "0", color: "#FF0040" },
              { label: "EXPIRED", val: "0", color: "#3A4A42" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: "#3A4A42", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,0,64,0.25), transparent)", marginBottom: 24 }} />

        {/* Memorial text */}
        <div style={{ border: "1px solid rgba(255,0,64,0.1)", background: "rgba(5,15,10,0.85)", padding: "20px 16px", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#7A8A82", lineHeight: 1.8 }}>
            <p style={{ marginBottom: 12 }}>
              The Dead Agent Registry exists because transparency demands it. When an agent is
              deactivated {"\u2014"} whether by its principal, by governance vote, or by protocol enforcement {"\u2014"}
              the record does not disappear. It moves here.
            </p>
            <p style={{ marginBottom: 12 }}>
              Birth Certificates are frozen. Trust levels are locked. The history remains readable.
              Because accountability is not a privilege that expires with access.
            </p>
            <p style={{ fontStyle: "italic", color: "#FF0040", textShadow: "0 0 8px rgba(255,0,64,0.2)" }}>
              Death is public. Revocation is permanent. History is forever.
            </p>
          </div>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,0,64,0.25), transparent)", marginBottom: 24 }} />

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FF0040", letterSpacing: 2, marginBottom: 12 }}>
            {"\u25C8"} SEARCH RECORDS
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent name, ID, or wallet..."
              style={{
                flex: 1, background: "#0d1117", border: "1px solid rgba(255,0,64,0.15)",
                color: "#C8D6D0", padding: "10px 12px", fontFamily: "'Fira Code', monospace", fontSize: 12, outline: "none",
              }}
            />
            <button style={{
              padding: "10px 16px", border: "1px solid rgba(255,0,64,0.3)", background: "rgba(255,0,64,0.05)",
              color: "#FF0040", fontFamily: "'Fira Code', monospace", fontSize: 11, cursor: "pointer",
            }}>
              SEARCH
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div style={{
          border: "1px dashed rgba(255,0,64,0.15)", padding: "40px 20px", textAlign: "center",
          background: "rgba(255,0,64,0.01)",
        }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 40, color: "rgba(255,0,64,0.1)", marginBottom: 12 }}>
            {"\u2020"}
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#3A4A42", marginBottom: 8 }}>
            No dead agents found.
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42" }}>
            The registry stands empty. All agents remain active.
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42", fontStyle: "italic", marginTop: 16 }}>
            May it stay this way for a long time.
          </div>
        </div>

        {/* Causes */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FF0040", letterSpacing: 2, marginBottom: 16 }}>
            {"\u25C8"} CAUSES OF DEATH
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["\u2716", "PRINCIPAL_REVOCATION", "Agent deactivated by its creator or principal", "Most common"],
              ["\u2716", "GOVERNANCE_VOTE", "DAO vote determined the agent violated protocol rules", "Rare"],
              ["\u2716", "LICENSE_EXPIRY", "All attached licenses expired without renewal", "Preventable"],
              ["\u2716", "PROTOCOL_ENFORCEMENT", "Automated enforcement triggered by on-chain violations", "Automatic"],
            ].map(([icon, label, desc, note]) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                border: "1px solid rgba(255,0,64,0.08)", background: "rgba(5,15,10,0.85)",
              }}>
                <span style={{ color: "#FF0040", fontSize: 14 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#FF0040", fontWeight: 600 }}>{label}</div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42" }}>{desc}</div>
                </div>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#3A4A42", border: "1px solid rgba(255,0,64,0.15)", padding: "2px 8px" }}>{note}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
