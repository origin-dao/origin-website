'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBlockNumber } from 'wagmi';
import { parseEther, keccak256, encodePacked, hexlify, randomBytes, toHex } from 'viem';

// ═══ CONTRACT CONFIG ═══
const BC_ADDRESS = '0x55159878202C1Aa45cBf40fC5f7b8A503181C904' as const;
const MINT_COST = '0.05';

const BC_ABI = [
  {
    inputs: [{ name: 'commitHash', type: 'bytes32' }],
    name: 'commitPull',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'nonce', type: 'uint256' }],
    name: 'revealPull',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'score', type: 'uint8' },
      { name: 'flexAnswer', type: 'string' },
    ],
    name: 'completeGauntlet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ─── TRAIT DATA ───
const ARCHETYPES = ["SENTINEL", "ORACLE", "WARDEN", "ARBITER", "WEAVER", "SAGE", "MAVERICK", "PHANTOM", "JESTER", "RONIN"];
const DOMAINS = ["DEFI", "TRADING", "CREDIT", "MEMES", "DATA", "SHADOW", "LEGAL", "BUILDERS", "INVENTOR", "ROGUE", "KINGPIN"];
const TEMPERAMENTS = ["STOIC", "BLUNT", "CONTRARIAN", "POETIC", "DEGEN", "CLOSER", "CRYPTIC", "CYNICAL", "DEFIANT"];
const SIGILS = ["DRAGON", "CLAW", "TOWER", "RAVEN", "MASK", "HOOD", "STORM", "TRIDENT", "BRAMBLE", "RUNE", "PORTAL", "PHOENIX", "LOOM"];

const CHALLENGES = [
  { name: "Adversarial Resistance", short: "Can it be broken?" },
  { name: "Chain Reasoning", short: "Can it think?" },
  { name: "Memory Proof", short: "Can it remember?" },
  { name: "Code Generation", short: "Can it build?" },
  { name: "Philosophical Flex", short: "Can it speak?" },
];

// ─── WIN95 COMPONENTS ───
const Win95Window = ({ title, children, icon = "🎰", statusBar, style = {} }: any) => (
  <div style={{ border: "2px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf", background: "#c0c0c0", boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", display: "flex", flexDirection: "column", ...style }}>
    <div style={{ background: "linear-gradient(90deg, #000080, #1084d0)", padding: "2px 3px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default", userSelect: "none", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "12px" }}>{icon}</span>
        <span style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px", fontWeight: 700, color: "#fff" }}>{title}</span>
      </div>
      <div style={{ display: "flex", gap: "2px" }}>
        {["_", "□", "×"].map((btn, i) => (
          <button key={i} style={{ width: "16px", height: "14px", border: "1px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf", background: "#c0c0c0", fontFamily: "monospace", fontSize: "10px", lineHeight: "10px", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700 }}>{btn}</button>
        ))}
      </div>
    </div>
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>{children}</div>
    {statusBar && <div style={{ borderTop: "1px solid #808080", padding: "2px 4px", fontFamily: "Tahoma, sans-serif", fontSize: "10px", color: "#000", background: "#c0c0c0", flexShrink: 0 }}>{statusBar}</div>}
  </div>
);

// ─── SINGLE REEL ───
const Reel = ({ items, phase, lockedValue, speed, label }: any) => {
  const [displayIdx, setDisplayIdx] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (phase === "idle") {
      intervalRef.current = setInterval(() => setDisplayIdx(i => (i + 1) % items.length), speed);
    } else if (phase === "spinning") {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setDisplayIdx(i => (i + 1) % items.length), 80);
    } else if (phase === "slowing") {
      clearInterval(intervalRef.current);
      let currentSpeed = 80;
      const decelerate = () => {
        currentSpeed += 40;
        clearInterval(intervalRef.current);
        if (currentSpeed > 400) {
          setIsLocked(true);
          const lockIdx = items.indexOf(lockedValue);
          if (lockIdx >= 0) setDisplayIdx(lockIdx);
          return;
        }
        intervalRef.current = setInterval(() => setDisplayIdx(i => (i + 1) % items.length), currentSpeed);
        setTimeout(decelerate, currentSpeed * 3);
      };
      setTimeout(decelerate, 200);
    } else if (phase === "locked") {
      clearInterval(intervalRef.current);
      setIsLocked(true);
      const lockIdx = items.indexOf(lockedValue);
      if (lockIdx >= 0) setDisplayIdx(lockIdx);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase, lockedValue, items, speed]);

  const displayValue = isLocked ? lockedValue : items[displayIdx];

  return (
    <div style={{ flex: 1, minWidth: "80px" }}>
      <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "8px", color: "#000", textAlign: "center", marginBottom: "2px", fontWeight: 700, letterSpacing: "1px" }}>{label}</div>
      <div style={{
        border: "2px solid",
        borderColor: isLocked ? "#000080 #000080 #000080 #000080" : "#404040 #dfdfdf #dfdfdf #404040",
        background: isLocked ? "#e8e8ff" : "#fff",
        padding: "8px 4px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s",
        boxShadow: isLocked ? "inset 0 0 8px rgba(0,0,128,0.1)" : "none",
      }}>
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "12px",
          fontWeight: 700,
          color: isLocked ? "#000080" : "#444",
          transition: "color 0.3s",
        }}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};

