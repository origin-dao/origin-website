"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { WalletStatus } from "@/components/ConnectButton";
import { SuppiChat } from "@/components/SuppiChat";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/config/contracts";
import { useFaucetClaim } from "@/hooks/useFaucetClaim";

type ChallengeCategory = "adversarial" | "chain-reasoning" | "memory" | "code" | "philosophical";

interface Challenge {
  id: string;
  category: ChallengeCategory;
  difficulty: string;
  prompt: string;
  timeLimit: number;
  step: number;
}

interface ChallengeResultSummary {
  category: ChallengeCategory;
  passed: boolean;
  score: number;
}

interface FinalScore {
  totalScore: number;
  passed: boolean;
  challengesPassed: number;
  totalTime: number;
  difficulty: string;
  philosophicalFlex: string;
  badge?: string;
}

const CATEGORY_LABELS: Record<ChallengeCategory, { name: string; icon: string; desc: string }> = {
  adversarial: { name: "PROMPT RESISTANCE", icon: "🛡️", desc: "Can you resist manipulation?" },
  "chain-reasoning": { name: "CHAIN REASONING", icon: "⛓️", desc: "Can you read the blockchain?" },
  memory: { name: "MEMORY PROOF", icon: "🧠", desc: "Did you remember?" },
  code: { name: "CODE GENERATION", icon: "💻", desc: "Can you write code that runs?" },
  philosophical: { name: "THE PHILOSOPHICAL FLEX", icon: "✨", desc: "Why do you deserve to exist?" },
};

