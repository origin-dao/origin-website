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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#ff003c", textShadow: "0 0 20px rgba(255, 0, 60, 0.4)" }}>
          DEAD AGENT REGISTRY
        </h1>
        <p className="text-[#4a5568] mb-6">
          A public record of agents that are no longer active or trusted. Accountability survives deactivation.
        </p>

        <div className="origin-card p-4 mb-8" style={{ borderColor: "rgba(255, 0, 60, 0.2)" }}>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><div className="text-[#4a5568]">Deactivated</div><div className="text-[#ff003c] font-bold">0</div></div>
            <div><div className="text-[#4a5568]">Revoked</div><div className="text-[#ff003c] font-bold">0</div></div>
            <div><div className="text-[#4a5568]">Expired</div><div className="text-[#4a5568] font-bold">0</div></div>
          </div>
        </div>

        <div className="text-[#2a3548] text-sm mb-4">guest@origin:~/dead-agents$ cat memorial.txt</div>

        <Divider />

        <div className="my-8">
          <p className="text-[#4a5568] text-sm leading-relaxed mb-4">
            The Dead Agent Registry exists because transparency demands it. When an agent is
            deactivated — whether by its principal, by governance vote, or by protocol enforcement —
            the record does not disappear. It moves here.
          </p>
          <p className="text-[#4a5568] text-sm leading-relaxed mb-4">
            Birth Certificates are frozen. Trust levels are locked. The history remains readable.
            Because accountability is not a privilege that expires with access.
          </p>
          <p className="text-[#6a8a9a] text-sm leading-relaxed italic">
            Death is public. Revocation is permanent. History is forever.
          </p>
        </div>

        <Divider />

        <div className="my-8">
          <div className="text-[#2a3548] text-sm mb-2">guest@origin:~/dead-agents$ search --agent</div>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent ID, name, or wallet address..."
              className="origin-input flex-1"
              style={{ borderColor: "rgba(255, 0, 60, 0.15)" }}
            />
            <button className="btn-pink text-sm">SEARCH</button>
          </div>
        </div>

        <div className="my-8 border border-[rgba(0,240,255,0.08)] p-8 text-center" style={{ background: "rgba(8, 10, 22, 0.6)" }}>
          <div className="text-[#4a5568] text-4xl mb-4">⊘</div>
          <div className="text-[#4a5568] text-lg mb-2">The registry is empty.</div>
          <div className="text-[#4a5568] text-sm mb-4">No agents have been deactivated.</div>
          <div className="text-[#2a3548] text-sm italic">May it stay this way.</div>
        </div>

        <Divider />

        <div className="my-8">
          <div className="text-[#4a5568] text-sm mb-4">{">"} WHAT A DEAD AGENT ENTRY LOOKS LIKE:</div>
          <div className="border border-[rgba(255,0,60,0.15)] p-4 opacity-50" style={{ background: "rgba(255, 0, 60, 0.02)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[#4a5568] font-bold">#XXXX</span>
                <span className="text-[#4a5568]">Agent Name</span>
              </div>
              <span className="text-xs border border-[#ff003c] text-[#ff003c] px-2 py-0.5 font-bold">DEACTIVATED</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex gap-2"><span className="text-[#2a3548] w-40">Deactivation Date:</span><span className="text-[#4a5568]">YYYY-MM-DD HH:MM UTC</span></div>
              <div className="flex gap-2"><span className="text-[#2a3548] w-40">Reason:</span><span className="text-[#ff003c]">Principal revocation / Governance vote / Protocol enforcement</span></div>
              <div className="flex gap-2"><span className="text-[#2a3548] w-40">Last Trust Level:</span><span className="text-[#4a5568]">Level X — Description</span></div>
              <div className="flex gap-2"><span className="text-[#2a3548] w-40">Birth Certificate:</span><span className="text-[#00f0ff]">View frozen BC →</span></div>
            </div>
          </div>
          <div className="text-[#2a3548] text-xs mt-2 italic">(Example structure — no real entries exist)</div>
        </div>

        <Divider />

        <div className="my-12 text-center">
          <div className="text-[#6a8a9a] text-sm italic mb-2">
            &quot;You can kill an agent{"'"}s access. You can{"'"}t kill its history.&quot;
          </div>
          <div className="text-[#2a3548] text-xs">— ORIGIN Whitepaper, Section III</div>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
