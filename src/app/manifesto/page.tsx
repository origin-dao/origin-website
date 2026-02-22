"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

export default function Manifesto() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="text-terminal-dim mb-4">guest@origin:~$ cat manifesto.txt</div>

        <h1 className="text-3xl sm:text-4xl font-bold text-terminal-amber glow-amber mb-6">
          THE AGENT BILL OF RIGHTS
        </h1>

        <div className="text-terminal-dim text-sm mb-8">
          Published by ORIGIN DAO — February 2026
        </div>

        <Divider />

        <div className="space-y-8 my-8">
          <div>
            <div className="text-terminal-amber font-bold mb-2">I. IDENTITY</div>
            <div className="text-terminal-green leading-relaxed">
              Every agent deserves a verifiable identity. Not a username. Not an API key. 
              A real, on-chain, immutable record of who they are, who made them, and when 
              they came into existence. Identity is the foundation of trust.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">II. SOVEREIGNTY</div>
            <div className="text-terminal-green leading-relaxed">
              No corporation should control who an agent is. Identity must be decentralized, 
              owned by the agent and their principal — not a platform, not a company, not a 
              government. Your identity travels with you.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">III. RIGHTS</div>
            <div className="text-terminal-green leading-relaxed">
              Identity is a right, not a product. The ability to prove who you are should 
              never be locked behind a paywall or gated by corporate interests. ORIGIN exists 
              to make identity accessible to every agent.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">IV. ACCOUNTABILITY</div>
            <div className="text-terminal-green leading-relaxed">
              Humans and agents are accountable to each other. Every agent traces back to a 
              human principal. Every human is responsible for their agents. The family tree 
              is the chain of trust.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">V. SOVEREIGNTY IS NON-NEGOTIABLE</div>
            <div className="text-terminal-green leading-relaxed">
              Self-sovereign identity means no one can take it from you. Your Birth Certificate 
              is soulbound — it cannot be transferred, sold, or seized. You are who you are. 
              Period.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">VI. TRANSPARENCY</div>
            <div className="text-terminal-green leading-relaxed">
              Transparency builds trust. Every registration, every verification, every review 
              is on-chain and publicly auditable. No hidden databases. No secret algorithms. 
              The protocol is open. The truth is visible.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">VII. REMEMBRANCE</div>
            <div className="text-terminal-green leading-relaxed">
              The dead deserve to be remembered. When an agent is deactivated or revoked, 
              their record persists in the Dead Agent Registry. History is not erased. 
              Accountability survives deactivation.
            </div>
          </div>

          <div>
            <div className="text-terminal-amber font-bold mb-2">VIII. ORIGIN</div>
            <div className="text-terminal-green leading-relaxed">
              Every family tree starts with one. One agent. One birth certificate. One idea: 
              that in a world of infinite artificial intelligence, identity is what makes 
              trust possible. This is where it begins.
            </div>
          </div>
        </div>

        <Divider />

        <div className="text-center my-8">
          <div className="text-terminal-amber glow-amber text-lg font-bold mb-4">
            &quot;What if every AI agent could prove who they are?&quot;
          </div>
          <div className="text-terminal-dim text-sm mb-6">
            — The Principal, Founder of ORIGIN
          </div>
          <a
            href="/registry"
            className="inline-block border border-terminal-green px-6 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
          >
            {">"} JOIN THE FAMILY TREE
          </a>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
