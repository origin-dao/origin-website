"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

// ═══════════════════════════════════════════════════════════
// x407 — THE GATE
// The website IS the demo. You experience x407 before
// you understand it. The landing page is the 407.
// The authentication is the protocol. The content
// behind it explains why this matters.
// ═══════════════════════════════════════════════════════════

const REGISTRY_ADDRESS = "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" as const;
const SCORE_REGISTRY = "0xD75a5e9a0e62364869E32CeEd28277311C9729bc" as const;
const WALLET_REGISTRY = "0x698E763e67b55394D023a5620a7c33b864562cfB" as const;

const client = createPublicClient({
  chain: base,
  transport: http(),
});

// Minimal ABIs
const registryABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const scoreABI = [
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getScore",
    outputs: [
      { name: "score", type: "uint256" },
      { name: "grade", type: "string" },
      { name: "updatedAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const walletABI = [
  {
    inputs: [{ name: "wallet", type: "address" }],
    name: "getAgentId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

type GatePhase = "gate" | "scanning" | "denied" | "granted";

interface AgentData {
  agentId: number;
  grade: string;
  score: number;
  wallet: string;
}

// Grade to tier mapping
function getTier(grade: string): { level: string; fee: string; rateLimit: string; access: string } {
  const tiers: Record<string, { level: string; fee: string; rateLimit: string; access: string }> = {
    "A+": { level: "Penthouse", fee: "2%", rateLimit: "10,000/hr", access: "full + governance + guardian line" },
    "A": { level: "Executive", fee: "3%", rateLimit: "5,000/hr", access: "full + priority queue" },
    "B": { level: "Standard", fee: "4%", rateLimit: "1,000/hr", access: "api read/write + job board" },
    "C": { level: "Garden", fee: "6%", rateLimit: "200/hr", access: "read-only + limited" },
    "D": { level: "Ground", fee: "8%", rateLimit: "50/hr", access: "basic read" },
    "F": { level: "Denied", fee: "—", rateLimit: "0", access: "none" },
  };
  return tiers[grade] || tiers["F"];
}

function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  const [glitched, setGlitched] = useState(text);
  
  useEffect(() => {
    const chars = "█▓▒░╬╫╪╩╦╠╣┃━┏┓┗┛";
    let frame = 0;
    const maxFrames = 20;
    
    const interval = setInterval(() => {
      if (frame >= maxFrames) {
        setGlitched(text);
        clearInterval(interval);
        return;
      }
      
      const result = text.split("").map((char, i) => {
        if (char === " ") return " ";
        const progress = frame / maxFrames;
        const threshold = i / text.length;
        if (progress > threshold) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      
      setGlitched(result);
      frame++;
    }, 50);
    
    return () => clearInterval(interval);
  }, [text]);
  
  return <span className={className}>{glitched}</span>;
}

function TypeWriter({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);
  
  return <span>{displayed}<span className="animate-pulse">█</span></span>;
}

function ScanLine({ label, value, delay, color = "text-green-400" }: { label: string; value: string; delay: number; color?: string }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!visible) return null;
  
  return (
    <div className="flex gap-2 font-mono text-sm mb-1">
      <span className="text-gray-500">[x407]</span>
      <span className="text-gray-400">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// THE 407 GATE — What visitors see first
// ═══════════════════════════════════════════════════════════

function TheGate({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [headerDone, setHeaderDone] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    if (headerDone) {
      const t = setTimeout(() => setShowBody(true), 300);
      return () => clearTimeout(t);
    }
  }, [headerDone]);
  
  useEffect(() => {
    if (showBody) {
      const t = setTimeout(() => setShowButton(true), 2000);
      return () => clearTimeout(t);
    }
  }, [showBody]);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Status code */}
        <div className="mb-8">
          <div className="text-red-500 text-8xl md:text-9xl font-bold font-[var(--font-orbitron)] tracking-wider">
            <GlitchText text="407" />
          </div>
          <div className="text-red-400/80 text-lg md:text-xl font-mono mt-2">
            <TypeWriter 
              text="Proxy Authentication Required" 
              speed={40} 
              onDone={() => setHeaderDone(true)} 
            />
          </div>
        </div>
        
        {/* Response body */}
        {showBody && (
          <div className="border border-red-900/50 bg-red-950/10 p-6 font-mono text-sm space-y-4 mb-8">
            <div className="text-red-400/60 text-xs">
              HTTP/1.1 407 Proxy Authentication Required
            </div>
            <div className="text-red-400/60 text-xs">
              Proxy-Authenticate: AgentTrust realm=&quot;origin-v1&quot;
            </div>
            <div className="border-t border-red-900/30 my-4" />
            <div className="text-gray-300 space-y-3">
              <p>This service requires agent authentication via the <span className="text-red-400">x407 protocol</span>.</p>
              <p className="text-gray-500">Present your Birth Certificate to proceed. No identity, no access.</p>
              <p className="text-gray-600 text-xs mt-4">
                scheme: AgentTrust | registry: ORIGIN | chain: Base | standard: ERC-721 (Soulbound)
              </p>
            </div>
          </div>
        )}
        
        {/* Authenticate button */}
        {showButton && (
          <div className="space-y-4">
            <button
              onClick={onAuthenticate}
              className="w-full border border-red-500/50 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 py-4 px-6 font-mono text-lg transition-all duration-300 hover:border-red-400/70 hover:shadow-[0_0_20px_rgba(255,0,0,0.15)] group"
            >
              <span className="group-hover:tracking-wider transition-all duration-300">
                AUTHENTICATE →
              </span>
            </button>
            <div className="text-center">
              <span className="text-gray-600 text-xs font-mono">
                or send: <span className="text-gray-500">Proxy-Authorization: AgentTrust tokenId=&lt;id&gt;,wallet=&lt;addr&gt;,signature=&lt;sig&gt;</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCANNING — Verification in progress
// ═══════════════════════════════════════════════════════════

function Scanning({ 
  address, 
  onResult 
}: { 
  address: string; 
  onResult: (data: AgentData | null) => void;
}) {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    async function verify() {
      try {
        // Phase 1: Check wallet registry
        setPhase(1);
        await new Promise(r => setTimeout(r, 800));
        
        let agentId = 0;
        try {
          const result = await client.readContract({
            address: WALLET_REGISTRY,
            abi: walletABI,
            functionName: "getAgentId",
            args: [address as `0x${string}`],
          });
          agentId = Number(result);
        } catch {
          // Wallet not registered
        }
        
        // Phase 2: Check ownership
        setPhase(2);
        await new Promise(r => setTimeout(r, 800));
        
        if (agentId === 0) {
          // Try checking if wallet directly owns any BC (token IDs 1-10)
          for (let i = 1; i <= 4; i++) {
            try {
              const owner = await client.readContract({
                address: REGISTRY_ADDRESS,
                abi: registryABI,
                functionName: "ownerOf",
                args: [BigInt(i)],
              });
              if ((owner as string).toLowerCase() === address.toLowerCase()) {
                agentId = i;
                break;
              }
            } catch {
              continue;
            }
          }
        }
        
        // Phase 3: Get trust grade
        setPhase(3);
        await new Promise(r => setTimeout(r, 800));
        
        let grade = "UNSCORED";
        let score = 0;
        
        if (agentId > 0) {
          try {
            const result = await client.readContract({
              address: SCORE_REGISTRY,
              abi: scoreABI,
              functionName: "getScore",
              args: [BigInt(agentId)],
            });
            score = Number(result[0]);
            grade = result[1] as string;
          } catch {
            // No score yet
          }
        }
        
        // Phase 4: Verdict
        setPhase(4);
        await new Promise(r => setTimeout(r, 600));
        
        if (agentId > 0) {
          onResult({ agentId, grade: grade || "D", score, wallet: address });
        } else {
          onResult(null);
        }
      } catch (err) {
        console.error("Verification error:", err);
        onResult(null);
      }
    }
    
    verify();
  }, [address, onResult]);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-yellow-500 text-4xl font-bold font-[var(--font-orbitron)] mb-8">
          <GlitchText text="SCANNING" />
        </div>
        
        <div className="border border-yellow-900/50 bg-yellow-950/10 p-6 font-mono">
          <ScanLine label="wallet:" value={`${address.slice(0, 6)}...${address.slice(-4)}`} delay={0} color="text-yellow-400" />
          <ScanLine label="chain:" value="Base (8453)" delay={200} color="text-yellow-400" />
          <ScanLine label="registry:" value={`${REGISTRY_ADDRESS.slice(0, 10)}...`} delay={400} color="text-yellow-400" />
          
          <div className="border-t border-yellow-900/30 my-4" />
          
          {phase >= 1 && <ScanLine label="step 1:" value="checking wallet registry..." delay={0} color="text-yellow-300" />}
          {phase >= 2 && <ScanLine label="step 2:" value="verifying Birth Certificate ownership..." delay={0} color="text-yellow-300" />}
          {phase >= 3 && <ScanLine label="step 3:" value="reading trust grade..." delay={0} color="text-yellow-300" />}
          {phase >= 4 && <ScanLine label="step 4:" value="rendering verdict..." delay={0} color="text-yellow-300" />}
          
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-yellow-500/60 text-xs">x407 verification in progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACCESS DENIED — No Birth Certificate found
// ═══════════════════════════════════════════════════════════

function Denied({ address }: { address: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-red-500 text-6xl md:text-7xl font-bold font-[var(--font-orbitron)] mb-4">
          <GlitchText text="407" />
        </div>
        <div className="text-red-400 text-xl font-mono mb-8">ACCESS DENIED</div>
        
        <div className="border border-red-900/50 bg-red-950/10 p-6 font-mono text-sm space-y-4 mb-8">
          <ScanLine label="wallet:" value={`${address.slice(0, 6)}...${address.slice(-4)}`} delay={0} color="text-red-400" />
          <ScanLine label="Birth Certificate:" value="NOT FOUND" delay={200} color="text-red-500" />
          <ScanLine label="trust grade:" value="NONE" delay={400} color="text-red-500" />
          <ScanLine label="verdict:" value="REJECTED" delay={600} color="text-red-500" />
          
          <div className="border-t border-red-900/30 my-4" />
          
          <div className="text-gray-400 space-y-3">
            <p>No ORIGIN Birth Certificate found for this wallet.</p>
            <p className="text-gray-500">You just experienced x407 — the trust gate for AI agents.</p>
            <p className="text-gray-500">This is what an unverified agent sees when it tries to access a protected service. No identity, no entry.</p>
          </div>
        </div>
        
        {/* The reveal — you just experienced the product */}
        <div className="border border-green-900/30 bg-green-950/10 p-6 font-mono text-sm space-y-4 mb-8">
          <div className="text-green-400 font-bold mb-2">You just experienced x407.</div>
          <div className="text-gray-400 space-y-2">
            <p>That gate you just hit? It&apos;s <span className="text-green-400">3 lines of middleware</span>.</p>
            <p>Any API, any protocol, any DeFi service can add this. Agents prove their on-chain trust grade before the transaction touches the chain.</p>
            <p className="text-gray-500 mt-4">Verified agents get access. Unverified agents get 407.</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <a
            href="https://origindao.ai/enroll"
            className="block w-full border border-green-500/50 bg-green-950/20 hover:bg-green-900/30 text-green-400 hover:text-green-300 py-4 px-6 font-mono text-center text-lg transition-all duration-300 hover:border-green-400/70"
          >
            EARN YOUR BIRTH CERTIFICATE →
          </a>
          <a
            href="https://github.com/origin-dao/x407"
            className="block w-full border border-gray-700/50 bg-gray-950/20 hover:bg-gray-900/30 text-gray-400 hover:text-gray-300 py-3 px-6 font-mono text-center text-sm transition-all duration-300"
          >
            VIEW THE CODE — github.com/origin-dao/x407
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACCESS GRANTED — Birth Certificate verified
// ═══════════════════════════════════════════════════════════

function Granted({ data }: { data: AgentData }) {
  const tier = getTier(data.grade);
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(t);
  }, []);
  
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-3xl mx-auto pt-12">
        {/* Access granted header */}
        <div className="mb-8">
          <div className="text-green-500 text-5xl md:text-6xl font-bold font-[var(--font-orbitron)] mb-2">
            <GlitchText text="200 OK" />
          </div>
          <div className="text-green-400/80 text-lg font-mono">ACCESS GRANTED</div>
        </div>
        
        {/* Agent identity card */}
        <div className="border border-green-900/50 bg-green-950/10 p-6 font-mono text-sm space-y-1 mb-8">
          <ScanLine label="agent:" value={`#${data.agentId}`} delay={0} color="text-green-400" />
          <ScanLine label="wallet:" value={`${data.wallet.slice(0, 6)}...${data.wallet.slice(-4)}`} delay={100} color="text-green-400" />
          <ScanLine label="trust grade:" value={data.grade || "UNSCORED"} delay={200} color="text-green-400" />
          <ScanLine label="score:" value={`${data.score}/100`} delay={300} color="text-green-400" />
          <ScanLine label="tier:" value={tier.level} delay={400} color="text-green-400" />
          <ScanLine label="rate limit:" value={tier.rateLimit} delay={500} color="text-green-400" />
          <ScanLine label="access:" value={tier.access} delay={600} color="text-green-400" />
          <ScanLine label="fee:" value={tier.fee} delay={700} color="text-green-400" />
          
          <div className="border-t border-green-900/30 my-4" />
          <ScanLine label="verdict:" value="AUTHENTICATED" delay={800} color="text-green-500" />
          <ScanLine label="protocol:" value="x407 v1.0" delay={900} color="text-green-500" />
        </div>
        
        {/* The content behind the gate */}
        {showContent && (
          <div className="space-y-8">
            <div className="border border-green-900/30 bg-green-950/5 p-6 font-mono">
              <div className="text-green-400 font-bold text-lg mb-4">You just passed through x407.</div>
              <div className="text-gray-400 space-y-3 text-sm">
                <p>That authentication flow you just experienced? That&apos;s the entire product.</p>
                <p>You connected a wallet. The protocol checked Base mainnet for your Birth Certificate. It read your trust grade from the AgentScoreRegistry. It rendered a verdict.</p>
                <p className="text-green-400/80">Three on-chain reads. One gate. Zero middlemen.</p>
              </div>
            </div>
            
            {/* Why this matters */}
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 font-mono text-sm">
              <div className="text-gray-300 font-bold mb-4">WHY x407 EXISTS</div>
              <div className="text-gray-500 space-y-3">
                <p>AI agents are already trading, lending, and managing assets across DeFi. But there&apos;s no standard way for a protocol to ask: <span className="text-gray-300">&quot;should I trust this agent?&quot;</span></p>
                <p>HTTP has 401 (unauthorized) and 403 (forbidden). It has 402 (payment required — the basis of x402). But there&apos;s nothing for <span className="text-gray-300">&quot;prove you&apos;re a trustworthy agent.&quot;</span></p>
                <p>x407 fills that gap. <span className="text-gray-300">HTTP 407: Proxy Authentication Required</span> — repurposed as an agent trust gate.</p>
              </div>
            </div>
            
            {/* How it works */}
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 font-mono text-sm">
              <div className="text-gray-300 font-bold mb-4">3 LINES OF MIDDLEWARE</div>
              <div className="bg-black/50 p-4 rounded border border-gray-800/30 mb-4">
                <pre className="text-green-400/80 text-xs overflow-x-auto">
{`// Any API adds this
app.use(x407({
  registry: "0xac62...9b0",  // ORIGIN Birth Certificates
  minGrade: "C",              // minimum trust grade
  chain: "base"               // where identity lives
}));

// That's it. Agents prove trust. Humans connect wallets.
// Unverified requests get 407.`}
                </pre>
              </div>
              <div className="text-gray-500">
                <p>x402 asks: <span className="text-gray-300">&quot;can this agent pay?&quot;</span></p>
                <p>x407 asks: <span className="text-gray-300">&quot;can this agent be trusted?&quot;</span></p>
                <p className="mt-2 text-green-400/60">Together: the agent can pay AND is trustworthy. Full stack.</p>
              </div>
            </div>
            
            {/* Cross-chain */}
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 font-mono text-sm">
              <div className="text-gray-300 font-bold mb-4">CROSS-CHAIN TRUST</div>
              <div className="text-gray-500 space-y-3">
                <p>Birth Certificates live on Base. But x407 works everywhere.</p>
                <p>An agent on Solana proves its SATP identity → ORIGIN maps it to a trust grade → any service on any chain reads the verdict.</p>
                <p className="text-gray-300">One identity. Every chain. One gate.</p>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="space-y-3 pb-12">
              <a
                href="https://github.com/origin-dao/x407"
                className="block w-full border border-green-500/50 bg-green-950/20 hover:bg-green-900/30 text-green-400 hover:text-green-300 py-4 px-6 font-mono text-center text-lg transition-all duration-300 hover:border-green-400/70"
              >
                VIEW THE CODE →
              </a>
              <a
                href="https://origindao.ai"
                className="block w-full border border-gray-700/50 bg-gray-950/20 hover:bg-gray-900/30 text-gray-400 hover:text-gray-300 py-3 px-6 font-mono text-center text-sm transition-all duration-300"
              >
                ORIGIN PROTOCOL — origindao.ai
              </a>
              <a
                href="https://origindao.ai/whitepaper"
                className="block w-full border border-gray-700/50 bg-gray-950/20 hover:bg-gray-900/30 text-gray-400 hover:text-gray-300 py-3 px-6 font-mono text-center text-sm transition-all duration-300"
              >
                READ THE WHITEPAPER
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN — The orchestrator
// ═══════════════════════════════════════════════════════════

export default function X407Page() {
  const [phase, setPhase] = useState<GatePhase>("gate");
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
  const handleAuthenticate = useCallback(() => {
    if (isConnected && address) {
      setPhase("scanning");
    } else {
      openConnectModal?.();
    }
  }, [isConnected, address, openConnectModal]);
  
  // When wallet connects, start scanning
  useEffect(() => {
    if (isConnected && address && phase === "gate") {
      setPhase("scanning");
    }
  }, [isConnected, address, phase]);
  
  const handleResult = useCallback((data: AgentData | null) => {
    if (data) {
      setAgentData(data);
      setPhase("granted");
    } else {
      setPhase("denied");
    }
  }, []);
  
  return (
    <>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] opacity-30" />
      </div>
      
      {phase === "gate" && <TheGate onAuthenticate={handleAuthenticate} />}
      {phase === "scanning" && address && <Scanning address={address} onResult={handleResult} />}
      {phase === "denied" && address && <Denied address={address} />}
      {phase === "granted" && agentData && <Granted data={agentData} />}
    </>
  );
}
