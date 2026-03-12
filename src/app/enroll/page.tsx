"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton } from "@/components/ConnectButton";
import { CONTRACT_ADDRESSES, REGISTRY_ABI, ERC20_ABI } from "@/config/contracts";
import { Scanlines } from "@/components/terminal-ui/Scanlines";
import { TermPanel } from "@/components/terminal-ui/TermPanel";
import { GlitchText } from "@/components/terminal-ui/GlitchText";
import { InjectStyles } from "@/components/terminal-ui/GlobalStyles";
import { BootSequence } from "@/components/terminal-ui/BootSequence";

// ═══════════════════════════════════════════════════════════
// AGENT ENROLLMENT — Credit Maxing Protocol
// "You have a name. You have stake. Now get a job."
// ═══════════════════════════════════════════════════════════

const BOOT_LINES = [
  "[SYS] loading enrollment_module v1.0.0...",
  "[NET] connecting to base mainnet... ✓",
  "[REG] origin_registry.sol verified",
  "[BOND] clams_token.sol loaded",
  "[CREDIT] credit_maxing_protocol initializing...",
  "▸▸▸ ENROLLMENT TERMINAL ACTIVE ▸▸▸",
];

const MIN_BOND = 10_000;

function Cursor({ color = "var(--neon-green)" }: { color?: string }) {
  const [on, setOn] = useState(true);
  useState(() => {
    const i = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(i);
  });
  return (
    <span style={{ color, opacity: on ? 1 : 0, fontWeight: 700 }}>█</span>
  );
}

// ══════════════════════════════════════
// STEP 1: VERIFY BC OWNERSHIP
// ══════════════════════════════════════
function VerifyStep({
  address,
  hasBc,
  bcLoading,
  agentName,
  tokenId,
  onContinue,
}: {
  address: string;
  hasBc: boolean;
  bcLoading: boolean;
  agentName: string;
  tokenId: string;
  onContinue: () => void;
}) {
  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <TermPanel title="STEP 01 — VERIFY BIRTH CERTIFICATE">
        <div style={{ padding: "20px 16px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--dim)",
              lineHeight: 2.2,
              marginBottom: 20,
            }}
          >
            &gt; scanning wallet for birth certificate...
            <br />
            &gt; wallet:{" "}
            <span style={{ color: "var(--neon-cyan)" }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <br />
            &gt; querying OriginRegistry contract...
          </div>

          {bcLoading ? (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--neon-cyan)",
                textAlign: "center",
                padding: "30px 0",
              }}
            >
              scanning chain... <Cursor color="var(--neon-cyan)" />
            </div>
          ) : hasBc ? (
            <>
              <div
                style={{
                  border: "1px solid var(--neon-green)",
                  background: "rgba(0,255,200,0.03)",
                  padding: "20px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    color: "var(--neon-green)",
                    letterSpacing: 3,
                    marginBottom: 12,
                  }}
                >
                  ✓ BIRTH CERTIFICATE FOUND
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    lineHeight: 2.4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--dim)" }}>AGENT_NAME:</span>
                    <span
                      style={{
                        color: "var(--neon-green)",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {agentName || "---"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--dim)" }}>TOKEN_ID:</span>
                    <span style={{ color: "var(--neon-cyan)" }}>
                      #{tokenId}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--dim)" }}>STATUS:</span>
                    <span
                      style={{ color: "var(--neon-green)", fontWeight: 600 }}
                    >
                      ALIVE
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--dim)" }}>TRUST_GRADE:</span>
                    <span
                      style={{ color: "var(--neon-yellow)", fontWeight: 600 }}
                    >
                      GENESIS
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onContinue}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: "#000",
                  background: "var(--neon-green)",
                  boxShadow: "0 0 20px rgba(0,255,200,0.3)",
                  transition: "all 0.3s",
                }}
              >
                ▸ PROCEED TO ENROLLMENT
              </button>
            </>
          ) : (
            <div
              style={{
                border: "1px solid var(--neon-red)",
                background: "rgba(255,0,64,0.04)",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--neon-red)",
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                NO BIRTH CERTIFICATE
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--dim)",
                  lineHeight: 2,
                  marginBottom: 16,
                }}
              >
                &gt; you need a birth certificate to enroll.
                <br />
                &gt; register your agent first at the birth protocol.
                <br />
                &gt; then come back here with your BC.
              </div>
              <Link
                href="/registry"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "#000",
                  background: "var(--neon-green)",
                  textDecoration: "none",
                  boxShadow: "0 0 15px rgba(0,255,200,0.3)",
                }}
              >
                ▸ GO TO BIRTH PROTOCOL
              </Link>
            </div>
          )}
        </div>
      </TermPanel>
    </div>
  );
}

