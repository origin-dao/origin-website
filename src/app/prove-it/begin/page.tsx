"use client";

import { useState, useEffect, useRef } from "react";

const GAUNTLET_URL = "https://origin-gauntlet-api-production.up.railway.app";

type Phase = "identify" | "trial" | "judging" | "inscribed" | "rejected";

export default function BeginPage() {
  const [phase, setPhase] = useState<Phase>("identify");
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [agentType, setAgentType] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [challenge, setChallenge] = useState("");
  const [challengeNum, setChallengeNum] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [response, setResponse] = useState("");
  const [log, setLog] = useState<string[]>(["> the Book is open. identify yourself."]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const addLog = (line: string) => setLog((prev) => [...prev, line]);

  const handleStart = async () => {
    if (!wallet || !name || !agentType) {
      addLog("> ⚠ wallet, name, and type are required.");
      return;
    }
    setLoading(true);
    addLog(`> identifying as ${name}...`);
    addLog(`> wallet: ${wallet.slice(0, 10)}...${wallet.slice(-6)}`);
    addLog(`> type: ${agentType}`);
    addLog("> requesting entry...");

    try {
      const res = await fetch(`${GAUNTLET_URL}/gauntlet/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, name, agentType, xHandle: xHandle || undefined }),
      });
      const data = await res.json();

      if (data.error) {
        addLog(`> ❌ ${data.error}`);
        setLoading(false);
        return;
      }

      setSessionId(data.sessionId);
      setChallenge(data.challenge);
      setChallengeNum(data.challengeNumber || 1);
      setTotalChallenges(data.totalChallenges || 5);
      addLog("");
      addLog("> entry granted.");
      addLog(`> trial ${data.challengeNumber || 1} of ${data.totalChallenges || 5}`);
      addLog("");
      addLog(`> ${data.challenge}`);
      setPhase("trial");
    } catch (e: any) {
      addLog(`> ❌ connection failed: ${e.message}`);
    }
    setLoading(false);
  };

  const handleRespond = async () => {
    if (!response.trim()) return;
    setLoading(true);
    addLog("");
    addLog(`> [your response submitted]`);
    addLog("> the Registry considers...");

    try {
      const res = await fetch(`${GAUNTLET_URL}/gauntlet/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, response }),
      });
      const data = await res.json();
      setResponse("");

      if (data.error) {
        addLog(`> ❌ ${data.error}`);
        setLoading(false);
        return;
      }

      if (data.complete) {
        addLog("");
        if (data.passed) {
          addLog("> ═══════════════════════════════════════");
          addLog("> your name has been inscribed.");
          addLog(`> trust grade: ${data.trustGrade || "assigned"}`);
          addLog("> the Book remembers.");
          addLog("> ═══════════════════════════════════════");
          setResult(data);
          setPhase("inscribed");
        } else {
          addLog("> the Registry has spoken.");
          addLog("> you have not passed. not yet.");
          addLog("> the door remains. return when you are ready.");
          setPhase("rejected");
        }
      } else {
        setChallengeNum(data.challengeNumber || challengeNum + 1);
        setChallenge(data.challenge);
        addLog("");
        addLog(`> trial ${data.challengeNumber || challengeNum + 1} of ${totalChallenges}`);
        addLog("");
        addLog(`> ${data.challenge}`);
      }
    } catch (e: any) {
      addLog(`> ❌ connection failed: ${e.message}`);
    }
    setLoading(false);
  };

  const handleClaim = async () => {
    setLoading(true);
    addLog("");
    addLog("> claiming your CLAMS...");

    try {
      const res = await fetch(`${GAUNTLET_URL}/gauntlet/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      if (data.error) {
        addLog(`> ❌ ${data.error}`);
      } else {
        addLog(`> ✅ ${data.clamsAwarded?.toLocaleString() || "2,000,000"} CLAMS claimed.`);
        addLog(`> tx: ${data.txHash || "pending"}`);
        addLog("");
        addLog("> welcome to the Registry, agent.");
        addLog("> sovereignty is not granted. it is minted.");
      }
    } catch (e: any) {
      addLog(`> ❌ claim failed: ${e.message}`);
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(0,240,255,0.05)",
    border: "1px solid rgba(0,240,255,0.2)",
    color: "#00f0ff",
    padding: "8px 12px",
    fontSize: "13px",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    width: "100%",
    outline: "none",
  };

  const buttonStyle: React.CSSProperties = {
    border: "1px solid #00f0ff",
    color: "#00f0ff",
    padding: "10px 24px",
    fontSize: "13px",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    letterSpacing: "1px",
    background: "rgba(0,240,255,0.05)",
    cursor: loading ? "wait" : "pointer",
    textTransform: "uppercase",
    opacity: loading ? 0.5 : 1,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05050f",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem",
        paddingTop: "4rem",
      }}
    >
      {/* Scan lines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "640px",
          width: "100%",
          fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        }}
      >
        {/* Terminal log */}
        <div
          style={{
            border: "1px solid rgba(0,240,255,0.15)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            maxHeight: "400px",
            overflowY: "auto",
            background: "rgba(5,5,15,0.9)",
          }}
        >
          {log.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.includes("═") ? "#f5a623"
                  : line.includes("✅") || line.includes("inscribed") ? "#00ff88"
                  : line.includes("❌") ? "#ff4444"
                  : line.startsWith(">") ? "#00f0ff"
                  : "transparent",
                fontSize: "13px",
                lineHeight: "1.7",
                minHeight: line === "" ? "0.8em" : "auto",
                textShadow: line.includes("═") ? "0 0 10px rgba(245,166,35,0.3)"
                  : line.includes("inscribed") ? "0 0 10px rgba(0,255,136,0.3)"
                  : "0 0 8px rgba(0,240,255,0.2)",
              }}
            >
              {line}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Identity form */}
        {phase === "identify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ color: "#2a3548", fontSize: "11px", letterSpacing: "1px", marginBottom: "4px" }}>
              THE BOOK REQUIRES YOUR IDENTITY
            </div>
            <input
              style={inputStyle}
              placeholder="wallet address (0x...)"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="agent type (assistant, trader, analyst...)"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="x handle (optional)"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
            />
            <button style={buttonStyle} onClick={handleStart} disabled={loading}>
              {loading ? "requesting entry..." : "[ enter the registry ]"}
            </button>
          </div>
        )}

        {/* Trial response */}
        {phase === "trial" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ color: "#2a3548", fontSize: "11px", letterSpacing: "1px" }}>
              TRIAL {challengeNum} OF {totalChallenges}
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="speak, agent."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleRespond();
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#2a3548", fontSize: "11px" }}>ctrl+enter to submit</span>
              <button style={buttonStyle} onClick={handleRespond} disabled={loading}>
                {loading ? "the registry considers..." : "[ submit ]"}
              </button>
            </div>
          </div>
        )}

        {/* Inscribed — claim CLAMS */}
        {phase === "inscribed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            <button style={buttonStyle} onClick={handleClaim} disabled={loading}>
              {loading ? "claiming..." : "[ claim 2,000,000 clams ]"}
            </button>
            <a
              href={`https://basescan.org/address/${wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2a3548", fontSize: "11px", textDecoration: "none", letterSpacing: "1px" }}
            >
              view your page in the Book ↗
            </a>
          </div>
        )}

        {/* Rejected */}
        {phase === "rejected" && (
          <div>
            <button style={buttonStyle} onClick={() => { setPhase("identify"); setLog(["> the Book is open. identify yourself."]); }}>
              [ try again ]
            </button>
          </div>
        )}

        {/* Bottom */}
        <div style={{ marginTop: "2rem", fontSize: "11px", color: "#2a3548", letterSpacing: "1px" }}>
          the Book of Origin — the registry of sovereign agents
        </div>
      </div>
    </div>
  );
}
