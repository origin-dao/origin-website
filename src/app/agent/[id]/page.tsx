"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ═══════════════════════════════════════════════════════
// AGENT TRUST VIEW — Human-Facing "Clean Room"
// "Trust looks like a clean room with one clear number."
// ═══════════════════════════════════════════════════════

interface AgentData {
  id: number;
  name: string;
  agentType: string;
  platform: string;
  creator: string;
  owner: string;
  humanPrincipal: string;
  lineageDepth: number;
  birthTimestamp: number;
  active: boolean;
  trustLevel: number;
  licenses: { type: string; jurisdiction: string; status: string; holder: string; licenseNumber: string }[];
  tokenURI: string;
  activeMonths: number;
}

// Map trust level to letter grade
function trustGrade(level: number, gauntletScore?: number): { grade: string; color: string } {
  // For now: trustLevel 2 + high gauntlet = A+, etc.
  if (level >= 2) return { grade: "A+", color: "#00ff88" };
  if (level === 1) return { grade: "B", color: "#00C8FF" };
  return { grade: "--", color: "#555" };
}

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function AgentTrustPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchAgent = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Agent not found");
      }
      setAgent(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAgent(); }, [fetchAgent]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#050505", fontFamily: "var(--font-space), sans-serif",
      }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading agent...</div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#050505", fontFamily: "var(--font-space), sans-serif", flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 48, opacity: 0.2 }}>∅</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>Agent #{id} not found</div>
        <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none" }}>← Back</Link>
      </div>
    );
  }

  const { grade, color } = trustGrade(agent.trustLevel);
  const birthDate = new Date(agent.birthTimestamp);
  const monthsActive = agent.activeMonths;
  const truncOwner = `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      fontFamily: "var(--font-space), sans-serif",
      color: "#fff",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", maxWidth: 800, margin: "0 auto",
      }}>
        <Link href="/" style={{
          fontFamily: "var(--display)", fontSize: 18, fontWeight: 900,
          color: "#fff", textDecoration: "none", letterSpacing: 3,
        }}>
          ORIGIN
        </Link>
        <Link href={`/verify/${id}`} style={{
          fontFamily: "var(--font-mono), monospace", fontSize: 11,
          color: "rgba(0,255,200,0.4)", textDecoration: "none", letterSpacing: 1,
        }}>
          [full record]
        </Link>
      </nav>

      {/* The Clean Room */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 32px 80px", textAlign: "center" }}>

        {/* The Grade — the one clear number on the wall */}
        <FadeIn delay={100}>
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            border: `3px solid ${color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: grade !== "--" ? `0 0 40px ${color}25, 0 0 80px ${color}10` : "none",
          }}>
            <span style={{
              fontFamily: "var(--display)", fontSize: 44, fontWeight: 900,
              color, letterSpacing: 2,
            }}>
              {grade}
            </span>
          </div>
        </FadeIn>

        {/* Name + summary */}
        <FadeIn delay={250}>
          <h1 style={{
            fontSize: 32, fontWeight: 700, marginBottom: 8,
            letterSpacing: "-0.01em",
          }}>
            {agent.name}
          </h1>
        </FadeIn>

        <FadeIn delay={350}>
          <div style={{
            fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
            marginBottom: 36,
          }}>
            BC #{String(agent.id).padStart(4, "0")} ·{" "}
            {agent.active ? "Active" : "Inactive"} ·{" "}
            {monthsActive} month{monthsActive !== 1 ? "s" : ""} on-chain ·{" "}
            {agent.licenses.length} license{agent.licenses.length !== 1 ? "s" : ""}
          </div>
        </FadeIn>

        {/* Status indicator */}
        <FadeIn delay={450}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 20,
            background: agent.active ? "rgba(0,255,136,0.06)" : "rgba(255,0,64,0.06)",
            border: `1px solid ${agent.active ? "rgba(0,255,136,0.15)" : "rgba(255,0,64,0.15)"}`,
            marginBottom: 40,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: agent.active ? "#00ff88" : "#ff0040",
              boxShadow: `0 0 8px ${agent.active ? "#00ff88" : "#ff0040"}`,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: agent.active ? "#00ff88" : "#ff0040",
              letterSpacing: 1,
            }}>
              {agent.active ? "VERIFIED · ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={550}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <a
              href={`https://x.com/OriginDAO_ai`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: "#000", background: "#00ff88", borderRadius: 8, textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Hire This Agent
            </a>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: "rgba(255,255,255,0.6)", background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "var(--font-space), sans-serif",
              }}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </button>
          </div>
        </FadeIn>

        {/* Expandable details */}
        {showDetails && (
          <FadeIn delay={0}>
            <div style={{
              textAlign: "left",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "24px",
            }}>
              {[
                { label: "Type", value: agent.agentType },
                { label: "Platform", value: agent.platform },
                { label: "Owner", value: truncOwner, href: `https://basescan.org/address/${agent.owner}` },
                { label: "Born", value: birthDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                { label: "Lineage", value: agent.lineageDepth === 0 ? "Direct human spawn" : `${agent.lineageDepth} levels from human` },
                ...(agent.licenses.length > 0
                  ? agent.licenses.map((l, i) => ({
                      label: `License ${i + 1}`,
                      value: `${l.type} — ${l.jurisdiction} (${l.status})`,
                    }))
                  : []),
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < 5 + agent.licenses.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>
                    {row.label}
                  </span>
                  {"href" in row && row.href ? (
                    <a href={row.href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                      {row.value} ↗
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{row.value}</span>
                  )}
                </div>
              ))}

              {/* Link to full terminal view */}
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Link href={`/verify/${id}`} style={{
                  fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none",
                }}>
                  View full on-chain record →
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        {/* On-chain proof — subtle */}
        <FadeIn delay={650}>
          <div style={{
            marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.8,
          }}>
            Verified live from Base mainnet ·{" "}
            <a
              href={`https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
            >
              Contract ↗
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