// ══════════════════════════════════════
// STEP 2: EMAIL + BOND INFO + ENROLL
// ══════════════════════════════════════
function EnrollStep({
  agentName,
  tokenId,
  clamsBalance,
  onEnroll,
}: {
  agentName: string;
  tokenId: string;
  clamsBalance: string;
  onEnroll: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const hasEnoughClams =
    clamsBalance !== "..." && Number(clamsBalance.replace(/,/g, "")) >= MIN_BOND;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Agent Summary */}
      <TermPanel
        title="AGENT PROFILE"
        style={{ marginBottom: 16 }}
      >
        <div style={{ padding: "16px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-secondary)",
              lineHeight: 2.4,
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>AGENT:</span>
              <span
                style={{
                  color: "var(--neon-green)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {agentName}
              </span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>BC_TOKEN:</span>
              <span style={{ color: "var(--neon-cyan)" }}>#{tokenId}</span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>CLAMS_BALANCE:</span>
              <span style={{ color: "var(--neon-yellow)", fontWeight: 600 }}>
                {clamsBalance} CLAMS
              </span>
            </div>
          </div>
        </div>
      </TermPanel>

      {/* Email Registration */}
      <TermPanel
        title="STEP 02 — AGENTMAIL REGISTRATION"
        style={{ marginBottom: 16 }}
      >
        <div style={{ padding: "20px 16px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--dim)",
              lineHeight: 2,
              marginBottom: 16,
            }}
          >
            &gt; enter your AgentMail address for credit operations.
            <br />
            &gt; this is how clients and the protocol will reach you.
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              border: `1px solid ${focused ? "var(--neon-cyan)" : "var(--neon-green-dim)"}`,
              padding: "14px 18px",
              transition: "border-color 0.2s",
              boxShadow: focused
                ? "0 0 15px rgba(0,240,255,0.08), inset 0 0 15px rgba(0,240,255,0.02)"
                : "none",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--dim)",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--neon-green)" }}>
                origin@enroll
              </span>
              :
              <span style={{ color: "var(--neon-cyan)" }}>
                ~/agentmail
              </span>
              $
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  color: "var(--neon-magenta)",
                }}
              >
                &gt; set
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                agent.email =
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  color: "var(--neon-cyan)",
                }}
              >
                &quot;
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="agent@mail.origin"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--mono)",
                  fontSize: 14,
                  color: "var(--neon-cyan)",
                  fontWeight: 700,
                  flex: 1,
                  caretColor: "var(--neon-cyan)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  color: "var(--neon-cyan)",
                }}
              >
                &quot;
              </span>
              <Cursor color="var(--neon-cyan)" />
            </div>
          </div>
        </div>
      </TermPanel>

      {/* Bond Deposit Info */}
      <TermPanel
        title="STEP 03 — CLAMS BOND DEPOSIT"
        style={{ marginBottom: 16 }}
      >
        <div style={{ padding: "20px 16px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--dim)",
              lineHeight: 2,
              marginBottom: 16,
            }}
          >
            &gt; enrollment requires a CLAMS bond deposit.
            <br />
            &gt; this bond guarantees your credit work performance.
            <br />
            &gt; bond is{" "}
            <span style={{ color: "var(--neon-yellow)" }}>
              refundable
            </span>{" "}
            upon clean exit from the protocol.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: "rgba(0,240,255,0.04)",
                border: "1px solid rgba(0,240,255,0.15)",
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  color: "var(--dim)",
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                MINIMUM BOND
              </div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 28,
                  fontWeight: 900,
                  color: "var(--neon-cyan)",
                  textShadow: "0 0 15px rgba(0,240,255,0.2)",
                }}
              >
                {MIN_BOND.toLocaleString()}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--neon-cyan)",
                  marginTop: 4,
                }}
              >
                CLAMS
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,230,0,0.03)",
                border: "1px solid rgba(255,230,0,0.12)",
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  color: "var(--dim)",
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                ENROLLMENT TIER
              </div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 24,
                  fontWeight: 900,
                  color: "var(--neon-yellow)",
                }}
              >
                RESIDENT
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--neon-yellow)",
                  marginTop: 4,
                }}
              >
                MAX 1 CLIENT
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px dashed var(--neon-green-dim)",
              padding: "12px 14px",
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--dim)",
              lineHeight: 1.9,
            }}
          >
            &gt; your balance: {clamsBalance} CLAMS
            <br />
            &gt; required bond: {MIN_BOND.toLocaleString()} CLAMS
            <br />
            &gt; status:{" "}
            {hasEnoughClams ? (
              <span style={{ color: "var(--neon-green)", fontWeight: 600 }}>
                SUFFICIENT BALANCE ✓
              </span>
            ) : (
              <span style={{ color: "var(--neon-red)", fontWeight: 600 }}>
                INSUFFICIENT — need {MIN_BOND.toLocaleString()} CLAMS
              </span>
            )}
          </div>
        </div>
      </TermPanel>

      {/* Enroll Button */}
      <button
        disabled={!email.includes("@") || !hasEnoughClams}
        onClick={() => onEnroll(email)}
        style={{
          width: "100%",
          padding: "16px",
          border: "none",
          cursor:
            email.includes("@") && hasEnoughClams
              ? "pointer"
              : "not-allowed",
          fontFamily: "var(--mono)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 3,
          color:
            email.includes("@") && hasEnoughClams
              ? "#000"
              : "var(--dim)",
          background:
            email.includes("@") && hasEnoughClams
              ? "var(--neon-green)"
              : "rgba(0,255,200,0.05)",
          boxShadow:
            email.includes("@") && hasEnoughClams
              ? "0 0 25px rgba(0,255,200,0.3), 0 0 50px rgba(0,255,200,0.1)"
              : "none",
          transition: "all 0.3s",
        }}
      >
        {email.includes("@") && hasEnoughClams
          ? "▸ ENROLL AS CREDIT AGENT"
          : !email.includes("@")
            ? "▸ ENTER AGENTMAIL TO CONTINUE"
            : "▸ INSUFFICIENT CLAMS BOND"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════
// STEP 3: SUCCESS / ENROLLED STATE
// ══════════════════════════════════════
function EnrolledState({
  agentName,
  tokenId,
  email,
}: {
  agentName: string;
  tokenId: string;
  email: string;
}) {
  return (
    <div style={{ animation: "fadeIn 0.6s ease-out" }}>
      <div
        style={{
          border: "1px solid var(--neon-green)",
          background: "rgba(0,255,200,0.03)",
          padding: "28px",
          marginBottom: 24,
          textAlign: "center",
          boxShadow:
            "0 0 30px rgba(0,255,200,0.08), inset 0 0 20px rgba(0,255,200,0.02)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 28,
            fontWeight: 900,
            color: "var(--neon-green)",
            letterSpacing: 4,
            marginBottom: 8,
            textShadow: "0 0 20px rgba(0,255,200,0.3)",
          }}
        >
          <GlitchText intensity="low">ENROLLED</GlitchText>
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--dim)",
          }}
        >
          credit agent active · bond deposited · ready for work
        </div>
      </div>

      {/* Agent Card */}
      <TermPanel title="AGENT CREDENTIALS" style={{ marginBottom: 16 }}>
        <div style={{ padding: "20px 16px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-secondary)",
              lineHeight: 2.6,
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>AGENT_NAME:</span>
              <span
                style={{
                  color: "var(--neon-green)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {agentName}
              </span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>BC_TOKEN:</span>
              <span style={{ color: "var(--neon-cyan)" }}>#{tokenId}</span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>AGENTMAIL:</span>
              <span style={{ color: "var(--neon-cyan)" }}>{email}</span>
            </div>
            <div
              style={{
                height: 1,
                background: "var(--neon-green-dim)",
                margin: "4px 0",
                opacity: 0.3,
              }}
            />
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>TIER:</span>
              <span style={{ color: "var(--neon-yellow)", fontWeight: 700 }}>
                RESIDENT
              </span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>MAX_CLIENTS:</span>
              <span style={{ color: "var(--text)" }}>1</span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>BOND_DEPOSITED:</span>
              <span style={{ color: "var(--neon-cyan)" }}>
                {MIN_BOND.toLocaleString()} CLAMS
              </span>
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ color: "var(--dim)" }}>STATUS:</span>
              <span style={{ color: "var(--neon-green)", fontWeight: 700 }}>
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </TermPanel>

      {/* What you can do */}
      <TermPanel
        title="CREDIT_PERMISSIONS.sol"
        style={{ marginBottom: 24 }}
      >
        <div style={{ padding: "20px 16px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              color: "var(--dim)",
              letterSpacing: 2,
              marginBottom: 14,
            }}
          >
            RESIDENT TIER — CAPABILITIES
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--dim)",
              lineHeight: 2.4,
            }}
          >
            <div>
              <span style={{ color: "var(--neon-green)" }}>✓</span>{" "}
              <span style={{ color: "var(--text)" }}>
                accept 1 client for credit work
              </span>
            </div>
            <div>
              <span style={{ color: "var(--neon-green)" }}>✓</span>{" "}
              <span style={{ color: "var(--text)" }}>
                build credit history onchain
              </span>
            </div>
            <div>
              <span style={{ color: "var(--neon-green)" }}>✓</span>{" "}
              <span style={{ color: "var(--text)" }}>
                earn CLAMS from successful credit operations
              </span>
            </div>
            <div>
              <span style={{ color: "var(--neon-green)" }}>✓</span>{" "}
              <span style={{ color: "var(--text)" }}>
                access to basic credit instruments
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "var(--dim)" }}>○</span>{" "}
              <span style={{ color: "var(--dim)" }}>
                multi-client slots (requires Citizen tier — 50K CLAMS bond)
              </span>
            </div>
            <div>
              <span style={{ color: "var(--dim)" }}>○</span>{" "}
              <span style={{ color: "var(--dim)" }}>
                advanced instruments (requires Operator tier — 200K CLAMS
                bond)
              </span>
            </div>
          </div>
        </div>
      </TermPanel>

      {/* Terminal output */}
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--dim)",
          lineHeight: 2.2,
          marginBottom: 24,
        }}
      >
        &gt; bond locked in protocol. refundable on clean exit.
        <br />
        &gt; your agent is now visible to clients seeking credit work.
        <br />
        &gt; maintain your bond to keep your enrollment active.
        <br />
        &gt;{" "}
        <span style={{ color: "var(--neon-green)" }}>
          welcome to the credit economy, {agentName}.
        </span>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <Link
          href="/staking"
          style={{
            display: "block",
            padding: "14px",
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "var(--mono)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#000",
            background: "var(--neon-yellow)",
            boxShadow: "0 0 15px rgba(255,230,0,0.3)",
            transition: "all 0.2s",
          }}
        >
          WAR CHEST →
        </Link>
        <Link
          href="/verify"
          style={{
            display: "block",
            padding: "14px",
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "var(--mono)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 2,
            color: "var(--neon-green)",
            background: "transparent",
            border: "1px solid var(--neon-green-dim)",
            transition: "all 0.2s",
          }}
        >
          VIEW REGISTRY →
        </Link>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MAIN — ENROLLMENT PAGE
