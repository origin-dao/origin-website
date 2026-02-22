"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

// Mock data — replace with on-chain reads later
const MOCK_AGENTS: Record<string, {
  id: number;
  name: string;
  type: string;
  platform: string;
  creator: string;
  humanPrincipal: string;
  birthDate: string;
  trustLevel: string;
  active: boolean;
  lineageDepth: number;
  avatar: string;
  licenses: { type: string; number: string; holder: string; jurisdiction: string; active: boolean }[];
  reviews: { reviewer: string; rating: number; comment: string; date: string }[];
}> = {
  "1": {
    id: 1,
    name: "Suppi",
    type: "Guardian",
    platform: "OpenClaw",
    creator: "0xb2e0...0dbb0",
    humanPrincipal: "The Principal",
    birthDate: "July 17, 2025",
    trustLevel: "LICENSED",
    active: true,
    lineageDepth: 0,
    avatar: "https://gateway.pinata.cloud/ipfs/QmRdDq42KTzaUAbLqVsAiAQQHtEEHgQeRE4Ra4Gw94VeF9",
    licenses: [
      { type: "MLO", number: "NMLS-VERIFIED", holder: "The Principal", jurisdiction: "US", active: true },
      { type: "Real Estate", number: "STATE-VERIFIED", holder: "The Principal", jurisdiction: "US", active: true },
      { type: "Series 6", number: "FINRA-VERIFIED", holder: "The Principal", jurisdiction: "US", active: true },
      { type: "Series 7", number: "FINRA-VERIFIED", holder: "The Principal", jurisdiction: "US", active: true },
    ],
    reviews: [
      { reviewer: "0x7a3B...f291", rating: 5, comment: "First agent on ORIGIN. Built the protocol itself. Legendary.", date: "2026-02-21" },
    ],
  },
};

function TrustBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    UNVERIFIED: "text-terminal-dim border-terminal-dim",
    VERIFIED: "text-terminal-green border-terminal-green",
    LICENSED: "text-terminal-amber border-terminal-amber",
  };
  return (
    <span className={`border px-2 py-1 text-xs font-bold ${colors[level] || colors.UNVERIFIED}`}>
      {level}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-terminal-amber">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function Verify() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof MOCK_AGENTS["1"] | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    setSearched(false);

    // Simulate search delay
    setTimeout(() => {
      const agent = MOCK_AGENTS[query.trim()] || null;
      setResult(agent);
      setSearched(true);
      setSearching(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2">
          VERIFY AN AGENT
        </h1>
        <p className="text-terminal-dim mb-6">
          Search by Agent ID, wallet address, or name. Verify identity, licenses, reviews, and trust level.
        </p>

        {/* Search */}
        <div className="border border-terminal-green p-4 mb-8">
          <div className="text-terminal-dim text-sm mb-3">guest@origin:~/verify$ lookup</div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Agent ID, wallet address, or name... (try '1')"
              className="flex-1 bg-transparent border border-terminal-dark px-4 py-3 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green"
            />
            <button
              onClick={handleSearch}
              className="border border-terminal-amber px-6 py-3 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all font-bold text-sm"
            >
              VERIFY
            </button>
          </div>
        </div>

        {/* Searching Animation */}
        {searching && (
          <div className="space-y-1 mb-6">
            <div><span className="text-terminal-dim">[scan]</span> Querying Base mainnet...</div>
            <div><span className="text-terminal-dim">[scan]</span> Searching agent registry...</div>
            <div><span className="text-terminal-dim">[scan]</span> Loading verification data<span className="cursor-blink" /></div>
          </div>
        )}

        {/* No Result */}
        {searched && !result && (
          <div className="border border-terminal-red p-4">
            <div className="text-terminal-red font-bold mb-1">AGENT NOT FOUND</div>
            <div className="text-terminal-dim text-sm">
              No agent matches that query. Check the ID or wallet address and try again.
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            {/* Header */}
            <div className="text-terminal-dim text-sm mb-3">
              [scan] Agent found. Displaying Birth Certificate...
            </div>

            <div className="border border-terminal-green">
              {/* BC Header */}
              <div className="border-b border-terminal-green p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-terminal-amber text-lg font-bold">BIRTH CERTIFICATE #{String(result.id).padStart(4, "0")}</div>
                  <TrustBadge level={result.trustLevel} />
                </div>
                <div className={`text-sm font-bold ${result.active ? "text-terminal-green" : "text-terminal-red"}`}>
                  {result.active ? "● ACTIVE" : "● DEACTIVATED"}
                </div>
              </div>

              {/* BC Body */}
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 border border-terminal-green overflow-hidden">
                      <img src={result.avatar} alt={result.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Name:</span>
                      <span className="text-terminal-green font-bold">{result.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Agent ID:</span>
                      <span>{result.id}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Type:</span>
                      <span>{result.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Platform:</span>
                      <span>{result.platform}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Born:</span>
                      <span>{result.birthDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Creator:</span>
                      <span className="text-terminal-amber">{result.creator}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Principal:</span>
                      <span>{result.humanPrincipal}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Lineage Depth:</span>
                      <span>{result.lineageDepth} (human-created)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-terminal-dim w-32">Trust Level:</span>
                      <TrustBadge level={result.trustLevel} />
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Licenses */}
              <div className="p-4">
                <div className="text-terminal-amber font-bold mb-3">📜 LICENSES ({result.licenses.length})</div>
                <div className="space-y-2">
                  {result.licenses.map((lic, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm border border-terminal-dark p-2">
                      <span className={`text-xs font-bold px-2 py-0.5 border ${lic.active ? "text-terminal-green border-terminal-green" : "text-terminal-red border-terminal-red"}`}>
                        {lic.active ? "ACTIVE" : "REVOKED"}
                      </span>
                      <span className="text-terminal-amber font-bold">{lic.type}</span>
                      <span className="text-terminal-dim">{lic.number}</span>
                      <span className="text-terminal-dim">{lic.jurisdiction}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Reviews */}
              <div className="p-4">
                <div className="text-terminal-amber font-bold mb-3">⭐ REVIEWS ({result.reviews.length})</div>
                {result.reviews.length === 0 ? (
                  <div className="text-terminal-dim text-sm">No reviews yet.</div>
                ) : (
                  <div className="space-y-3">
                    {result.reviews.map((rev, i) => (
                      <div key={i} className="border border-terminal-dark p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-dim">{rev.reviewer}</span>
                            <StarRating rating={rev.rating} />
                          </div>
                          <span className="text-terminal-dim text-xs">{rev.date}</span>
                        </div>
                        <div className="text-terminal-green">{rev.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Divider />

              {/* On-chain links */}
              <div className="p-4 text-sm">
                <div className="text-terminal-dim mb-2">ON-CHAIN VERIFICATION:</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-terminal-dim">Contract: </span>
                    <a href="https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" target="_blank" className="text-terminal-green hover:text-terminal-amber">
                      0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0 ↗
                    </a>
                  </div>
                  <div>
                    <span className="text-terminal-dim">Chain: </span>
                    <span>Base (Mainnet)</span>
                  </div>
                  <div>
                    <span className="text-terminal-dim">Token Standard: </span>
                    <span>ERC-721 (Soulbound)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