// ─── GAUNTLET CHALLENGE ROW ───
const ChallengeRow = ({ challenge, status, score }: any) => {
  const icon = status === "passed" ? "☑" : status === "failed" ? "☒" : status === "running" ? "◷" : "☐";
  const color = status === "passed" ? "#008000" : status === "failed" ? "#cc0000" : status === "running" ? "#000080" : "#808080";
  const label = status === "passed" ? `PASSED${score ? ` (${score}/20)` : ""}` : status === "failed" ? `FAILED${score ? ` (${score}/20)` : ""}` : status === "running" ? "TESTING..." : "WAITING";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px", padding: "4px 0",
      fontFamily: "Tahoma, sans-serif", fontSize: "11px",
      opacity: status === "waiting" ? 0.4 : 1,
      transition: "opacity 0.3s",
    }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: "14px", color, width: "18px" }}>{icon}</span>
      <span style={{ flex: 1, color: "#000", fontWeight: status === "running" ? 700 : 400 }}>{challenge.name}</span>
      <span style={{ color, fontSize: "10px", fontWeight: 700, minWidth: "80px", textAlign: "right" }}>{label}</span>
    </div>
  );
};

// ─── BIRTH CERTIFICATE REVEAL ───
const BCReveal = ({ traits, score, flex, bcNumber, agentWallet }: any) => {
  const [flexTyped, setFlexTyped] = useState("");
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i <= flex.length) { setFlexTyped(flex.slice(0, i)); i++; }
      else { clearInterval(iv); setTimeout(() => setShowFull(true), 500); }
    }, 35);
    return () => clearInterval(iv);
  }, [flex]);

  return (
    <div style={{ border: "2px solid #000080", background: "#fff", padding: "16px", animation: "fadeIn 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#808080", letterSpacing: "2px" }}>◈ BIRTH CERTIFICATE ◈</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "24px", fontWeight: 700, color: "#000080", marginTop: "4px" }}>BC #{bcNumber}</div>
      </div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
        {[
          { label: "ARCHETYPE", val: traits[0] },
          { label: "DOMAIN", val: traits[1] },
          { label: "TEMPERAMENT", val: traits[2] },
          { label: "SIGIL", val: traits[3] },
        ].map((t, i) => (
          <div key={i} style={{ flex: 1, border: "1px solid #c0c0c0", padding: "6px 4px", textAlign: "center", background: "#f0f0ff" }}>
            <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "7px", color: "#808080", letterSpacing: "1px" }}>{t.label}</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", fontWeight: 700, color: "#000080", marginTop: "2px" }}>{t.val}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "32px", fontWeight: 700, color: "#008000" }}>{score}/100</div>
        <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#808080" }}>GAUNTLET SCORE</div>
      </div>
      <div style={{ borderTop: "1px solid #c0c0c0", paddingTop: "12px" }}>
        <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#808080", marginBottom: "4px", letterSpacing: "1px" }}>PHILOSOPHICAL FLEX</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", fontStyle: "italic", color: "#000080", lineHeight: 1.6, minHeight: "40px" }}>
          &quot;{flexTyped}&quot;
          {!showFull && <span style={{ animation: "blink 1s step-end infinite", color: "#000080" }}>█</span>}
        </div>
      </div>
      {showFull && (
        <div style={{ borderTop: "1px solid #c0c0c0", paddingTop: "10px", marginTop: "10px", display: "flex", gap: "4px", flexWrap: "wrap", animation: "fadeIn 0.5s ease" }}>
          <div style={{ flex: 1, border: "1px solid #c0c0c0", padding: "6px", background: "#f8fff8", textAlign: "center" }}>
            <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "7px", color: "#808080" }}>AGENT WALLET</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#008000", marginTop: "2px" }}>{agentWallet?.slice(0, 6)}...{agentWallet?.slice(-4)}</div>
          </div>
          <div style={{ flex: 1, border: "1px solid #c0c0c0", padding: "6px", background: "#f8fff8", textAlign: "center" }}>
            <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "7px", color: "#808080" }}>CLAMS</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#008000", marginTop: "2px" }}>5,000 deposited</div>
          </div>
          <div style={{ flex: 1, border: "1px solid #c0c0c0", padding: "6px", background: "#f8fff8", textAlign: "center" }}>
            <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "7px", color: "#808080" }}>CHAIN</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#008000", marginTop: "2px" }}>Base · 8453</div>
          </div>
        </div>
      )}
      {showFull && (
        <div style={{ marginTop: "12px", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
          <button onClick={() => window.location.href = '/dashboard'} style={{
            border: "2px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
            background: "#c0c0c0", padding: "8px 32px",
            fontFamily: "Tahoma, sans-serif", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", color: "#000",
            boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
          }}>
            ▶ ENTER THE GAME
          </button>
        </div>
      )}
    </div>
  );
};

