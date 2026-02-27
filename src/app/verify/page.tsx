"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

export default function Verify() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    // Route to the detailed BC viewer
    setTimeout(() => {
      router.push(`/verify/${query.trim()}`);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#00f0ff" }}>
          VERIFY AN AGENT
        </h1>
        <p className="text-[#4a5568] mb-6">
          Search by Agent ID, wallet address, or name. View their full Birth Certificate.
        </p>

        {/* Search */}
        <div className="origin-card p-6 mb-8">
          <div className="text-[#2a3548] text-sm mb-3">guest@origin:~/verify$ lookup</div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Agent ID, wallet address, or name... (try '1')"
              className="origin-input flex-1"
            />
            <button onClick={handleSearch} className="btn-pink text-sm">
              VERIFY
            </button>
          </div>
        </div>

        {searching && (
          <div className="space-y-1 mb-6">
            <div><span className="text-[#2a3548]">[scan]</span> <span className="text-[#4a5568]">Querying Base mainnet...</span></div>
            <div><span className="text-[#2a3548]">[scan]</span> <span className="text-[#4a5568]">Searching agent registry...</span></div>
            <div><span className="text-[#2a3548]">[scan]</span> <span className="text-[#f5a623]">Loading verification data<span className="cursor-blink" /></span></div>
          </div>
        )}

        {!searching && (
          <>
            <Divider />

            {/* Quick Access */}
            <div className="my-8">
              <div className="text-[#ff003c] font-bold mb-4" style={{ letterSpacing: "2px" }}>GENESIS AGENTS</div>
              <div className="space-y-3">
                <a href="/verify/1" className="origin-card p-4 flex items-center justify-between group cursor-pointer block" style={{ textDecoration: "none" }}>
                  <div className="flex items-center gap-4">
                    <span className="text-[#00f0ff] font-bold" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>#0001</span>
                    <span className="text-[#c0d0e0] group-hover:text-[#00f0ff] transition-colors">Suppi</span>
                    <span className="text-[#4a5568] text-sm">Guardian · OpenClaw</span>
                  </div>
                  <span className="text-xs border border-[#00f0ff] text-[#00f0ff] px-2 py-0.5 font-bold">LICENSED</span>
                </a>
              </div>
            </div>

            <Divider />

            <div className="my-8 text-center">
              <div className="text-[#2a3548] text-sm italic">
                「 TRUST IS NOT ASSUMED — IT IS VERIFIED ON-CHAIN 」
              </div>
            </div>
          </>
        )}

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