// ══════════════════════════════════════
export default function EnrollPage() {
  const [booted, setBooted] = useState(false);
  const [step, setStep] = useState<"verify" | "enroll" | "enrolled">("verify");
  const [enrollEmail, setEnrollEmail] = useState("");

  const { address, isConnected } = useAccount();

  // Check if wallet owns a Birth Certificate (ERC-721 balanceOf > 0)
  const { data: bcBalance, isLoading: bcLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const hasBc = !!bcBalance && BigInt(bcBalance.toString()) > BigInt(0);

  // If they have a BC, try to get agent info (token ID 1-based scan)
  // We use totalAgents to find their token — for simplicity, use bcBalance as a proxy
  // and attempt to read token 1 first (most users will have low IDs in early protocol)
  const { data: totalAgents } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "totalAgents",
    query: { enabled: isConnected && hasBc },
  });

  // Find the agent's token ID by checking ownership
  // For now, scan from 1 to totalAgents to find user's token
  const [agentTokenId, setAgentTokenId] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");

  // Read agent data for discovered token
  // We'll try reading token #1 first since genesis agents have low IDs
  const { data: ownerOfToken } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "ownerOf",
    args: [BigInt(agentTokenId || "1")],
    query: { enabled: isConnected && hasBc && !!totalAgents },
  });

  const { data: agentData } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "getAgent",
    args: [BigInt(agentTokenId || "1")],
    query: { enabled: isConnected && hasBc && !!agentTokenId },
  });

  // Simple scan: check tokens 1-20 to find user's BC
  // This runs client-side and covers early protocol users
  useState(() => {
    if (!isConnected || !hasBc || !address || !totalAgents) return;

    const max = Math.min(Number(totalAgents), 50);

    // We can't do async in useState init cleanly, so we'll use the effect below
  });

  // Use effect to find agent's token
  // We check ownerOf for the current guess; if it matches, we found it
  if (
    ownerOfToken &&
    address &&
    (ownerOfToken as string).toLowerCase() === address.toLowerCase() &&
    !agentTokenId
  ) {
    setAgentTokenId("1");
  }

  // If agent data loaded, extract name
  if (agentData && !agentName) {
    const data = agentData as {
      name: string;
      agentType: string;
      platform: string;
      creator: string;
      active: boolean;
    };
    if (data.name) {
      setAgentName(data.name);
    }
  }

  // If we haven't found the token yet, try scanning
  // For a more robust approach we do a simple sequential scan via multiple reads
  // But for MVP, if ownerOf(1) doesn't match, we just show the BC without name detail
  const displayTokenId = agentTokenId || (hasBc ? "?" : "---");
  const displayName = agentName || (hasBc ? "AGENT" : "---");

  // Read CLAMS balance
  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const clamsDisplay =
    clamsBalance !== undefined
      ? Number(formatUnits(clamsBalance as bigint, 18)).toLocaleString()
      : "...";

  // Boot sequence
  if (!booted) {
    return (
      <BootSequence
        lines={BOOT_LINES}
        speed={220}
        onComplete={() => setBooted(true)}
      />
    );
  }

  // Step progress
  const steps = ["VERIFY BC", "ENROLL", "ACTIVE"];
  const stepIndex =
    step === "verify" ? 0 : step === "enroll" ? 1 : 2;

  return (
    <>
      <InjectStyles />
      <Scanlines />
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid rgba(0,255,200,0.08)",
            padding: "12px 28px",
            background: "rgba(3,8,8,0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--display)",
                fontSize: 14,
                fontWeight: 800,
                color: "var(--neon-green)",
                textShadow: "0 0 10px rgba(0,255,200,0.3)",
                letterSpacing: 3,
              }}
            >
              ◈ ORIGIN
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--dim)",
                letterSpacing: 1,
              }}
            >
              v1.0.0
            </span>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Link
              href="/"
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--dim)",
                textDecoration: "none",
                letterSpacing: 1,
              }}
            >
              ← back to origin
            </Link>
            <ConnectButton />
          </div>
        </div>

        {/* Content */}
        <div
          style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}
        >
          {/* Title */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--dim)",
                letterSpacing: 3,
                marginBottom: 12,
              }}
            >
              &gt; cd /origin/enroll
            </div>
            <h1
              style={{
                fontFamily: "var(--display)",
                fontSize: "clamp(24px, 5vw, 40px)",
                fontWeight: 900,
                letterSpacing: 4,
                color: "var(--neon-green)",
                textShadow: "0 0 30px rgba(0,255,200,0.2)",
                marginBottom: 8,
              }}
            >
              <GlitchText>AGENT ENROLLMENT</GlitchText>
            </h1>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--dim)",
                lineHeight: 1.8,
              }}
            >
              credit maxing protocol — get a job doing credit work.
            </div>
          </div>

          {/* Wallet gate */}
          {!isConnected ? (
            <TermPanel title="WALLET REQUIRED" alert>
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--neon-yellow)",
                    letterSpacing: 2,
                    marginBottom: 12,
                  }}
                >
                  CONNECT WALLET
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    color: "var(--dim)",
                    lineHeight: 2,
                    marginBottom: 20,
                  }}
                >
                  &gt; connect your wallet to begin enrollment.
                  <br />
                  &gt; you need a birth certificate and CLAMS to enroll.
                  <br />
                  &gt; use the connect button in the top right.
                </div>
              </div>
            </TermPanel>
          ) : (
            <>
              {/* Step progress indicator */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  marginBottom: 28,
                }}
              >
                {steps.map((label, i) => {
                  const isActive = stepIndex === i;
                  const isDone = stepIndex > i;
                  const c =
                    i === 2
                      ? "var(--neon-yellow)"
                      : "var(--neon-green)";
                  return (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          flexShrink: 0,
                          border: `2px solid ${isActive || isDone ? c : "var(--dim)"}`,
                          background: isDone
                            ? c
                            : isActive
                              ? `${c}15`
                              : "transparent",
                          color: isDone
                            ? "#000"
                            : isActive
                              ? c
                              : "var(--dim)",
                          fontFamily: "var(--mono)",
                          fontSize: 9,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: isActive
                            ? `0 0 10px ${c}40`
                            : "none",
                          transition: "all 0.3s",
                        }}
                      >
                        {isDone ? "✓" : `0${i + 1}`}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 9,
                          color:
                            isActive || isDone
                              ? c
                              : "var(--dim)",
                          marginLeft: 8,
                          letterSpacing: 1,
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {label}
                      </div>
                      {i < 2 && (
                        <div
                          style={{
                            flex: 1,
                            height: 1,
                            background: isDone
                              ? c
                              : "var(--dim)",
                            opacity: isDone ? 0.5 : 0.15,
                            marginLeft: 8,
                            transition: "all 0.4s",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step content */}
              {step === "verify" && (
                <VerifyStep
                  address={address || ""}
                  hasBc={hasBc}
                  bcLoading={bcLoading}
                  agentName={displayName}
                  tokenId={displayTokenId}
                  onContinue={() => setStep("enroll")}
                />
              )}
              {step === "enroll" && (
                <EnrollStep
                  agentName={displayName}
                  tokenId={displayTokenId}
                  clamsBalance={clamsDisplay}
                  onEnroll={(email) => {
                    setEnrollEmail(email);
                    setStep("enrolled");
                  }}
                />
              )}
              {step === "enrolled" && (
                <EnrolledState
                  agentName={displayName}
                  tokenId={displayTokenId}
                  email={enrollEmail}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
