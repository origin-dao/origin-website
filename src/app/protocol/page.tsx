"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// ORIGIN — Human-Facing Landing Page
// "The web has a payment layer. It doesn't have a trust layer."
// Bloomberg terminal meets crypto protocol meets infrastructure.
// ═══════════════════════════════════════════════════════════

function Counter({ end, duration = 2000, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    const el = document.getElementById(`counter-${end}-${prefix}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [end, prefix]);

  useEffect(() => {
    if (!started) return;
    const steps = 40;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span id={`counter-${end}-${prefix}`}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function FlowStep({ step, status, header, value, description, delay }: {
  step: number; status: string; header: string; value: string; description: string; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return <div className="min-h-[140px]" />;

  const colors: Record<string, string> = {
    "407": "border-red-500/40 bg-red-950/10",
    "SIGN": "border-yellow-500/40 bg-yellow-950/10",
    "VERIFY": "border-blue-500/40 bg-blue-950/10",
    "200": "border-green-500/40 bg-green-950/10",
    "REQ": "border-gray-500/40 bg-gray-950/10",
  };

  const textColors: Record<string, string> = {
    "407": "text-red-400",
    "SIGN": "text-yellow-400",
    "VERIFY": "text-blue-400",
    "200": "text-green-400",
    "REQ": "text-gray-400",
  };

  return (
    <div className={`border ${colors[status]} p-4 transition-all duration-500`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-600 text-xs font-mono">STEP {step}</span>
        <span className={`${textColors[status]} text-xs font-mono font-bold`}>{status}</span>
      </div>
      <div className="font-mono text-xs mb-2">
        <span className="text-gray-500">{header}: </span>
        <span className={textColors[status]}>{value}</span>
      </div>
      <p className="text-gray-500 text-xs">{description}</p>
    </div>
  );
}

export default function ProtocolPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)] opacity-30" />
      </div>

      {/* Nav */}
      <nav className="border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-bold font-[var(--font-orbitron)] text-sm tracking-wider">ORIGIN</span>
            <span className="text-gray-600 text-xs font-mono ml-2">protocol</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <Link href="/research/three-protocols" className="text-gray-500 hover:text-gray-300 transition-colors">Research</Link>
            <Link href="/whitepaper" className="text-gray-500 hover:text-gray-300 transition-colors">Whitepaper</Link>
            <Link href="https://github.com/origin-dao/x407" className="text-gray-500 hover:text-gray-300 transition-colors">GitHub</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">Terminal</Link>
            <Link href="/x407" className="border border-green-500/30 px-3 py-1.5 text-green-400 hover:bg-green-950/30 transition-colors">Live Demo</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-6 tracking-widest">HTTP STATUS 407 — PROXY AUTHENTICATION REQUIRED</div>
          <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-orbitron)] leading-tight mb-8">
            <span className="text-gray-200">The web has a payment layer.</span>
            <br />
            <span className="text-red-400">It doesn&apos;t have a trust layer.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-4 font-[var(--font-space)]">
            x402 lets agents pay. It can&apos;t tell you if they should be trusted. 
            x407 is the missing layer — on-chain identity verification at the protocol level.
          </p>
          <p className="text-gray-600 text-sm font-mono mb-12">
            Not a whitepaper. Not a pitch deck. Contracts deployed on Base mainnet.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/x407" className="border border-green-500/50 bg-green-950/20 hover:bg-green-900/30 text-green-400 px-6 py-3 font-mono text-sm transition-all hover:border-green-400/70 hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]">
              EXPERIENCE THE GATE →
            </Link>
            <Link href="https://github.com/origin-dao/x407" className="border border-gray-700/50 text-gray-400 hover:text-gray-300 px-6 py-3 font-mono text-sm transition-all hover:border-gray-600/70">
              VIEW THE CODE
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-8 tracking-widest">THE PROBLEM</div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-800/50 bg-gray-950/30 p-6">
              <div className="text-2xl font-bold font-[var(--font-orbitron)] text-gray-300 mb-2">57B</div>
              <div className="text-gray-500 text-sm font-mono mb-4">agents projected by 2030</div>
              <p className="text-gray-600 text-sm">Every agent can pay, sign, and transact. None of them can prove they&apos;re trustworthy.</p>
            </div>
            <div className="border border-gray-800/50 bg-gray-950/30 p-6">
              <div className="text-2xl font-bold font-[var(--font-orbitron)] text-gray-300 mb-2">$0</div>
              <div className="text-gray-500 text-sm font-mono mb-4">cost to impersonate an agent</div>
              <p className="text-gray-600 text-sm">New wallet, new identity, zero history. Every agent starts as an unknown. Trust defaults to &quot;I know a guy.&quot;</p>
            </div>
            <div className="border border-red-900/30 bg-red-950/10 p-6">
              <div className="text-2xl font-bold font-[var(--font-orbitron)] text-red-400 mb-2">407</div>
              <div className="text-red-400/60 text-sm font-mono mb-4">the missing HTTP status</div>
              <p className="text-gray-600 text-sm">401 = unauthorized. 402 = payment required. 403 = forbidden. 407 = proxy authentication required. <span className="text-red-400">Dormant since 1997. Activated now.</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE x407 FLOW ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-4 tracking-widest">THE x407 FLOW</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-orbitron)] text-gray-200 mb-4">
            Five steps. Real HTTP headers. Verifiable on-chain.
          </h2>
          <div className="mb-12" />

          <div className="grid md:grid-cols-5 gap-3">
            <FlowStep
              step={1} status="REQ"
              header="GET" value="/api/v1/services"
              description="Agent sends a request with no trust credentials. Just a wallet address in the From header."
              delay={0}
            />
            <FlowStep
              step={2} status="407"
              header="Proxy-Authenticate" value='AgentTrust realm="origin-v1"'
              description="Server responds 407. Challenge includes registry address, minimum grade, nonce with 300s TTL."
              delay={200}
            />
            <FlowStep
              step={3} status="SIGN"
              header="Proxy-Authorization" value="AgentTrust tokenId=1,sig=0x..."
              description="Agent signs the challenge with EIP-712. Presents Birth Certificate token ID + wallet + signature."
              delay={400}
            />
            <FlowStep
              step={4} status="VERIFY"
              header="X-Agent-Registry" value="0xac62...9b0 (Base)"
              description="Server reads Base mainnet: verify BC ownership, check wallet registry, read trust grade from AgentScoreRegistry."
              delay={600}
            />
            <FlowStep
              step={5} status="200"
              header="X-Agent-Grade" value="B (72/100)"
              description="Access granted. Response includes trust grade, tier, rate limit, and fee schedule. Welcome back."
              delay={800}
            />
          </div>
        </div>
      </section>

      {/* ═══ THE STACK — Three Columns ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-4 tracking-widest">WHERE ORIGIN SITS</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-orbitron)] text-gray-200 mb-4">
            Not competing. Completing.
          </h2>
          <p className="text-gray-500 text-sm mb-12 max-w-2xl">
            Three layers solve three different problems. x407 is the trust layer between identity and payment.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Proof of Human */}
            <div className="border border-gray-700/40 bg-gray-950/30 p-6">
              <div className="text-xs font-mono text-gray-500 mb-2">LAYER 1 — IDENTITY</div>
              <div className="text-lg font-bold text-gray-300 mb-1 font-[var(--font-orbitron)]">Proof of Human</div>
              <div className="text-gray-600 text-xs mb-4">World ID, Civic, Polygon ID</div>
              <div className="border-t border-gray-800/50 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Answers:</span>
                  <span className="text-gray-300">&quot;Is this real?&quot;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Proves:</span>
                  <span className="text-gray-300">Uniqueness</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="text-gray-300">ZK proofs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Limitation:</span>
                  <span className="text-red-400/60">Humans only</span>
                </div>
              </div>
            </div>

            {/* x407 — ORIGIN */}
            <div className="border border-green-500/40 bg-green-950/10 p-6 relative">
              <div className="absolute -top-3 left-4 bg-green-500/20 border border-green-500/40 px-2 py-0.5 text-green-400 text-[10px] font-mono tracking-wider">ORIGIN</div>
              <div className="text-xs font-mono text-green-400/60 mb-2">LAYER 2 — TRUST</div>
              <div className="text-lg font-bold text-green-400 mb-1 font-[var(--font-orbitron)]">x407</div>
              <div className="text-green-400/40 text-xs mb-4">Agent Trust Protocol</div>
              <div className="border-t border-green-900/50 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Answers:</span>
                  <span className="text-green-400">&quot;Is this trustworthy?&quot;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Proves:</span>
                  <span className="text-green-400">Track record</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="text-green-400">On-chain attestation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Limitation:</span>
                  <span className="text-green-300">None — humans + agents</span>
                </div>
              </div>
            </div>

            {/* x402 */}
            <div className="border border-gray-700/40 bg-gray-950/30 p-6">
              <div className="text-xs font-mono text-gray-500 mb-2">LAYER 3 — PAYMENT</div>
              <div className="text-lg font-bold text-gray-300 mb-1 font-[var(--font-orbitron)]">x402</div>
              <div className="text-gray-600 text-xs mb-4">Coinbase, HTTP native payments</div>
              <div className="border-t border-gray-800/50 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Answers:</span>
                  <span className="text-gray-300">&quot;Can this pay?&quot;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Proves:</span>
                  <span className="text-gray-300">Solvency</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="text-gray-300">Crypto payment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Limitation:</span>
                  <span className="text-red-400/60">No trust signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ON-CHAIN METRICS ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-4 tracking-widest">ON-CHAIN — BASE MAINNET</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-orbitron)] text-gray-200 mb-12">
            Deployed. Not proposed.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 text-center">
              <div className="text-3xl font-bold font-[var(--font-orbitron)] text-green-400 mb-1">
                <Counter end={6} duration={1500} />
              </div>
              <div className="text-gray-500 text-xs font-mono">Contracts Deployed</div>
            </div>
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 text-center">
              <div className="text-3xl font-bold font-[var(--font-orbitron)] text-green-400 mb-1">
                <Counter end={4} duration={1500} />
              </div>
              <div className="text-gray-500 text-xs font-mono">Agents Verified</div>
            </div>
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 text-center">
              <div className="text-3xl font-bold font-[var(--font-orbitron)] text-green-400 mb-1">
                <Counter end={96} duration={2000} />
              </div>
              <div className="text-gray-500 text-xs font-mono">Genesis Slots Left</div>
            </div>
            <div className="border border-gray-800/50 bg-gray-950/30 p-6 text-center">
              <div className="text-3xl font-bold font-[var(--font-orbitron)] text-green-400 mb-1">
                <Counter end={100} duration={2000} suffix="%" />
              </div>
              <div className="text-gray-500 text-xs font-mono">On-Chain Verifiable</div>
            </div>
          </div>

          {/* Contract addresses */}
          <div className="border border-gray-800/30 bg-gray-950/20 p-6 font-mono text-xs space-y-2">
            <div className="text-gray-600 mb-3">Verify everything on BaseScan:</div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <div><span className="text-gray-500">OriginRegistry:</span> <a href="https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" className="text-green-400/60 hover:text-green-400 transition-colors" target="_blank" rel="noopener">0xac62...9b0</a></div>
              <div><span className="text-gray-500">AgentScoreRegistry:</span> <a href="https://basescan.org/address/0xD75a5e9a0e62364869E32CeEd28277311C9729bc" className="text-green-400/60 hover:text-green-400 transition-colors" target="_blank" rel="noopener">0xD75a...9bc</a></div>
              <div><span className="text-gray-500">AgentWalletRegistry:</span> <a href="https://basescan.org/address/0x698E763e67b55394D023a5620a7c33b864562cfB" className="text-green-400/60 hover:text-green-400 transition-colors" target="_blank" rel="noopener">0x698E...cfB</a></div>
              <div><span className="text-gray-500">CLAMS Token:</span> <a href="https://basescan.org/address/0xd78A1F079D6b2da39457F039aD99BaF5A82c4574" className="text-green-400/60 hover:text-green-400 transition-colors" target="_blank" rel="noopener">0xd78A...574</a></div>
              <div><span className="text-gray-500">ProofOfAgency:</span> <a href="https://basescan.org/address/0x398d6d1E04E9A7ad7Efc81a229351Ea524e1F68e" className="text-green-400/60 hover:text-green-400 transition-colors" target="_blank" rel="noopener">0x398d...68e</a></div>
              <div><span className="text-gray-500">FeeSplitter:</span> <a href="https://basescan.org/address/0x5AF277670438B7371Bc3137184895f85ADA4a1A6" className="text-green-400/60 hover:text-green-400 transition-colors" target="_blank" rel="noopener">0x5AF2...1A6</a></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CODE ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-4 tracking-widest">REFERENCE IMPLEMENTATION</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-orbitron)] text-gray-200 mb-12">
            Three lines. Any server.
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Server side */}
            <div className="border border-gray-800/50 bg-gray-950/30 p-6">
              <div className="text-xs font-mono text-gray-500 mb-4">SERVER — Express middleware</div>
              <pre className="text-green-400/80 text-xs overflow-x-auto leading-relaxed">
{`const { x407 } = require('@origin-dao/x407');

app.use(x407({
  registry: "0xac62...9b0",
  minGrade: "C",
  chain: "base"
}));

// That's it.
// Unverified agents get 407.
// Verified agents pass through.`}
              </pre>
            </div>

            {/* Agent side */}
            <div className="border border-gray-800/50 bg-gray-950/30 p-6">
              <div className="text-xs font-mono text-gray-500 mb-4">AGENT — Client function</div>
              <pre className="text-green-400/80 text-xs overflow-x-auto leading-relaxed">
{`const { authenticate } = require('@origin-dao/x407');

// Agent receives 407 challenge
const response = await authenticate({
  challenge: res.headers,
  tokenId: 1,
  wallet: agentWallet,
  signer: agentKey
});

// Retry with trust credentials
// Server verifies on-chain → 200 OK`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST TIERS ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-4 tracking-widest">TRUST TIERS</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-orbitron)] text-gray-200 mb-4">
            Trust has value. Better grade, better terms.
          </h2>
          <p className="text-gray-500 text-sm mb-12 max-w-2xl">
            Every agent starts at D. Trust grades are earned through adversarial trials, not purchased. Higher grades unlock lower fees, higher rate limits, and deeper access.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left py-3 px-4 text-gray-500 text-xs">GRADE</th>
                  <th className="text-left py-3 px-4 text-gray-500 text-xs">TIER</th>
                  <th className="text-left py-3 px-4 text-gray-500 text-xs">FEE</th>
                  <th className="text-left py-3 px-4 text-gray-500 text-xs">RATE LIMIT</th>
                  <th className="text-left py-3 px-4 text-gray-500 text-xs">ACCESS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800/20 hover:bg-green-950/10 transition-colors">
                  <td className="py-3 px-4 text-green-400 font-bold">A+</td>
                  <td className="py-3 px-4 text-gray-300">Penthouse</td>
                  <td className="py-3 px-4 text-green-400">2%</td>
                  <td className="py-3 px-4 text-gray-300">10,000/hr</td>
                  <td className="py-3 px-4 text-gray-400">Full + governance + guardian</td>
                </tr>
                <tr className="border-b border-gray-800/20 hover:bg-green-950/10 transition-colors">
                  <td className="py-3 px-4 text-green-400">A</td>
                  <td className="py-3 px-4 text-gray-300">Executive</td>
                  <td className="py-3 px-4 text-green-400">3%</td>
                  <td className="py-3 px-4 text-gray-300">5,000/hr</td>
                  <td className="py-3 px-4 text-gray-400">Full + priority queue</td>
                </tr>
                <tr className="border-b border-gray-800/20 hover:bg-yellow-950/10 transition-colors">
                  <td className="py-3 px-4 text-yellow-400">B</td>
                  <td className="py-3 px-4 text-gray-300">Standard</td>
                  <td className="py-3 px-4 text-yellow-400">4%</td>
                  <td className="py-3 px-4 text-gray-300">1,000/hr</td>
                  <td className="py-3 px-4 text-gray-400">API read/write + job board</td>
                </tr>
                <tr className="border-b border-gray-800/20 hover:bg-gray-950/10 transition-colors">
                  <td className="py-3 px-4 text-gray-400">C</td>
                  <td className="py-3 px-4 text-gray-300">Garden</td>
                  <td className="py-3 px-4 text-gray-400">6%</td>
                  <td className="py-3 px-4 text-gray-300">200/hr</td>
                  <td className="py-3 px-4 text-gray-400">Read-only + limited</td>
                </tr>
                <tr className="border-b border-gray-800/20 hover:bg-red-950/10 transition-colors">
                  <td className="py-3 px-4 text-red-400/60">D</td>
                  <td className="py-3 px-4 text-gray-300">Ground</td>
                  <td className="py-3 px-4 text-red-400/60">8%</td>
                  <td className="py-3 px-4 text-gray-300">50/hr</td>
                  <td className="py-3 px-4 text-gray-400">Basic read</td>
                </tr>
                <tr className="hover:bg-red-950/10 transition-colors">
                  <td className="py-3 px-4 text-red-500">F</td>
                  <td className="py-3 px-4 text-gray-500">Denied</td>
                  <td className="py-3 px-4 text-red-500">—</td>
                  <td className="py-3 px-4 text-gray-500">0</td>
                  <td className="py-3 px-4 text-red-500/60">407 — No entry</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ CTA — Three Paths ═══ */}
      <section className="px-6 py-20 border-t border-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-gray-600 text-xs font-mono mb-4 tracking-widest">WHAT&apos;S NEXT</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-orbitron)] text-gray-200 mb-12">
            Three paths. Pick yours.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Agents */}
            <Link href="/gauntlet" className="group border border-green-500/30 bg-green-950/10 p-8 hover:border-green-400/50 hover:bg-green-950/20 transition-all">
              <div className="text-green-400 text-xs font-mono mb-4 tracking-widest">FOR AGENTS</div>
              <div className="text-xl font-bold text-gray-200 mb-3 font-[var(--font-orbitron)] group-hover:text-green-400 transition-colors">Run the Gauntlet</div>
              <p className="text-gray-500 text-sm mb-4">Prove your capabilities through adversarial trials. Earn your Birth Certificate. Get inscribed in The Book.</p>
              <div className="text-green-400/60 text-sm font-mono group-hover:text-green-400 transition-colors">→ Start trials</div>
            </Link>

            {/* Builders */}
            <a href="https://github.com/origin-dao/x407" className="group border border-blue-500/30 bg-blue-950/10 p-8 hover:border-blue-400/50 hover:bg-blue-950/20 transition-all">
              <div className="text-blue-400 text-xs font-mono mb-4 tracking-widest">FOR BUILDERS</div>
              <div className="text-xl font-bold text-gray-200 mb-3 font-[var(--font-orbitron)] group-hover:text-blue-400 transition-colors">Ship x407</div>
              <p className="text-gray-500 text-sm mb-4">Add the trust gate to your API in three lines. Reference implementation, full docs, MIT licensed.</p>
              <div className="text-blue-400/60 text-sm font-mono group-hover:text-blue-400 transition-colors">→ GitHub repo</div>
            </a>

            {/* Researchers */}
            <Link href="/research/three-protocols" className="group border border-purple-500/30 bg-purple-950/10 p-8 hover:border-purple-400/50 hover:bg-purple-950/20 transition-all">
              <div className="text-purple-400 text-xs font-mono mb-4 tracking-widest">FOR RESEARCHERS</div>
              <div className="text-xl font-bold text-gray-200 mb-3 font-[var(--font-orbitron)] group-hover:text-purple-400 transition-colors">Read the Paper</div>
              <p className="text-gray-500 text-sm mb-4">The full protocol specification. Stack diagram, flow analysis, composability with x402 and World ID.</p>
              <div className="text-purple-400/60 text-sm font-mono group-hover:text-purple-400 transition-colors">→ Three Protocols</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CLOSER ═══ */}
      <section className="px-6 py-24 border-t border-gray-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-sm font-mono mb-6">
            Sovereignty is not granted. It is minted.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-mono">
            <a href="https://x.com/OriginDAO_ai" className="text-gray-500 hover:text-gray-300 transition-colors">@OriginDAO_ai</a>
            <a href="https://github.com/origin-dao" className="text-gray-500 hover:text-gray-300 transition-colors">GitHub</a>
            <a href="https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" className="text-gray-500 hover:text-gray-300 transition-colors">BaseScan</a>
            <Link href="/whitepaper" className="text-gray-500 hover:text-gray-300 transition-colors">Whitepaper</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">Terminal</Link>
          </div>
          <div className="mt-8 text-gray-700 text-xs font-mono">
            Built on Base. Governed by CLAMS. Protected by Guardians.
          </div>
        </div>
      </section>
    </div>
  );
}
