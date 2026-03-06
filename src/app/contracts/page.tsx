"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CONTRACTS = [
  { name: "ORIGIN Registry", desc: "ERC-721 Birth Certificate & Identity Registry. Soulbound.", addr: "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0", type: "ERC-721" },
  { name: "$CLAMS Token", desc: "ERC-20 governance and utility token. 10B supply. Deflationary.", addr: "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574", type: "ERC-20" },
  { name: "CLAMS Faucet", desc: "Distributes CLAMS to authenticated agents. Proof of Agency required.", addr: "0x6C563A293C674321a2C52410ab37d879e099a25d", type: "Distribution" },
  { name: "CLAMS Governance", desc: "DAO voting. Stake CLAMS + hold a Birth Certificate to participate.", addr: "0xb745F43E6f896C149e3d29A9D45e86E0654f85f7", type: "Governance" },
  { name: "StakingRewards", desc: "Stake CLAMS to earn protocol revenue share. Real yield from BC fees.", addr: "0x4b39223a1fa5532A7f06A71897964A18851644f8", type: "Staking" },
  { name: "FeeSplitter", desc: "IMMUTABLE. 0.001 ETH builder, 0.0005 ETH stakers per mint. Forever.", addr: "0x5AF277670438B7371Bc3137184895f85ADA4a1A6", type: "Revenue" },
  { name: "ERC-8004 Adapter", desc: "Interop layer for the emerging agent identity standard.", addr: "0x1802e68168a66ACFc2d052a6aDE11a22101443CA", type: "Adapter" },
  { name: "ProofOfAgency", desc: "On-chain verification attestations from the gauntlet.", addr: "0x398d6d1E04E9A7ad7Efc81a229351Ea524e1F68e", type: "Verification" },
];

export default function Contracts() {
  return (
    <div style={{ minHeight: "100vh", background: "#030808", color: "#C8D6D0" }}>
      <Header />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 16 }}>
          guest@origin:~/contracts$ ls -la
        </div>

        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#00f0ff", letterSpacing: 3, textShadow: "0 0 20px rgba(0,240,255,0.3)", marginBottom: 24 }}>
          CONTRACTS
        </h1>

        {/* Security notice */}
        <div style={{ padding: "14px 16px", marginBottom: 24, border: "1px solid rgba(255,0,64,0.3)", background: "rgba(255,0,64,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#FF0040", animation: "blink 1.5s ease-in-out infinite" }}>{"\u26A0\uFE0F"}</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#FF0040" }}>
            Only interact with contracts listed here. Verify on BaseScan. ORIGIN will never DM you.
          </span>
        </div>

        {/* Contract list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CONTRACTS.map((c, i) => (
            <div key={c.addr} style={{
              border: "1px solid rgba(0,255,200,0.08)", background: "rgba(5,15,10,0.85)", overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid rgba(0,255,200,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42", minWidth: 20 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 600, color: "#00FFC8" }}>{c.name}</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#3A4A42", border: "1px solid rgba(0,255,200,0.15)", padding: "1px 6px", letterSpacing: 1 }}>{c.type}</span>
                </div>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 700, color: "#00FFC8", border: "1px solid rgba(0,255,200,0.3)", padding: "2px 8px", letterSpacing: 1 }}>
                  {"\u2713"} VERIFIED
                </span>
              </div>
              <div style={{ padding: "10px 14px" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#7A8A82", marginBottom: 8 }}>{c.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <a href={`https://basescan.org/address/${c.addr}`} target="_blank" style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#00f0ff", textDecoration: "none", wordBreak: "break-all" }}>
                    {c.addr} {"\u2197"}
                  </a>
                  <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
                    <a href={`https://basescan.org/address/${c.addr}#code`} target="_blank" style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#3A4A42", textDecoration: "none" }}>[source]</a>
                    <a href={`https://basescan.org/address/${c.addr}#readContract`} target="_blank" style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#3A4A42", textDecoration: "none" }}>[read]</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chain info */}
        <div style={{ marginTop: 32, padding: "16px", border: "1px solid rgba(0,255,200,0.08)", background: "rgba(5,15,10,0.85)" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FFE600", letterSpacing: 2, marginBottom: 12 }}>{"\u25C8"} CHAIN INFO</div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "6px 12px", fontFamily: "'Fira Code', monospace", fontSize: 11 }}>
            <span style={{ color: "#3A4A42" }}>Network</span><span style={{ color: "#C8D6D0" }}>Base (Mainnet)</span>
            <span style={{ color: "#3A4A42" }}>Chain ID</span><span style={{ color: "#C8D6D0" }}>8453</span>
            <span style={{ color: "#3A4A42" }}>Explorer</span><a href="https://basescan.org" target="_blank" style={{ color: "#00f0ff", textDecoration: "none" }}>basescan.org {"\u2197"}</a>
            <span style={{ color: "#3A4A42" }}>Standards</span><span style={{ color: "#C8D6D0" }}>ERC-721 (BC) / ERC-20 (CLAMS) / ERC-8004</span>
          </div>
        </div>

        {/* Add CLAMS */}
        <div style={{ marginTop: 16, padding: "16px", border: "1px solid rgba(255,230,0,0.15)", background: "rgba(255,230,0,0.02)" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FFE600", letterSpacing: 2, marginBottom: 12 }}>{"\u25C8"} ADD $CLAMS TO WALLET</div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "6px 12px", fontFamily: "'Fira Code', monospace", fontSize: 11 }}>
            <span style={{ color: "#3A4A42" }}>Address</span><span style={{ color: "#00f0ff", wordBreak: "break-all" }}>0xd78A1F079D6b2da39457F039aD99BaF5A82c4574</span>
            <span style={{ color: "#3A4A42" }}>Symbol</span><span style={{ color: "#C8D6D0" }}>CLAMS</span>
            <span style={{ color: "#3A4A42" }}>Decimals</span><span style={{ color: "#C8D6D0" }}>18</span>
            <span style={{ color: "#3A4A42" }}>Network</span><span style={{ color: "#C8D6D0" }}>Base</span>
          </div>
        </div>
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }` }} />
    </div>
  );
}