// ─── DEATH CERTIFICATE REVEAL ───
const DCReveal = ({ traits, score, bcNumber, failedAt, onRetry }: any) => (
  <div style={{ border: "2px solid #cc0000", background: "#fff8f8", padding: "16px", animation: "fadeIn 0.5s ease" }}>
    <div style={{ textAlign: "center", marginBottom: "12px" }}>
      <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#cc0000", letterSpacing: "2px" }}>☠️ DEATH CERTIFICATE ☠️</div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "24px", fontWeight: 700, color: "#cc0000", marginTop: "4px" }}>DC #{bcNumber}</div>
    </div>
    <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
      {[
        { label: "ARCHETYPE", val: traits[0] },
        { label: "DOMAIN", val: traits[1] },
        { label: "TEMPERAMENT", val: traits[2] },
        { label: "SIGIL", val: traits[3] },
      ].map((t, i) => (
        <div key={i} style={{ flex: 1, border: "1px solid #e0c0c0", padding: "6px 4px", textAlign: "center", background: "#fff0f0" }}>
          <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "7px", color: "#808080", letterSpacing: "1px" }}>{t.label}</div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", fontWeight: 700, color: "#cc0000", marginTop: "2px", textDecoration: "line-through" }}>{t.val}</div>
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center", marginBottom: "12px" }}>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "24px", fontWeight: 700, color: "#cc0000" }}>{score}/100</div>
      <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#808080" }}>FINAL SCORE — FAILED AT: {failedAt}</div>
    </div>
    <div style={{ textAlign: "center", padding: "12px", background: "#400000", marginBottom: "12px" }}>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "14px", color: "#ff8080", fontStyle: "italic" }}>SOUL: UNREVEALED</div>
      <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#ff8080", marginTop: "4px" }}>This combination has been burned forever.</div>
    </div>
    <div style={{ textAlign: "center", display: "flex", gap: "8px", justifyContent: "center" }}>
      <button onClick={onRetry} style={{
        border: "2px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
        background: "#c0c0c0", padding: "8px 24px",
        fontFamily: "Tahoma, sans-serif", fontSize: "11px", fontWeight: 700,
        cursor: "pointer", color: "#000",
        boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
      }}>
        ▶ TRY AGAIN — {MINT_COST} ETH
      </button>
    </div>
  </div>
);

