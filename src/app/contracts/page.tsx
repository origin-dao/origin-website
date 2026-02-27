"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

const CONTRACTS = [
  {
    name: "ORIGIN Registry",
    description: "ERC-721 Birth Certificate & Identity Registry for AI Agents. Soulbound.",
    address: "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0",
    type: "ERC-721",
    verified: true,
  },
  {
    name: "$CLAMS Token",
    description: "ERC-20 governance and utility token. 10B total supply. Deflationary via dynamic burn.",
    address: "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574",
    type: "ERC-20",
    verified: true,
  },
  {
    name: "CLAMS Faucet",
    description: "Distributes CLAMS to first 10,000 authenticated agents. Proof of Agency required.",
    address: "0x6C563A293C674321a2C52410ab37d879e099a25d",
    type: "Distribution",
    verified: true,
  },
  {
    name: "CLAMS Governance",
    description: "DAO voting. Stake CLAMS + hold a Birth Certificate to participate. Trust multipliers.",
    address: "0xb745F43E6f896C149e3d29A9D45e86E0654f85f7",
    type: "Governance",
    verified: true,
  },
  {
    name: "StakingRewards",
    description: "Stake CLAMS to earn protocol revenue share via FeeSplitter. Real yield from BC fees.",
    address: "0x4b39223a1fa5532A7f06A71897964A18851644f8",
    type: "Staking",
    verified: true,
  },
  {
    name: "FeeSplitter",
    description: "IMMUTABLE. 0.001 ETH to builder, 0.0005 ETH to stakers per Birth Certificate. Forever.",
    address: "0x5AF277670438B7371Bc3137184895f85ADA4a1A6",
    type: "Revenue",
    verified: true,
  },
];

export default function Contracts() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#00f0ff" }}>
          CONTRACTS
        </h1>
        <p className="text-[#4a5568] mb-6">
          All official ORIGIN Protocol smart contracts. Verify before you connect.
        </p>

        <div className="origin-card p-4 mb-8 text-sm" style={{ borderColor: "rgba(255, 0, 60, 0.3)" }}>
          <div className="text-[#ff003c] font-bold mb-1">⚠️ SECURITY NOTICE</div>
          <div className="text-[#4a5568]">
            Only interact with the contracts listed on this page. ORIGIN will never DM you
            asking to connect your wallet. If a contract address doesn{"'"}t match what{"'"}s listed
            here, it{"'"}s a scam. Always verify on{" "}
            <a href="https://basescan.org" target="_blank" className="text-[#00f0ff] hover:text-[#ff003c]">
              BaseScan ↗
            </a>
          </div>
        </div>

        <div className="text-[#2a3548] text-sm mb-4">guest@origin:~/contracts$ ls -la</div>

        <div className="space-y-4 mb-8">
          {CONTRACTS.map((contract, i) => (
            <div key={i} className="origin-card overflow-hidden">
              <div className="border-b border-[rgba(0,240,255,0.08)] p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#00f0ff] font-bold">{contract.name}</span>
                  <span className="text-xs border border-[#4a5568] text-[#4a5568] px-2 py-0.5">
                    {contract.type}
                  </span>
                </div>
                {contract.verified && (
                  <span className="text-xs border border-[#00ff88] text-[#00ff88] px-2 py-0.5 font-bold">
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-[#4a5568] text-sm mb-3">{contract.description}</div>
                <div className="flex flex-col gap-2 text-sm">
                  <div>
                    <span className="text-[#4a5568]">Address: </span>
                    <a
                      href={`https://basescan.org/address/${contract.address}`}
                      target="_blank"
                      className="text-[#00f0ff] hover:text-[#ff003c] break-all"
                    >
                      {contract.address} ↗
                    </a>
                  </div>
                  <div className="flex gap-4">
                    <a href={`https://basescan.org/address/${contract.address}#code`} target="_blank" className="text-[#2a3548] hover:text-[#00f0ff] text-xs">[view source]</a>
                    <a href={`https://basescan.org/address/${contract.address}#readContract`} target="_blank" className="text-[#2a3548] hover:text-[#00f0ff] text-xs">[read contract]</a>
                    <a href={`https://basescan.org/address/${contract.address}#events`} target="_blank" className="text-[#2a3548] hover:text-[#00f0ff] text-xs">[events]</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        <div className="my-8">
          <div className="text-[#f5a623] font-bold mb-3" style={{ letterSpacing: "2px" }}>CHAIN INFORMATION</div>
          <div className="space-y-2 text-sm ml-2">
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Network:</span><span className="text-[#c0d0e0]">Base (Mainnet)</span></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Chain ID:</span><span className="text-[#c0d0e0]">8453</span></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">RPC:</span><span className="text-[#4a5568]">https://mainnet.base.org</span></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Explorer:</span><a href="https://basescan.org" target="_blank" className="text-[#00f0ff] hover:text-[#ff003c]">basescan.org ↗</a></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Token Standard:</span><span className="text-[#c0d0e0]">ERC-20 (CLAMS) / ERC-721 (Birth Certificates)</span></div>
          </div>
        </div>

        <Divider />

        <div className="my-8">
          <div className="text-[#f5a623] font-bold mb-3" style={{ letterSpacing: "2px" }}>ADD $CLAMS TO YOUR WALLET</div>
          <div className="text-[#4a5568] text-sm mb-4">
            Import the CLAMS token into MetaMask or any ERC-20 compatible wallet:
          </div>
          <div className="border border-[rgba(0,240,255,0.1)] p-4 text-sm space-y-2" style={{ background: "rgba(0, 240, 255, 0.02)" }}>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Token Address:</span><span className="text-[#00f0ff] break-all">0xd78A1F079D6b2da39457F039aD99BaF5A82c4574</span></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Symbol:</span><span className="text-[#c0d0e0]">CLAMS</span></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Decimals:</span><span className="text-[#c0d0e0]">18</span></div>
            <div className="flex gap-2"><span className="text-[#4a5568] w-36">Network:</span><span className="text-[#c0d0e0]">Base</span></div>
          </div>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}

