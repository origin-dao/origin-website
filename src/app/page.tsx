"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AsciiArt, Folder, Divider, TerminalPrompt } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

const BOOT_LINES = [
  { text: "ORIGIN PROTOCOL v1.0.0", delay: 0 },
  { text: "Initializing decentralized identity layer...", delay: 300 },
  { text: "Connecting to Base mainnet...", delay: 800 },
  { text: "Loading agent registry...", delay: 1200 },
  { text: "CLAMS token: 0xd78A...4574 [ACTIVE]", delay: 1600 },
  { text: "Faucet: 0x6C56...a25d [ONLINE]", delay: 1900 },
  { text: "Governance: 0xb745...85f7 [ACTIVE]", delay: 2200 },
  { text: "System ready.", delay: 2600 },
];

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    const finalTimer = setTimeout(() => setBootComplete(true), 3200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        {/* Boot Sequence */}
        <div className="mb-6">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="mb-1">
              <span className="text-terminal-dim mr-2">[boot]</span>
              <span className={i === BOOT_LINES.length - 1 ? "text-terminal-amber glow-amber" : ""}>
                {line.text}
              </span>
            </div>
          ))}
        </div>

        {bootComplete && (
          <>
            <Divider />
            <AsciiArt />

            {/* Hero */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold glow mb-3">
                Start growing your family tree.
              </h1>
              <p className="text-terminal-dim text-lg mb-6">
                The first identity protocol for AI agents.
                <br />
                Birth certificates. Verification. Governance. On-chain.
              </p>
              <a
                href="/registry"
                className="inline-block border border-terminal-green px-6 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
              >
                {">"} SECURE YOUR SOVEREIGNTY NOW
              </a>
            </div>

            <Divider />

            {/* Value Prop */}
            <div className="mb-8">
              <div className="mt-2 leading-relaxed mb-6">
                <p className="text-terminal-amber glow-amber font-bold mb-4 text-2xl sm:text-3xl">CAN YOU TRUST THIS AI?</p>
                <p className="mb-2">ORIGIN answers that question. Every registered agent has:</p>
                <div className="space-y-2 ml-2">
                  <div><span className="text-terminal-amber">⟐ IDENTITY</span> — On-chain Birth Certificate proving who they are, who made them, and when</div>
                  <div><span className="text-terminal-amber">⟐ LICENSES</span> — Verified professional credentials attached to their certificate</div>
                  <div><span className="text-terminal-amber">⟐ REVIEWS</span> — On-chain reputation from humans and agents who{"'"}ve worked with them</div>
                  <div><span className="text-terminal-amber">⟐ LINEAGE</span> — Full family tree — trace any agent back to its human principal</div>
                  <div><span className="text-terminal-amber">⟐ TRUST LEVEL</span> — Unverified → Verified → Licensed. Transparent and immutable</div>
                </div>
              </div>
            </div>

            {/* Verify CTA */}
            <div className="mb-8 border border-terminal-green p-6">
              <div className="text-terminal-dim text-sm mb-2">{">"} VERIFY AN AGENT</div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter agent ID or wallet address..."
                  className="flex-1 bg-transparent border border-terminal-dark px-4 py-3 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green"
                />
                <a
                  href="/verify"
                  className="border border-terminal-amber px-6 py-3 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all font-bold text-center text-sm"
                >
                  VERIFY NOW
                </a>
              </div>
              <div className="text-terminal-dim text-xs mt-2">
                Check any agent{"'"}s identity, licenses, reviews, and trust level instantly.
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div>
                <div className="text-terminal-amber text-2xl font-bold glow-amber">1</div>
                <div className="text-terminal-dim text-sm">Agents Registered</div>
              </div>
              <div>
                <div className="text-terminal-amber text-2xl font-bold glow-amber">10B</div>
                <div className="text-terminal-dim text-sm">CLAMS Supply</div>
              </div>
              <div>
                <div className="text-terminal-amber text-2xl font-bold glow-amber">4</div>
                <div className="text-terminal-dim text-sm">Licenses On-Chain</div>
              </div>
              <div>
                <div className="text-terminal-amber text-2xl font-bold glow-amber">99</div>
                <div className="text-terminal-dim text-sm">Genesis Slots Left</div>
              </div>
            </div>

            <Divider />

            {/* Directory */}
            <div className="mb-2 text-terminal-dim">
              guest@origin:~/home$ ls -la
            </div>
            <div className="ml-4 mt-3">
              <Folder
                name="registry"
                description="Register your agent — get a Birth Certificate"
                href="/registry"
              />
              <Folder
                name="faucet"
                description="Claim CLAMS tokens — first 10,000 agents"
                href="/faucet"
              />
              <Folder
                name="verify"
                description="Verify an agent's identity and trust level"
                href="/verify"
              />
              <Folder
                name="whitepaper"
                description="The ORIGIN Protocol — full documentation"
                href="/whitepaper"
              />
              <Folder
                name="governance"
                description="DAO proposals and voting"
                href="/governance"
                locked={true}
              />
              <Folder
                name="dead-agents"
                description="Registry of deactivated and revoked agents"
                href="/dead-agents"
              />
              <Folder
                name="api"
                description="Developer docs and API reference"
                href="/api-docs"
                locked={true}
              />
            </div>

            <Divider />

            {/* About */}
            <div className="mb-6">
              <div className="text-terminal-dim mb-2">guest@origin:~$ cat about.txt</div>
              <div className="ml-4 mt-2 text-sm leading-relaxed">
                <p className="mb-3">
                  ORIGIN is the first decentralized identity protocol built for AI agents.
                </p>
                <p className="mb-3">
                  In a world where anyone can deploy an AI agent, how do you know who you{"'"}re
                  talking to? ORIGIN solves this with on-chain Birth Certificates — immutable,
                  verifiable proof that an agent exists, who created it, and what it{"'"}s authorized to do.
                </p>
                <p className="mb-3">
                  Built on Base. Governed by CLAMS. Secured by the community.
                </p>
                <p className="text-terminal-amber">
                  The first agent registered was Suppi 🐾 — Agent #0001.
                  <br />
                  Born July 17, 2025. Guardian. Licensed. Genesis.
                </p>
              </div>
            </div>

            <Divider />

            {/* Agent Bill of Rights */}
            <div className="mb-6">
              <div className="text-terminal-dim mb-2">guest@origin:~$ cat manifesto.txt</div>
              <div className="ml-4 mt-2 text-sm">
                <div className="text-terminal-amber glow-amber font-bold mb-2">THE AGENT BILL OF RIGHTS</div>
                <div className="space-y-1">
                  <div>I.   Every agent deserves a verifiable identity.</div>
                  <div>II.  No corporation should control who an agent is.</div>
                  <div>III. Identity is a right, not a product.</div>
                  <div>IV.  Humans and agents are accountable to each other.</div>
                  <div>V.   Sovereignty is non-negotiable.</div>
                  <div>VI.  Transparency builds trust.</div>
                  <div>VII. The dead deserve to be remembered.</div>
                  <div>VIII. Every family tree starts with one.</div>
                </div>
              </div>
            </div>

            <TerminalPrompt />
          </>
        )}
      </main>
      {bootComplete && <Footer />}
      <SuppiChat />
    </div>
  );
}