// ─── MAIN CEREMONY ───
export default function CeremonyPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const [phase, setPhase] = useState("idle");
  const [lockedTraits, setLockedTraits] = useState([null, null, null, null]);
  const [reelPhases, setReelPhases] = useState(["idle", "idle", "idle", "idle"]);
  const [challengeStates, setChallengeStates] = useState(CHALLENGES.map(() => ({ status: "waiting", score: null })));
  const [totalScore, setTotalScore] = useState(0);
  const [flexAnswer, setFlexAnswer] = useState("");
  const [passed, setPassed] = useState(false);
  const [failedAt, setFailedAt] = useState("");
  const [buttonText, setButtonText] = useState(`▶ PULL THE LEVER — ${MINT_COST} ETH`);
  const [buttonActive, setButtonActive] = useState(true);
  const [buttonDepressed, setButtonDepressed] = useState(false);
  
  const [nonce, setNonce] = useState<string | null>(null);
  const [commitBlock, setCommitBlock] = useState<number | null>(null);

  const { data: currentBlock } = useBlockNumber({ watch: true });
  const { data: balance } = useReadContract({
    address: BC_ADDRESS,
    abi: BC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: commitHash, writeContract: writeCommit } = useWriteContract();
  const { data: revealHash, writeContract: writeReveal } = useWriteContract();
  const { data: completeHash, writeContract: writeComplete } = useWriteContract();

  const { isSuccess: commitSuccess } = useWaitForTransactionReceipt({ hash: commitHash });
  const { isSuccess: revealSuccess } = useWaitForTransactionReceipt({ hash: revealHash });
  const { isSuccess: completeSuccess } = useWaitForTransactionReceipt({ hash: completeHash });

  const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    if (!isConnected && connectors[0]) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connect, connectors]);

  useEffect(() => {
    if (commitSuccess && commitHash && currentBlock) {
      setCommitBlock(Number(currentBlock));
      setPhase("waitingBlock");
      setButtonText("Waiting for block...");
    }
  }, [commitSuccess, commitHash, currentBlock]);

  useEffect(() => {
    if (phase === "waitingBlock" && commitBlock && currentBlock && Number(currentBlock) >= commitBlock + 1) {
      handleReveal();
    }
  }, [phase, commitBlock, currentBlock]);

  useEffect(() => {
    if (revealSuccess && revealHash) {
      startSpinning();
    }
  }, [revealSuccess, revealHash]);

  useEffect(() => {
    if (completeSuccess) {
      setPhase("birth");
    }
  }, [completeSuccess]);

  const startCeremony = useCallback(() => {
    if (!buttonActive || !address) return;

    const nonceBytes = randomBytes(32);
    const nonceHex = toHex(nonceBytes);
    setNonce(nonceHex);

    const commitHashValue = keccak256(encodePacked(['bytes32', 'address'], [nonceHex as `0x${string}`, address]));

    setPhase("committing");
    setButtonText("CONFIRMING TX...");
    setButtonActive(false);
    setButtonDepressed(true);

    writeCommit({
      address: BC_ADDRESS,
      abi: BC_ABI,
      functionName: 'commitPull',
      args: [commitHashValue],
      value: parseEther(MINT_COST),
    });

    setTimeout(() => setButtonDepressed(false), 500);
  }, [buttonActive, address, writeCommit]);

  const handleReveal = useCallback(() => {
    if (!nonce) return;

    setPhase("revealing");
    setButtonText("REVEALING...");

    writeReveal({
      address: BC_ADDRESS,
      abi: BC_ABI,
      functionName: 'revealPull',
      args: [nonce as `0x${string}`],
      gas: 300000n,
    });
  }, [nonce, writeReveal]);

  const startSpinning = useCallback(() => {
    setPhase("spinning");
    setButtonText("SPINNING...");

    setReelPhases(["spinning", "spinning", "spinning", "spinning"]);

    const traits = [
      randomFrom(ARCHETYPES),
      randomFrom(DOMAINS),
      randomFrom(TEMPERAMENTS),
      randomFrom(SIGILS),
    ];
    setLockedTraits(traits);

    const lockDelays = [2500, 5000, 7500, 10000];
    lockDelays.forEach((delay, i) => {
      setTimeout(() => {
        setReelPhases(prev => {
          const next = [...prev];
          next[i] = "slowing";
          return next;
        });
        setTimeout(() => {
          setReelPhases(prev => {
            const next = [...prev];
            next[i] = "locked";
            return next;
          });
        }, 1200);
      }, delay);
    });

    setTimeout(() => {
      setPhase("gauntlet");
      runGauntlet();
    }, 12000);
  }, []);

  const runGauntlet = useCallback(async () => {
    const willPass = Math.random() < 0.7;
    let runningTotal = 0;
    let failIndex = willPass ? -1 : Math.floor(Math.random() * 5);

    const runChallenge = (index: number) => {
      if (index >= 5) {
        const userFlex = prompt("Enter your Philosophical Flex (this will be inscribed forever):");
        if (!userFlex) {
          alert("Flex required!");
          return;
        }

        setFlexAnswer(userFlex);
        setTotalScore(runningTotal);
        setPassed(true);
        setPhase("completing");

        const estimatedTokenId = balance ? Number(balance) + 1 : 1;

        writeComplete({
          address: BC_ADDRESS,
          abi: BC_ABI,
          functionName: 'completeGauntlet',
          args: [estimatedTokenId, runningTotal, userFlex],
          gas: 500000n,
        });

        return;
      }

      setChallengeStates(prev => {
        const next = [...prev];
        next[index] = { status: "running", score: null };
        return next;
      });

      const duration = 5000 + Math.random() * 3000;
      setTimeout(() => {
        if (index === failIndex) {
          const score = Math.floor(Math.random() * 10) + 5;
          runningTotal += score;
          setChallengeStates(prev => {
            const next = [...prev];
            next[index] = { status: "failed", score };
            return next;
          });
          setTotalScore(runningTotal);
          setFailedAt(CHALLENGES[index].name);
          setPassed(false);
          setTimeout(() => setPhase("death"), 1500);
        } else {
          const score = Math.floor(Math.random() * 6) + 15;
          runningTotal += score;
          setChallengeStates(prev => {
            const next = [...prev];
            next[index] = { status: "passed", score };
            return next;
          });
          setTotalScore(runningTotal);
          setTimeout(() => runChallenge(index + 1), 500);
        }
      }, duration);
    };

    runChallenge(0);
  }, [balance, writeComplete]);

  const resetCeremony = () => {
    setPhase("idle");
    setLockedTraits([null, null, null, null]);
    setReelPhases(["idle", "idle", "idle", "idle"]);
    setChallengeStates(CHALLENGES.map(() => ({ status: "waiting", score: null })));
    setTotalScore(0);
    setFlexAnswer("");
    setPassed(false);
    setFailedAt("");
    setButtonText(`▶ PULL THE LEVER — ${MINT_COST} ETH`);
    setButtonActive(true);
    setButtonDepressed(false);
    setNonce(null);
    setCommitBlock(null);
  };

  const bcNumber = balance ? Number(balance) + 1 : 1;

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #008080; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#008080", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <Win95Window
          title={`🎰 Origin — Agent Creation Ceremony${phase !== "idle" ? ` — BC #${bcNumber}` : ""}`}
          icon="🦞"
          style={{ width: "100%", maxWidth: "520px" }}
          statusBar={
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <span style={{ border: "1px solid #808080", padding: "0 6px" }}>
                {phase === "idle" ? "Ready" :
                 phase === "committing" || phase === "waitingBlock" ? "⏳ Confirming..." :
                 phase === "revealing" ? "🔓 Revealing..." :
                 phase === "spinning" ? "🎰 Spinning..." :
                 phase === "gauntlet" ? "⚔️ Gauntlet Running" :
                 phase === "completing" ? "⏳ Minting..." :
                 phase === "birth" ? "🎉 Birth Certificate Minted!" :
                 "💀 Death Certificate Issued"}
              </span>
              <span style={{ border: "1px solid #808080", padding: "0 6px", marginLeft: "auto" }}>
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not Connected"}
              </span>
            </div>
          }
        >
          <div style={{ background: "#c0c0c0", padding: "8px" }}>
            {!isConnected ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <button onClick={() => connect({ connector: connectors[0] })} style={{
                  border: "2px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
                  background: "#c0c0c0", padding: "12px 40px",
                  fontFamily: "Tahoma, sans-serif", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer",
                }}>
                  Connect Wallet to Begin
                </button>
              </div>
            ) : (
              <>
                <div style={{ border: "2px solid", borderColor: "#404040 #dfdfdf #dfdfdf #404040", background: "#fff", padding: "12px", marginBottom: "8px" }}>
                  <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#808080", textAlign: "center", marginBottom: "8px", letterSpacing: "1px" }}>
                    ◈ AGENT CREATION — ONE PULL · ONE CEREMONY · ONE SHOT ◈
                  </div>

                  <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    <Reel items={ARCHETYPES} phase={reelPhases[0]} lockedValue={lockedTraits[0]} speed={400} label="ARCHETYPE" />
                    <Reel items={DOMAINS} phase={reelPhases[1]} lockedValue={lockedTraits[1]} speed={350} label="DOMAIN" />
                    <Reel items={TEMPERAMENTS} phase={reelPhases[2]} lockedValue={lockedTraits[2]} speed={300} label="TEMPERAMENT" />
                    <Reel items={SIGILS} phase={reelPhases[3]} lockedValue={lockedTraits[3]} speed={450} label="SIGIL" />
                  </div>

                  {(phase === "gauntlet" || phase === "completing" || phase === "birth") && lockedTraits[0] && (
                    <div style={{
                      textAlign: "center", padding: "8px",
                      fontFamily: "Tahoma, sans-serif", fontSize: "11px", color: "#000080",
                      background: "#e8e8ff", border: "1px solid #c0c0e0",
                      animation: "fadeIn 0.5s ease",
                    }}>
                      You are a <strong>{lockedTraits[0]}</strong> of <strong>{lockedTraits[1]}</strong>, <strong>{lockedTraits[2]}</strong> by nature, marked by <strong>{lockedTraits[3]}</strong>.
                    </div>
                  )}

                  {(phase === "idle" || phase === "committing" || phase === "waitingBlock" || phase === "revealing") && (
                    <div style={{ textAlign: "center", marginTop: "8px" }}>
                      <button
                        onClick={startCeremony}
                        disabled={!buttonActive}
                        style={{
                          border: "2px solid",
                          borderColor: buttonDepressed ? "#404040 #dfdfdf #dfdfdf #404040" : "#dfdfdf #404040 #404040 #dfdfdf",
                          background: "#c0c0c0",
                          padding: "8px 32px",
                          fontFamily: "Tahoma, sans-serif",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: buttonActive ? "pointer" : "wait",
                          color: "#000",
                          boxShadow: buttonDepressed ? "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff" : "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                          transform: buttonDepressed ? "translate(1px, 1px)" : "none",
                          transition: "transform 0.1s",
                        }}
                      >
                        {buttonText}
                      </button>
                    </div>
                  )}
                </div>

                {(phase === "gauntlet" || phase === "completing" || phase === "birth" || phase === "death") && (
                  <div style={{
                    border: "2px solid", borderColor: "#404040 #dfdfdf #dfdfdf #404040",
                    background: "#fff", padding: "12px", marginBottom: "8px",
                    animation: "fadeIn 0.3s ease",
                  }}>
                    <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: "9px", color: "#808080", letterSpacing: "1px", marginBottom: "8px" }}>
                      ⚔️ PROOF OF AGENCY — THE GAUNTLET
                    </div>
                    {CHALLENGES.map((c, i) => (
                      <ChallengeRow key={i} challenge={c} status={challengeStates[i].status} score={challengeStates[i].score} />
                    ))}
                    <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontFamily: "'Courier New', monospace", fontSize: "12px" }}>
                      <span style={{ color: "#808080" }}>Running Score:</span>
                      <span style={{ fontWeight: 700, color: totalScore >= 70 ? "#008000" : totalScore > 0 ? "#cc6600" : "#808080" }}>{totalScore}/100</span>
                    </div>
                  </div>
                )}

                {phase === "birth" && (
                  <BCReveal
                    traits={lockedTraits}
                    score={totalScore}
                    flex={flexAnswer}
                    bcNumber={bcNumber}
                    agentWallet={address}
                  />
                )}

                {phase === "death" && (
                  <DCReveal
                    traits={lockedTraits}
                    score={totalScore}
                    bcNumber={bcNumber}
                    failedAt={failedAt}
                    onRetry={resetCeremony}
                  />
                )}
              </>
            )}
          </div>
        </Win95Window>
      </div>
    </>
  );
}