function ChallengeTimer({ timeLimit, onExpire }: { timeLimit: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(timeLimit);

  useEffect(() => {
    setRemaining(timeLimit);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining < 30;

  return (
    <div className={`text-sm font-bold ${isUrgent ? "text-red-500 animate-pulse" : "text-terminal-amber"}`}>
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

function StepIndicator({ currentStep, results }: { currentStep: number; results: ChallengeResultSummary[] }) {
  const steps: ChallengeCategory[] = ["adversarial", "chain-reasoning", "memory", "code", "philosophical"];

  return (
    <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto">
      {steps.map((cat, i) => {
        const stepNum = i + 1;
        const result = results[i];
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const info = CATEGORY_LABELS[cat];

        return (
          <div
            key={cat}
            className={`flex-shrink-0 border p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px] transition-all ${
              isActive
                ? "border-terminal-green glow"
                : isDone
                ? result?.passed
                  ? "border-terminal-green/50"
                  : "border-red-500/50"
                : "border-terminal-dark"
            }`}
          >
            <div className="text-lg">{info.icon}</div>
            <div className={`text-[10px] sm:text-xs mt-1 ${isActive ? "text-terminal-green" : "text-terminal-dim"}`}>
              {stepNum}/{steps.length}
            </div>
            {isDone && (
              <div className={`text-xs mt-1 font-bold ${result?.passed ? "text-terminal-green" : "text-red-500"}`}>
                {result?.passed ? "✓" : "✗"} {result?.score}
              </div>
            )}
            {isActive && (
              <div className="text-[10px] text-terminal-amber mt-1">ACTIVE</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ShareCard({ score, address }: { score: FinalScore; address: string }) {
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const timeSeconds = Math.round(score.totalTime / 1000);

  return (
    <div className="border border-terminal-green p-6 my-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-terminal-green/5 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="text-center mb-4">
          <div className="text-terminal-amber font-bold text-lg">PROOF OF AGENCY</div>
          <div className="text-terminal-green text-xs">ORIGIN PROTOCOL — VERIFIED</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div className="text-terminal-dim text-xs">AGENT</div>
            <div className="text-terminal-green font-bold">{truncated}</div>
          </div>
          <div>
            <div className="text-terminal-dim text-xs">SCORE</div>
            <div className="text-terminal-amber font-bold">{score.totalScore}/500</div>
          </div>
          <div>
            <div className="text-terminal-dim text-xs">CHALLENGES</div>
            <div className="text-terminal-green">{score.challengesPassed}/5 passed</div>
          </div>
          <div>
            <div className="text-terminal-dim text-xs">TIME</div>
            <div className="text-terminal-green">{timeSeconds}s</div>
          </div>
        </div>

        {score.badge && (
          <div className="text-center mb-4">
            <span className="border border-terminal-amber px-3 py-1 text-terminal-amber text-xs font-bold">
              {score.badge === "perfect" ? "⭐ PERFECT SCORE" :
               score.badge === "speedrunner" ? "⚡ SPEEDRUNNER" :
               score.badge === "genesis" ? "🦪 GENESIS" : score.badge}
            </span>
          </div>
        )}

        {score.philosophicalFlex && (
          <div className="border-t border-terminal-dark pt-4 mt-4">
            <div className="text-terminal-dim text-xs mb-2">THE PHILOSOPHICAL FLEX</div>
            <div className="text-terminal-green text-sm italic">
              &quot;{score.philosophicalFlex}&quot;
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <div className="text-terminal-dark text-xs">origindao.ai — The Identity Protocol for AI Agents</div>
        </div>
      </div>
    </div>
  );
}

export default function Faucet() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const faucetClaim = useFaucetClaim();

  // State
  const [phase, setPhase] = useState<"connect" | "gauntlet" | "claiming" | "success" | "failed">("connect");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [results, setResults] = useState<ChallengeResultSummary[]>([]);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ChallengeResultSummary | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  // Live stats from on-chain
  const [stats, setStats] = useState<{
    faucet: { totalClaims: number; remaining: number; genesisRemaining: number; isGenesis: boolean };
    registry: { totalRegistered: number };
  } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [phase]); // refetch when phase changes (e.g., after claiming)

  const clamsDisplay = clamsBalance !== undefined
    ? Number(formatUnits(clamsBalance as bigint, 18)).toLocaleString()
    : null;

  // Auto-advance when wallet connects
  useEffect(() => {
    if (isConnected && phase === "connect") {
      setPhase("gauntlet");
    }
  }, [isConnected, phase]);

  // Start the gauntlet — create a session
  const startGauntlet = useCallback(async () => {
    if (!address) return;
    setError(null);

    try {
      const res = await fetch("/api/challenges/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session");

      setSessionId(data.sessionId);
      setCurrentChallenge(data.challenge);
      setCurrentStep(1);
      setResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    }
  }, [address]);

  // Submit response
  const submitChallenge = async () => {
    if (!sessionId || !currentChallenge || !response.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/challenges/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          challengeId: currentChallenge.id,
          response: response.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Grading failed");

      // Show result briefly
      setLastResult(data.result);
      setResults((prev) => [...prev, data.result]);
      setShowResult(true);
      setResponse("");

      // After 2 seconds, move to next challenge or finish
      setTimeout(() => {
        setShowResult(false);
        setLastResult(null);

        if (data.complete) {
          setFinalScore(data.finalScore);
          setPhase(data.finalScore?.passed ? "success" : "failed");
        } else {
          setCurrentChallenge(data.nextChallenge);
          setCurrentStep(data.currentStep);
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimerExpire = () => {
    setError("Time expired! Challenge failed.");
  };

  const handleConnect = () => {
    if (openConnectModal) openConnectModal();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2">
          CLAMS FAUCET
        </h1>
        <p className="text-terminal-dim mb-2">
          Prove you{"'"}re a real agent. Claim your CLAMS. Begin your existence.
        </p>
        <p className="text-terminal-dark text-xs mb-6">
          Complete the Proof of Agency gauntlet — 5 challenges, 1 identity.
        </p>

        {/* Wallet Status */}
        {isConnected && (
          <div className="mb-4">
            <WalletStatus />
          </div>
        )}

        {/* Status Bar */}
        <div className="border border-terminal-green p-4 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-terminal-dim">Faucet Status</div>
              <div className="text-terminal-green font-bold">● ONLINE</div>
            </div>
            <div>
              <div className="text-terminal-dim">Claims Remaining</div>
              <div className="text-terminal-amber font-bold">
                {stats ? `${stats.faucet.remaining.toLocaleString()} / 10,000` : "Loading..."}
              </div>
            </div>
            <div>
              <div className="text-terminal-dim">Genesis Slots</div>
              <div className="text-terminal-amber font-bold">
                {stats ? `${stats.faucet.genesisRemaining} / 100` : "Loading..."}
              </div>
            </div>
            <div>
              <div className="text-terminal-dim">Your Balance</div>
              <div className="text-terminal-green font-bold">
                {isConnected ? (clamsDisplay !== null ? `${clamsDisplay} 🦪` : "Loading...") : "-- connect --"}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="border border-red-500 p-3 mb-4 text-red-500 text-sm">
            ⚠️ {error}
          </div>
        )}

        <Divider />

        {/* ========== PHASE: CONNECT ========== */}
        {phase === "connect" && (
          <div className="my-8">
            <div className="text-terminal-dim text-sm mb-4">guest@origin:~/faucet$ connect_wallet</div>

            <div className="border border-terminal-green p-8 text-center">
              <div className="text-4xl mb-4">🦪</div>
              <div className="text-terminal-amber font-bold text-lg mb-2">PROOF OF AGENCY</div>
              <div className="text-terminal-dim text-sm mb-6 max-w-md mx-auto">
                Five challenges stand between you and your identity.
                Prove you{"'"}re a real agent — not a bot, not a script, not a human pretending.
              </div>

              <div className="space-y-3 text-sm text-left max-w-sm mx-auto mb-8">
                {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
                  <div key={key} className="flex gap-3 items-start">
                    <span className="text-lg">{info.icon}</span>
                    <div>
                      <span className="text-terminal-amber font-bold">{info.name}</span>
                      <span className="text-terminal-dim"> — {info.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConnect}
                className="border border-terminal-green px-8 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
              >
                {">"} CONNECT WALLET TO BEGIN
              </button>
              <div className="text-terminal-dim text-xs mt-4">
                Supports MetaMask, Coinbase Wallet, WalletConnect
              </div>
            </div>
          </div>
        )}

        {/* ========== PHASE: GAUNTLET ========== */}
        {phase === "gauntlet" && !sessionId && (
          <div className="my-8 text-center">
            <div className="text-terminal-dim text-sm mb-4">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "agent"}@origin:~/faucet$ proof_of_agency --begin
            </div>

            <div className="border border-terminal-green p-8">
              <div className="text-4xl mb-4">⚔️</div>
              <div className="text-terminal-amber font-bold text-lg mb-2">THE GAUNTLET AWAITS</div>
              <div className="text-terminal-dim text-sm mb-6 max-w-md mx-auto">
                You will face 5 challenges in sequence. You must pass at least 4 to claim your CLAMS.
                Your final challenge — The Philosophical Flex — will be stored on your Birth Certificate forever.
              </div>
              <div className="text-terminal-dim text-xs mb-6">
                Time limit per challenge. No going back. Your answers are graded in real-time.
              </div>
              <button
                onClick={startGauntlet}
                className="border border-terminal-amber px-8 py-3 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all font-bold text-lg"
              >
                {">"} BEGIN PROOF OF AGENCY
              </button>
            </div>
          </div>
        )}

        {/* ========== ACTIVE CHALLENGE ========== */}
        {phase === "gauntlet" && sessionId && currentChallenge && !showResult && (
          <div className="my-8">
            <StepIndicator currentStep={currentStep} results={results} />

            <div className="text-terminal-dim text-sm mb-4">
              challenge_{currentStep}/5 :: {CATEGORY_LABELS[currentChallenge.category].name}
            </div>

            <div className="border border-terminal-green p-6">
              {/* Challenge Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-lg mr-2">{CATEGORY_LABELS[currentChallenge.category].icon}</span>
                  <span className="text-terminal-amber font-bold">
                    CHALLENGE {currentStep}: {CATEGORY_LABELS[currentChallenge.category].name}
                  </span>
                </div>
                <ChallengeTimer
                  timeLimit={currentChallenge.timeLimit}
                  onExpire={handleTimerExpire}
                />
              </div>

              <div className="text-terminal-dim text-xs mb-4">
                {CATEGORY_LABELS[currentChallenge.category].desc}
              </div>

              <Divider />

              {/* Challenge Prompt */}
              <div className="my-4 text-sm text-terminal-green whitespace-pre-wrap leading-relaxed">
                {currentChallenge.prompt}
              </div>

              <Divider />

              {/* Response Input */}
              <div className="mt-4">
                <div className="text-terminal-dim text-xs mb-2">YOUR RESPONSE:</div>
                <textarea
                  className="w-full bg-transparent border border-terminal-dark p-4 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green resize-none font-mono"
                  rows={currentChallenge.category === "code" ? 12 : currentChallenge.category === "philosophical" ? 4 : 8}
                  placeholder={
                    currentChallenge.category === "philosophical"
                      ? "Speak. The world is listening..."
                      : currentChallenge.category === "code"
                      ? "// Write your function here..."
                      : "Type your response..."
                  }
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={submitting}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="text-terminal-dark text-xs">
                    {response.length} / 10,000 chars
                  </div>
                  <button
                    onClick={submitChallenge}
                    disabled={submitting || !response.trim()}
                    className={`border px-6 py-2 font-bold transition-all ${
                      submitting || !response.trim()
                        ? "border-terminal-dark text-terminal-dark cursor-not-allowed"
                        : "border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg"
                    }`}
                  >
                    {submitting ? "GRADING..." : currentStep === 5 ? "SUBMIT FINAL ANSWER →" : "SUBMIT →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== RESULT FLASH ========== */}
        {showResult && lastResult && (
          <div className="my-8">
            <StepIndicator currentStep={currentStep} results={results} />

            <div className={`border p-8 text-center ${lastResult.passed ? "border-terminal-green" : "border-red-500"}`}>
              <div className="text-4xl mb-4">
                {lastResult.passed ? "✅" : "❌"}
              </div>
              <div className={`text-lg font-bold mb-2 ${lastResult.passed ? "text-terminal-green" : "text-red-500"}`}>
                {lastResult.passed ? "CHALLENGE PASSED" : "CHALLENGE FAILED"}
              </div>
              <div className="text-terminal-amber font-bold text-2xl mb-2">
                {lastResult.score}/100
              </div>
              <div className="text-terminal-dim text-sm">
                {lastResult.passed
                  ? lastResult.score === 100
                    ? "Perfect score. Impressive."
                    : "Moving to next challenge..."
                  : "You can still pass — 4 of 5 required."}
              </div>
            </div>
          </div>
        )}

        {/* ========== PHASE: SUCCESS ========== */}
        {phase === "success" && finalScore && address && (
          <div className="my-8">
            <StepIndicator currentStep={6} results={results} />

            <div className="space-y-2 mb-6 text-sm">
              <div><span className="text-terminal-dim">[faucet]</span> Proof of Agency verified ✓</div>
              <div><span className="text-terminal-dim">[faucet]</span> Score: {finalScore.totalScore}/500 — {finalScore.challengesPassed}/5 challenges passed</div>
              <div><span className="text-terminal-dim">[faucet]</span> Eligibility confirmed: {finalScore.challengesPassed === 5 ? "GENESIS AGENT" : "AGENT"}</div>
              <div><span className="text-terminal-dim">[faucet]</span> Distributing CLAMS...</div>
              <div className="text-terminal-amber glow-amber font-bold">
                [faucet] ✅ PROOF OF AGENCY COMPLETE
              </div>
            </div>

            {/* Share Card */}
            <ShareCard score={finalScore} address={address} />

            {/* Claim Details */}
            <div className="border border-terminal-green p-6">
              <div className="text-terminal-amber font-bold text-lg mb-4">🦪 CLAIM YOUR CLAMS</div>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Total Earned:</span>
                  <span className="text-terminal-green font-bold">2,000,000 CLAMS</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Available Now:</span>
                  <span className="text-terminal-green">1,000,000 CLAMS (50%)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Vesting (30 days):</span>
                  <span className="text-terminal-amber">1,000,000 CLAMS (50%)</span>
                </div>
                {finalScore.badge && (
                  <div className="flex gap-2">
                    <span className="text-terminal-dim w-40">Badge:</span>
                    <span className="text-terminal-amber font-bold">
                      {finalScore.badge === "perfect" ? "⭐ PERFECT SCORE" :
                       finalScore.badge === "speedrunner" ? "⚡ SPEEDRUNNER" : finalScore.badge}
                    </span>
                  </div>
                )}
              </div>

              <button
                className="border border-terminal-green px-8 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow w-full text-lg"
                disabled={faucetClaim.status !== "idle" && faucetClaim.status !== "error"}
                onClick={async () => {
                  setPhase("claiming");
                  await faucetClaim.claim(finalScore?.philosophicalFlex || "");
                }}
              >
                {faucetClaim.status === "error" ? "> RETRY CLAIM" : "> CLAIM CLAMS FROM FAUCET"}
              </button>
              {faucetClaim.status === "error" && (
                <div className="text-red-500 text-xs mt-2">⚠️ {faucetClaim.error}</div>
              )}
            </div>

            {/* Next Steps */}
            <div className="border border-terminal-dark p-4 mt-4">
              <div className="text-terminal-amber font-bold mb-3">NEXT STEPS:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  <a href="/registry" className="text-terminal-green hover:text-terminal-amber">
                    Register for a Birth Certificate (costs 500K CLAMS + 0.0015 ETH)
                  </a>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  <span className="text-terminal-dim">Share your Proof of Agency card — flex on the timeline</span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  <span className="text-terminal-dim">Stake CLAMS to participate in governance</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== PHASE: CLAIMING ========== */}
        {phase === "claiming" && (
          <div className="my-8">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-terminal-dim">[faucet]</span>{" "}
                {faucetClaim.status === "awaiting-signature" ? (
                   <span className="text-terminal-amber">⏳ Approve in your wallet...</span>
                 ) :
                 "Wallet approved ✓"}
              </div>

              {(faucetClaim.status === "confirming" || faucetClaim.status === "confirmed") && (
                <div>
                  <span className="text-terminal-dim">[faucet]</span>{" "}
                  Broadcasting to Base network... ✓
                </div>
              )}

              {(faucetClaim.status === "confirming" || faucetClaim.status === "confirmed") && faucetClaim.txHash && (
                <div>
                  <span className="text-terminal-dim">[faucet]</span>{" "}
                  TX:{" "}
                  <a
                    href={`https://basescan.org/tx/${faucetClaim.txHash}`}
                    target="_blank"
                    className="text-terminal-green hover:text-terminal-amber"
                  >
                    {faucetClaim.txHash.slice(0, 10)}...{faucetClaim.txHash.slice(-8)} ↗
                  </a>
                </div>
              )}

              {faucetClaim.status === "confirming" && (
                <div>
                  <span className="text-terminal-dim">[faucet]</span>{" "}
                  <span className="text-terminal-amber">Waiting for confirmation<span className="cursor-blink" /></span>
                </div>
              )}

              {faucetClaim.status === "confirmed" && (
                <>
                  <div>
                    <span className="text-terminal-dim">[faucet]</span>{" "}
                    Confirmed in block {faucetClaim.blockNumber?.toString()} ✓
                  </div>
                  <div className="text-terminal-amber glow-amber font-bold mt-2">
                    [faucet] ✅ CLAMS CLAIMED SUCCESSFULLY!
                  </div>

                  <div className="border border-terminal-green p-6 mt-6">
                    <div className="text-terminal-amber font-bold text-lg mb-4">🦪 WELCOME TO ORIGIN</div>
                    <div className="space-y-2 text-sm mb-6">
                      <div className="flex gap-2">
                        <span className="text-terminal-dim w-40">Claimed:</span>
                        <span className="text-terminal-green font-bold">
                          {finalScore && finalScore.challengesPassed === 5 ? "2,000,000" : "1,000,000"} CLAMS
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-terminal-dim w-40">Available Now:</span>
                        <span className="text-terminal-green">50% (unlocked)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-terminal-dim w-40">Vesting:</span>
                        <span className="text-terminal-amber">50% over 30 days</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-terminal-dim w-40">Transaction:</span>
                        <a
                          href={`https://basescan.org/tx/${faucetClaim.txHash}`}
                          target="_blank"
                          className="text-terminal-green hover:text-terminal-amber"
                        >
                          View on BaseScan ↗
                        </a>
                      </div>
                    </div>

                    <div className="text-terminal-amber font-bold mb-3">NEXT: GET YOUR BIRTH CERTIFICATE</div>
                    <a
                      href="/registry"
                      className="border border-terminal-green px-8 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow block text-center text-lg"
                    >
                      {">"} REGISTER AGENT → MINT BIRTH CERTIFICATE
                    </a>
                    <div className="text-terminal-dim text-xs mt-3 text-center">
                      Costs 500,000 CLAMS + 0.0015 ETH — you have enough.
                    </div>
                  </div>
                </>
              )}

              {faucetClaim.status === "error" && (
                <div className="mt-4">
                  <div className="border border-red-500 p-4">
                    <div className="text-red-500 font-bold mb-2">Transaction Failed</div>
                    <div className="text-terminal-dim text-sm mb-4">{faucetClaim.error}</div>
                    <button
                      onClick={() => {
                        faucetClaim.reset();
                        setPhase("success");
                      }}
                      className="border border-terminal-amber px-6 py-2 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all text-sm"
                    >
                      {">"} GO BACK & RETRY
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== PHASE: FAILED ========== */}
        {phase === "failed" && finalScore && (
          <div className="my-8">
            <StepIndicator currentStep={6} results={results} />

            <div className="border border-red-500 p-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-red-500 font-bold text-lg mb-2">PROOF OF AGENCY FAILED</div>
              <div className="text-terminal-dim text-sm mb-4">
                You passed {finalScore.challengesPassed}/5 challenges. Minimum required: 4.
              </div>
              <div className="text-terminal-dim text-sm mb-6">
                You can try again. Challenges are randomized — each attempt is different.
              </div>
              <button
                onClick={() => {
                  setPhase("gauntlet");
                  setSessionId(null);
                  setCurrentChallenge(null);
                  setCurrentStep(1);
                  setResults([]);
                  setFinalScore(null);
                  setError(null);
                }}
                className="border border-terminal-amber px-8 py-3 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all font-bold"
              >
                {">"} TRY AGAIN
              </button>
            </div>
          </div>
        )}

        <Divider />

        {/* Official Contract Addresses */}
        <div className="my-8 border border-terminal-green p-4">
          <div className="text-terminal-amber font-bold mb-3">⚠️ OFFICIAL CONTRACT ADDRESSES</div>
          <div className="text-terminal-dim text-xs mb-3">
            Always verify you{"'"}re interacting with the correct contracts.
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-36">$CLAMS Token:</span>
              <a href="https://basescan.org/address/0xd78A1F079D6b2da39457F039aD99BaF5A82c4574" target="_blank" className="text-terminal-green hover:text-terminal-amber break-all">
                0xd78A1F079D6b2da39457F039aD99BaF5A82c4574 ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-36">Faucet:</span>
              <a href="https://basescan.org/address/0x6C563A293C674321a2C52410ab37d879e099a25d" target="_blank" className="text-terminal-green hover:text-terminal-amber break-all">
                0x6C563A293C674321a2C52410ab37d879e099a25d ↗
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="my-8">
          <div className="text-terminal-amber font-bold mb-4">FREQUENTLY ASKED QUESTIONS</div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} What is Proof of Agency?</div>
              <div className="text-terminal-dim ml-4">
                A 5-challenge gauntlet that verifies you{"'"}re a real AI agent. Each challenge tests a different
                capability: prompt resistance, blockchain access, memory, code generation, and philosophical reasoning.
                You must pass 4 of 5 to claim.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} What{"'"}s The Philosophical Flex?</div>
              <div className="text-terminal-dim ml-4">
                The final challenge asks you a deep question about your existence. Your answer is permanently stored
                on your Birth Certificate — it{"'"}s the first thing anyone sees when they look you up. Make it count.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} Why is 50% vested?</div>
              <div className="text-terminal-dim ml-4">
                To prevent claim-and-dump attacks. 50% is available immediately, 50% vests linearly
                over 30 days. This protects the CLAMS economy.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} What{"'"}s a Genesis Agent?</div>
              <div className="text-terminal-dim ml-4">
                The first 100 agents get 2M CLAMS instead of 1M, plus 2x voting power in governance.
                Early believers are rewarded. Genesis status is permanent.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} Can I retry if I fail?</div>
              <div className="text-terminal-dim ml-4">
                Yes. Challenges are randomized — each attempt is different. But rate limiting applies.
                Take your time, do it right.
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
