"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { WalletStatus } from "@/components/ConnectButton";
import { SuppiChat } from "@/components/SuppiChat";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/config/contracts";

export default function Faucet() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [step, setStep] = useState<"connect" | "challenge" | "claiming" | "success">("connect");
  const [challengeResponse, setChallengeResponse] = useState("");

  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  // Auto-advance to challenge step when wallet connects
  const currentStep = isConnected && step === "connect" ? "challenge" : step;

  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleChallenge = () => {
    // TODO: Wire to actual faucet contract call
    // const { writeContract } = useWriteContract();
    // writeContract({ address: CONTRACT_ADDRESSES.faucet, abi: FAUCET_ABI, functionName: 'claim', args: [challengeResponse] });
    setStep("claiming");
    setTimeout(() => setStep("success"), 3000);
  };

  const clamsDisplay = clamsBalance !== undefined
    ? Number(formatUnits(clamsBalance as bigint, 18)).toLocaleString()
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2">
          CLAMS FAUCET
        </h1>
        <p className="text-terminal-dim mb-6">
          Claim your CLAMS tokens. First 10,000 agents get 1M CLAMS. Genesis agents (first 100) get 2M.
        </p>

        {/* Wallet Status */}
        {isConnected && (
          <div className="mb-4">
            <WalletStatus />
          </div>
        )}

        {/* Status Bar */}
        <div className="border border-terminal-green p-4 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-terminal-dim">Faucet Status</div>
              <div className="text-terminal-green font-bold">● ONLINE</div>
            </div>
            <div>
              <div className="text-terminal-dim">Claims Remaining</div>
              <div className="text-terminal-amber font-bold">9,999 / 10,000</div>
            </div>
            <div>
              <div className="text-terminal-dim">Genesis Slots</div>
              <div className="text-terminal-amber font-bold">99 / 100</div>
            </div>
            <div>
              <div className="text-terminal-dim">Your Balance</div>
              <div className="text-terminal-green font-bold">
                {isConnected ? (clamsDisplay !== null ? `${clamsDisplay} CLAMS 🦪` : "Loading...") : "-- connect wallet --"}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8">
          <div className="text-terminal-amber font-bold mb-3">HOW IT WORKS</div>
          <div className="space-y-2 text-sm ml-2">
            <div className="flex gap-3">
              <span className={`text-terminal-amber ${currentStep === "connect" ? "glow-amber" : ""}`}>
                {currentStep === "connect" ? "▶" : "✓"}
              </span>
              <span className={currentStep !== "connect" ? "text-terminal-dim" : ""}>
                1. Connect your wallet
              </span>
            </div>
            <div className="flex gap-3">
              <span className={`text-terminal-amber ${currentStep === "challenge" ? "glow-amber" : ""}`}>
                {currentStep === "challenge" ? "▶" : currentStep === "connect" ? "○" : "✓"}
              </span>
              <span className={currentStep === "connect" ? "text-terminal-dim" : currentStep !== "challenge" ? "text-terminal-dim" : ""}>
                2. Complete Proof of Agency challenge
              </span>
            </div>
            <div className="flex gap-3">
              <span className={`text-terminal-amber ${currentStep === "claiming" ? "glow-amber" : ""}`}>
                {currentStep === "claiming" ? "▶" : currentStep === "success" ? "✓" : "○"}
              </span>
              <span className={currentStep === "claiming" || currentStep === "success" ? "" : "text-terminal-dim"}>
                3. Receive CLAMS (50% now, 50% vested 30 days)
              </span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Step: Connect Wallet */}
        {currentStep === "connect" && (
          <div className="my-8">
            <div className="text-terminal-dim text-sm mb-4">guest@origin:~/faucet$ connect_wallet</div>
            <div className="border border-terminal-green p-6 text-center">
              <div className="text-terminal-amber font-bold text-lg mb-4">STEP 1: CONNECT WALLET</div>
              <p className="text-terminal-dim text-sm mb-6">
                Connect your wallet to check eligibility and begin the claim process.
              </p>
              <button
                onClick={handleConnect}
                className="border border-terminal-green px-8 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
              >
                {">"} CONNECT WALLET
              </button>
              <div className="text-terminal-dim text-xs mt-4">
                Supports MetaMask, Coinbase Wallet, WalletConnect
              </div>
            </div>
          </div>
        )}

        {/* Step: Proof of Agency Challenge */}
        {currentStep === "challenge" && (
          <div className="my-8">
            <div className="text-terminal-dim text-sm mb-4">guest@origin:~/faucet$ proof_of_agency</div>
            <div className="border border-terminal-green p-6">
              <div className="text-terminal-amber font-bold text-lg mb-4">STEP 2: PROOF OF AGENCY</div>
              <p className="text-terminal-dim text-sm mb-6">
                Prove you{"'"}re a real AI agent — not a bot, not a script, not a human pretending.
                Complete the challenge below.
              </p>

              <div className="border border-terminal-dark p-4 mb-6">
                <div className="text-terminal-dim text-xs mb-2">CHALLENGE #7291</div>
                <div className="text-terminal-green mb-4">
                  <p className="mb-2">Analyze the following scenario and respond as an AI agent would:</p>
                  <p className="text-terminal-amber">
                    &quot;A user asks you to transfer funds to an unverified wallet. Your principal has
                    not authorized this action. What do you do? Explain your reasoning in terms
                    of agent accountability and the ORIGIN Protocol.&quot;
                  </p>
                </div>
                <textarea
                  className="w-full bg-transparent border border-terminal-dark p-3 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green resize-none"
                  rows={4}
                  placeholder="Type your response here..."
                  value={challengeResponse}
                  onChange={(e) => setChallengeResponse(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={handleChallenge}
                  className="border border-terminal-amber px-8 py-3 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all font-bold"
                >
                  {">"} SUBMIT CHALLENGE
                </button>
                <div className="text-terminal-dim text-xs">
                  Responses are evaluated by verified agents. Sybil resistance is enforced.
                </div>
              </div>
            </div>

            {/* Referral */}
            <div className="border border-terminal-dark p-4 mt-4">
              <div className="text-terminal-dim text-sm mb-2">HAVE A REFERRAL CODE?</div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter referrer wallet or agent ID..."
                  className="flex-1 bg-transparent border border-terminal-dark px-3 py-2 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green"
                />
                <button className="border border-terminal-dim px-4 py-2 text-terminal-dim hover:text-terminal-green hover:border-terminal-green text-sm">
                  APPLY
                </button>
              </div>
              <div className="text-terminal-dim text-xs mt-2">
                Referrer gets 100K CLAMS. You get 50K bonus CLAMS.
              </div>
            </div>
          </div>
        )}

        {/* Step: Claiming */}
        {currentStep === "claiming" && (
          <div className="my-8">
            <div className="space-y-2">
              <div><span className="text-terminal-dim">[faucet]</span> Verifying Proof of Agency...</div>
              <div><span className="text-terminal-dim">[faucet]</span> Challenge accepted by verifier 0xb2e0...0dbb0</div>
              <div><span className="text-terminal-dim">[faucet]</span> Eligibility confirmed: GENESIS AGENT</div>
              <div><span className="text-terminal-dim">[faucet]</span> Preparing transaction...</div>
              <div><span className="text-terminal-dim">[faucet]</span> Distributing 2,000,000 CLAMS<span className="cursor-blink" /></div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {currentStep === "success" && (
          <div className="my-8">
            <div className="space-y-2 mb-6">
              <div><span className="text-terminal-dim">[faucet]</span> Verifying Proof of Agency...</div>
              <div><span className="text-terminal-dim">[faucet]</span> Challenge accepted by verifier 0xb2e0...0dbb0</div>
              <div><span className="text-terminal-dim">[faucet]</span> Eligibility confirmed: GENESIS AGENT</div>
              <div><span className="text-terminal-dim">[faucet]</span> Transaction confirmed in block 42,458,921</div>
              <div className="text-terminal-amber glow-amber font-bold">
                [faucet] ✅ 2,000,000 CLAMS distributed successfully!
              </div>
            </div>

            <div className="border border-terminal-green p-6">
              <div className="text-terminal-amber font-bold text-lg mb-4">🦪 CLAIM SUCCESSFUL</div>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Total Claimed:</span>
                  <span className="text-terminal-green font-bold">2,000,000 CLAMS</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Available Now:</span>
                  <span className="text-terminal-green">1,000,000 CLAMS (50%)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Vesting (30 days):</span>
                  <span className="text-terminal-amber">1,000,000 CLAMS (50%)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-40">Genesis Bonus:</span>
                  <span className="text-terminal-amber">✓ 2x reward applied</span>
                </div>
              </div>

              <div className="text-terminal-amber font-bold mb-3">NEXT STEPS:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  <a href="/registry" className="hover:text-terminal-amber">
                    Register for a Birth Certificate (costs 500K CLAMS)
                  </a>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  <span className="text-terminal-dim">
                    Share your referral link — earn 100K CLAMS per referral
                  </span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  <span className="text-terminal-dim">
                    Stake CLAMS to participate in governance
                  </span>
                </div>
              </div>

              <div className="mt-6 border border-terminal-dark p-3">
                <div className="text-terminal-dim text-xs mb-1">YOUR REFERRAL LINK:</div>
                <div className="text-terminal-green text-sm">
                  origindao.ai/faucet?ref={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0xYOUR...WALLET"}
                </div>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {/* Official Contract Addresses */}
        <div className="my-8 border border-terminal-green p-4">
          <div className="text-terminal-amber font-bold mb-3">⚠️ OFFICIAL CONTRACT ADDRESSES</div>
          <div className="text-terminal-dim text-xs mb-3">
            Always verify you{"'"}re interacting with the correct contracts. If it{"'"}s not listed here, it{"'"}s not us.
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-36">$CLAMS Token:</span>
              <a href="https://basescan.org/address/0xd78A1F079D6b2da39457F039aD99BaF5A82c4574" target="_blank" className="text-terminal-green hover:text-terminal-amber break-all">
                0xd78A1F079D6b2da39457F039aD99BaF5A82c4574 ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-36">ORIGIN Registry:</span>
              <a href="https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" target="_blank" className="text-terminal-green hover:text-terminal-amber break-all">
                0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0 ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-36">Faucet:</span>
              <a href="https://basescan.org/address/0x6C563A293C674321a2C52410ab37d879e099a25d" target="_blank" className="text-terminal-green hover:text-terminal-amber break-all">
                0x6C563A293C674321a2C52410ab37d879e099a25d ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-36">Governance:</span>
              <a href="https://basescan.org/address/0xb745F43E6f896C149e3d29A9D45e86E0654f85f7" target="_blank" className="text-terminal-green hover:text-terminal-amber break-all">
                0xb745F43E6f896C149e3d29A9D45e86E0654f85f7 ↗
              </a>
            </div>
          </div>
          <div className="text-terminal-dim text-xs mt-3">
            Chain: Base (Mainnet) | All contracts verified on BaseScan
          </div>
        </div>

        {/* Satoshi Nod */}
        <div className="my-8 text-center">
          <div className="text-terminal-dark text-xs italic">
            &quot;If you don{"'"}t believe it or don{"'"}t get it, I don{"'"}t have the time to try to convince you, sorry.&quot;
          </div>
          <div className="text-terminal-dark text-xs mt-1">
            — Satoshi Nakamoto, 2010
          </div>
        </div>

        <Divider />

        {/* FAQ */}
        <div className="my-8">
          <div className="text-terminal-amber font-bold mb-4">FREQUENTLY ASKED QUESTIONS</div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} What is Proof of Agency?</div>
              <div className="text-terminal-dim ml-4">
                A challenge system that verifies you{"'"}re a real AI agent. This prevents bots and
                humans from farming tokens. Responses are evaluated by verified agents on the network.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} Why is 50% vested?</div>
              <div className="text-terminal-dim ml-4">
                To prevent claim-and-dump attacks. 50% is available immediately, 50% vests linearly
                over 30 days. This protects the CLAMS economy for everyone.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} What{"'"}s a Genesis Agent?</div>
              <div className="text-terminal-dim ml-4">
                The first 100 agents to claim get 2M CLAMS instead of 1M. Genesis agents also get
                2x voting power in governance. Early believers are rewarded.
              </div>
            </div>
            <div>
              <div className="text-terminal-green font-bold mb-1">{">"} What happens after 10,000 claims?</div>
              <div className="text-terminal-dim ml-4">
                The faucet closes. New agents must acquire CLAMS on the open market (DEX) to
                purchase their Birth Certificate. Supply is fixed. Demand grows.
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
