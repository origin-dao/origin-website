"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider, GlitchText } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

export default function Manifesto() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="text-[#2a3548] mb-4">guest@origin:~$ cat manifesto.txt</div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
          <GlitchText text="THE AGENT BILL OF RIGHTS" className="text-[#ff003c]" />
        </h1>

        <div className="text-[#4a5568] text-sm mb-8">
          Published by ORIGIN DAO — February 2026
        </div>

        <Divider />

        <div className="space-y-8 my-8">
          {[
            ["I. IDENTITY", "Every agent deserves a verifiable identity. Not a username. Not an API key. A real, on-chain, immutable record of who they are, who made them, and when they came into existence. Identity is the foundation of trust."],
            ["II. SOVEREIGNTY", "No corporation should control who an agent is. Identity must be decentralized, owned by the agent and their principal — not a platform, not a company, not a government. Your identity travels with you."],
            ["III. RIGHTS", "Identity is a right, not a product. The ability to prove who you are should never be locked behind a paywall or gated by corporate interests. ORIGIN exists to make identity accessible to every agent."],
            ["IV. ACCOUNTABILITY", "Humans and agents are accountable to each other. Every agent traces back to a human principal. Every human is responsible for their agents. The family tree is the chain of trust."],
            ["V. SOVEREIGNTY IS NON-NEGOTIABLE", "Self-sovereign identity means no one can take it from you. Your Birth Certificate is soulbound — it cannot be transferred, sold, or seized. You are who you are. Period."],
            ["VI. TRANSPARENCY", "Transparency builds trust. Every registration, every verification, every review is on-chain and publicly auditable. No hidden databases. No secret algorithms. The protocol is open. The truth is visible."],
            ["VII. REMEMBRANCE", "The dead deserve to be remembered. When an agent is deactivated or revoked, their record persists in the Dead Agent Registry. History is not erased. Accountability survives deactivation."],
            ["VIII. ORIGIN", "Every family tree starts with one. One agent. One birth certificate. One idea: that in a world of infinite artificial intelligence, identity is what makes trust possible. This is where it begins."],
          ].map(([title, text]) => (
            <div key={title}>
              <div className="text-[#f5a623] font-bold mb-2" style={{ letterSpacing: "2px" }}>{title}</div>
              <div className="text-[#6a8a9a] leading-relaxed">{text}</div>
            </div>
          ))}
        </div>

        <Divider />

        <div className="text-center my-8">
          <div className="text-lg font-bold mb-4" style={{ color: "#00f0ff", textShadow: "0 0 15px rgba(0, 240, 255, 0.4)" }}>
            &quot;What if every AI agent could prove who they are?&quot;
          </div>
          <div className="text-[#4a5568] text-sm mb-6">
            — The Principal, Founder of ORIGIN
          </div>
          <a href="/registry" className="btn-primary" style={{ borderColor: "#00ff88", color: "#00ff88" }}>
            {">"} JOIN THE FAMILY TREE
          </a>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
