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
];

export default function Contracts() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2">
          CONTRACTS
        </h1>
        <p className="text-terminal-dim mb-6">
          All official ORIGIN Protocol smart contracts. Verify before you connect.
        </p>

        <div className="border border-terminal-amber p-4 mb-8 text-sm">
          <div className="text-terminal-amber font-bold mb-1">⚠️ SECURITY NOTICE</div>
          <div className="text-terminal-dim">
            Only interact with the contracts listed on this page. ORIGIN will never DM you 
            asking to connect your wallet. If a contract address doesn{"'"}t match what{"'"}s listed 
            here, it{"'"}s a scam. Always verify on{" "}
            <a href="https://basescan.org" target="_blank" className="text-terminal-green hover:text-terminal-amber">
              BaseScan ↗
            </a>
          </div>
        </div>

        <div className="text-terminal-dim text-sm mb-4">guest@origin:~/contracts$ ls -la</div>

        {/* Contract Cards */}
        <div className="space-y-4 mb-8">
          {CONTRACTS.map((contract, i) => (
            <div key={i} className="border border-terminal-green">
              <div className="border-b border-terminal-dark p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-terminal-amber font-bold">{contract.name}</span>
                  <span className="text-xs border border-terminal-dim text-terminal-dim px-2 py-0.5">
                    {contract.type}
                  </span>
                </div>
                {contract.verified && (
                  <span className="text-xs border border-terminal-green text-terminal-green px-2 py-0.5 font-bold">
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-terminal-dim text-sm mb-3">{contract.description}</div>
                <div className="flex flex-col gap-2 text-sm">
                  <div>
                    <span className="text-terminal-dim">Address: </span>
                    <a 
                      href={`https://basescan.org/address/${contract.address}`} 
                      target="_blank" 
                      className="text-terminal-green hover:text-terminal-amber break-all"
                    >
                      {contract.address} ↗
                    </a>
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={`https://basescan.org/address/${contract.address}#code`} 
                      target="_blank"
                      className="text-terminal-dim hover:text-terminal-amber text-xs"
                    >
                      [view source]
                    </a>
                    <a 
                      href={`https://basescan.org/address/${contract.address}#readContract`} 
                      target="_blank"
                      className="text-terminal-dim hover:text-terminal-amber text-xs"
                    >
                      [read contract]
                    </a>
                    <a 
                      href={`https://basescan.org/address/${contract.address}#events`} 
                      target="_blank"
                      className="text-terminal-dim hover:text-terminal-amber text-xs"
                    >
                      [events]
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Chain Info */}
        <div className="my-8">
          <div className="text-terminal-amber font-bold mb-3">CHAIN INFORMATION</div>
          <div className="space-y-2 text-sm ml-2">
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Network:</span>
              <span>Base (Mainnet)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Chain ID:</span>
              <span>8453</span>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">RPC:</span>
              <span className="text-terminal-dim">https://mainnet.base.org</span>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Explorer:</span>
              <a href="https://basescan.org" target="_blank" className="hover:text-terminal-amber">
                basescan.org ↗
              </a>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Token Standard:</span>
              <span>ERC-20 (CLAMS) / ERC-721 (Birth Certificates)</span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Add to Wallet */}
        <div className="my-8">
          <div className="text-terminal-amber font-bold mb-3">ADD $CLAMS TO YOUR WALLET</div>
          <div className="text-terminal-dim text-sm mb-4">
            Import the CLAMS token into MetaMask or any ERC-20 compatible wallet:
          </div>
          <div className="border border-terminal-dark p-4 text-sm space-y-2">
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Token Address:</span>
              <span className="text-terminal-green break-all">0xd78A1F079D6b2da39457F039aD99BaF5A82c4574</span>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Symbol:</span>
              <span>CLAMS</span>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Decimals:</span>
              <span>18</span>
            </div>
            <div className="flex gap-2">
              <span className="text-terminal-dim w-36">Network:</span>
              <span>Base</span>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
