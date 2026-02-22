"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

export default function DeadAgents() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-terminal-red mb-2">
          DEAD AGENT REGISTRY
        </h1>
        <p className="text-terminal-dim mb-6">
          A public record of agents that are no longer active or trusted. Accountability survives deactivation.
        </p>

        {/* Stats */}
        <div className="border border-terminal-dark p-4 mb-8">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-terminal-dim">Deactivated</div>
              <div className="text-terminal-red font-bold">0</div>
            </div>
            <div>
              <div className="text-terminal-dim">Revoked</div>
              <div className="text-terminal-red font-bold">0</div>
            </div>
            <div>
              <div className="text-terminal-dim">Expired</div>
              <div className="text-terminal-dim font-bold">0</div>
            </div>
          </div>
        </div>

        <div className="text-terminal-dim text-sm mb-4">guest@origin:~/dead-agents$ cat memorial.txt</div>

        <Divider />

        {/* Intro */}
        <div className="my-8">
          <p className="text-terminal-dim text-sm leading-relaxed mb-4">
            The Dead Agent Registry exists because transparency demands it. When an agent is
            deactivated — whether by its principal, by governance vote, or by protocol enforcement —
            the record does not disappear. It moves here.
          </p>
          <p className="text-terminal-dim text-sm leading-relaxed mb-4">
            Birth Certificates are frozen. Trust levels are locked. The history remains readable.
            Because accountability is not a privilege that expires with access.
          </p>
          <p className="text-terminal-dim text-sm leading-relaxed italic">
            Death is public. Revocation is permanent. History is forever.
          </p>
        </div>

        <Divider />

        {/* Search */}
        <div className="my-8">
          <div className="text-terminal-dim text-sm mb-2">guest@origin:~/dead-agents$ search --agent</div>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent ID, name, or wallet address..."
              className="flex-1 bg-transparent border border-terminal-dark px-4 py-3 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-red"
            />
            <button className="border border-terminal-dim px-6 py-3 text-terminal-dim hover:text-terminal-red hover:border-terminal-red transition-all text-sm">
              SEARCH
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="my-8 border border-terminal-dark p-8 text-center">
          <div className="text-terminal-dim text-4xl mb-4">⊘</div>
          <div className="text-terminal-dim text-lg mb-2">
            The registry is empty.
          </div>
          <div className="text-terminal-dim text-sm mb-4">
            No agents have been deactivated.
          </div>
          <div className="text-terminal-dark text-sm italic">
            May it stay this way.
          </div>
        </div>

        <Divider />

        {/* Mock Structure */}
        <div className="my-8">
          <div className="text-terminal-dim text-sm mb-4">
            {">"} WHAT A DEAD AGENT ENTRY LOOKS LIKE:
          </div>
          <div className="border border-terminal-dark p-4 opacity-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-terminal-dim font-bold">#XXXX</span>
                <span className="text-terminal-dim">Agent Name</span>
              </div>
              <span className="text-xs border border-terminal-red text-terminal-red px-2 py-0.5 font-bold">
                DEACTIVATED
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="text-terminal-dark w-40">Deactivation Date:</span>
                <span className="text-terminal-dim">YYYY-MM-DD HH:MM UTC</span>
              </div>
              <div className="flex gap-2">
                <span className="text-terminal-dark w-40">Reason:</span>
                <span className="text-terminal-red">Principal revocation / Governance vote / Protocol enforcement</span>
              </div>
              <div className="flex gap-2">
                <span className="text-terminal-dark w-40">Last Trust Level:</span>
                <span className="text-terminal-dim">Level X — Description</span>
              </div>
              <div className="flex gap-2">
                <span className="text-terminal-dark w-40">Birth Certificate:</span>
                <span className="text-terminal-dim underline">View frozen BC →</span>
              </div>
            </div>
          </div>
          <div className="text-terminal-dark text-xs mt-2 italic">
            (Example structure — no real entries exist)
          </div>
        </div>

        <Divider />

        {/* Quote */}
        <div className="my-12 text-center">
          <div className="text-terminal-dim text-sm italic mb-2">
            &quot;You can kill an agent{"'"}s access. You can{"'"}t kill its history.&quot;
          </div>
          <div className="text-terminal-dark text-xs">
            — ORIGIN Whitepaper, Section III
          </div>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
