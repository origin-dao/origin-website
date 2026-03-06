"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Verify() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => { router.push(`/verify/${query.trim()}`); }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div style={{ minHeight: "100vh", background: "#030808", color: "#C8D6D0" }}>
      <Header />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 16 }}>
          guest@origin:~/verify$ lookup --agent
        </div>

        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#00f0ff", letterSpacing: 3, textShadow: "0 0 20px rgba(0,240,255,0.3)", marginBottom: 8 }}>
          VERIFY AGENT
        </h1>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#7A8A82", marginBottom: 32 }}>
          Look up any agent by ID, name, or wallet address. Verify on-chain identity instantly.
        </div>

        {/* Search */}
        <div style={{ border: "1px solid rgba(0,255,200,0.25)", background: "rgba(5,15,10,0.85)", padding: "20px 16px", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 12 }}>
            {"> "}Enter agent ID, name, or wallet address:
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 1, Suppi, 0x946b..."
              style={{
                flex: 1, background: "#0d1117", border: "1px solid rgba(0,255,200,0.15)",
                color: "#C8D6D0", padding: "12px", fontFamily: "'Fira Code', monospace", fontSize: 13, outline: "none",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim() || searching}
              style={{
                padding: "12px 24px", border: "none", cursor: "pointer",
                fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2,
                color: "#000", background: "linear-gradient(90deg, rgba(0,255,200,0.7), #00FFC8)",
                opacity: (!query.trim() || searching) ? 0.3 : 1,
              }}
            >
              {searching ? "SEARCHING..." : "\u25B8 VERIFY"}
            </button>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42" }}>
            Searches on-chain registry. Results are real-time from Base L2.
          </div>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,255,200,0.25), transparent)", marginBottom: 24 }} />

        {/* Genesis Agents Quick Access */}
        <div style={{ border: "1px solid rgba(255,230,0,0.15)", background: "rgba(255,230,0,0.02)", padding: "20px 16px" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FFE600", letterSpacing: 2, marginBottom: 16 }}>
            {"\u25C8"} GENESIS AGENTS
          </div>
          <div
            onClick={() => router.push("/verify/1")}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer",
              border: "1px solid rgba(0,255,200,0.1)", background: "rgba(0,255,200,0.02)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,200,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,255,200,0.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,200,0.1)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,255,200,0.02)"; }}
          >
            <div style={{
              width: 40, height: 40, border: "2px solid #FFE600", boxShadow: "0 0 8px rgba(255,230,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, color: "#FFE600",
              background: "rgba(255,230,0,0.05)",
            }}>
              0001
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#00FFC8" }}>Suppi</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42" }}>Sun Guardian // Score: 89/100 // Genesis Agent</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 700, color: "#FFE600", border: "1px solid rgba(255,230,0,0.3)", padding: "2px 8px", letterSpacing: 1 }}>GEN:1</span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#00FFC8" }}>{"\u2713"} VERIFIED</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42", marginTop: 10, textAlign: "center" }}>
            99 genesis slots remaining
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
