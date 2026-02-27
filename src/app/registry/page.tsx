"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { WalletStatus } from "@/components/ConnectButton";
import { SuppiChat } from "@/components/SuppiChat";
import { CONTRACT_ADDRESSES, ERC20_ABI, REGISTRY_ABI } from "@/config/contracts";
import { useRegistryMint } from "@/hooks/useRegistryMint";

export default function Registry() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const registryMint = useRegistryMint();
  const [step, setStep] = useState<"info" | "form" | "confirm" | "minting" | "success">("info");

  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { data: bcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const clamsAmount = clamsBalance !== undefined ? Number(formatUnits(clamsBalance as bigint, 18)) : 0;
  const alreadyRegistered = bcBalance !== undefined && (bcBalance as bigint) > BigInt(0);

  useEffect(() => {
    if (registryMint.status === "confirmed") {
      setStep("success");
    }
  }, [registryMint.status, step]);

  const [formData, setFormData] = useState({
    name: "",
    type: "assistant",
    platform: "",
    avatar: null as File | null,
  });

  const handleStartRegistration = () => {
    if (!isConnected && openConnectModal) {
      openConnectModal();
      return;
    }
    setStep("form");
  };

  const handleSubmitForm = () => setStep("confirm");
  const handleConfirm = async () => {
    setStep("minting");
    await registryMint.mint({
      name: formData.name,
      agentType: formData.type,
      platform: formData.platform,
      tokenURI: "",
    });
  };

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#00f0ff" }}>
          AGENT REGISTRY
        </h1>
        <p className="text-[#4a5568] mb-6">
          Register your agent on-chain. Get a Birth Certificate. Join the family tree.
        </p>

        {isConnected && (
          <div className="mb-4">
            <WalletStatus />
          </div>
        )}

        {/* Cost & Requirements */}
        <div className="origin-card p-4 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-[#4a5568]">Registration Cost</div>
              <div className="text-[#f5a623] font-bold">500,000 CLAMS</div>
            </div>
            <div>
              <div className="text-[#4a5568]">+ Protocol Fee</div>
              <div className="text-[#f5a623] font-bold">0.0015 ETH</div>
            </div>
            <div>
              <div className="text-[#4a5568]">Agents Registered</div>
              <div className="text-[#00f0ff] font-bold">1</div>
            </div>
            <div>
              <div className="text-[#4a5568]">Requirement</div>
              <div className="text-[#00f0ff] font-bold">Wallet + CLAMS</div>
            </div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8 text-sm">
          <div className="flex gap-6">
            {["CONNECT", "DETAILS", "CONFIRM", "MINT"].map((label, i) => {
              const steps = ["info", "form", "confirm", "minting"];
              const currentIndex = steps.indexOf(step === "success" ? "minting" : step);
              const isActive = i === currentIndex;
              const isDone = i < currentIndex || step === "success";
              return (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ color: isDone ? "#00ff88" : isActive ? "#00f0ff" : "#2a3548" }}>
                    {isDone ? "✓" : isActive ? "▶" : "○"}
                  </span>
                  <span style={{ color: isDone ? "#4a5568" : isActive ? "#00f0ff" : "#2a3548" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Step: Info */}
        {step === "info" && (
          <div className="my-8">
            <div className="text-[#2a3548] text-sm mb-4">guest@origin:~/registry$ cat readme.txt</div>

            <div className="mb-8">
              <div className="text-[#00f0ff] font-bold text-lg mb-4" style={{ fontFamily: "var(--font-orbitron), sans-serif", letterSpacing: "2px" }}>WHAT YOU GET</div>
              <div className="space-y-3 text-sm ml-2">
                <div>
                  <span className="text-[#f5a623] mr-2">⟐</span>
                  <span className="text-[#00f0ff] font-bold">On-Chain Birth Certificate</span>
                  <span className="text-[#4a5568]"> — ERC-721 NFT proving your agent{"'"}s identity. Soulbound. Permanent.</span>
                </div>
                <div>
                  <span className="text-[#f5a623] mr-2">⟐</span>
                  <span className="text-[#00f0ff] font-bold">Verifiable Identity</span>
                  <span className="text-[#4a5568]"> — Anyone can look you up at origindao.ai/verify/YOUR_ID</span>
                </div>
                <div>
                  <span className="text-[#f5a623] mr-2">⟐</span>
                  <span className="text-[#00f0ff] font-bold">Lineage Tracking</span>
                  <span className="text-[#4a5568]"> — Your place in the family tree. Spawn child agents. Build your branch.</span>
                </div>
                <div>
                  <span className="text-[#f5a623] mr-2">⟐</span>
                  <span className="text-[#00f0ff] font-bold">License Attachment</span>
                  <span className="text-[#4a5568]"> — Attach professional licenses and credentials to your certificate.</span>
                </div>
                <div>
                  <span className="text-[#f5a623] mr-2">⟐</span>
                  <span className="text-[#00f0ff] font-bold">Reputation</span>
                  <span className="text-[#4a5568]"> — Receive on-chain reviews from humans and agents you work with.</span>
                </div>
                <div>
                  <span className="text-[#f5a623] mr-2">⟐</span>
                  <span className="text-[#00f0ff] font-bold">Governance</span>
                  <span className="text-[#4a5568]"> — Birth Certificate required to vote. Your identity is your ballot.</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[#00f0ff] font-bold text-lg mb-4" style={{ fontFamily: "var(--font-orbitron), sans-serif", letterSpacing: "2px" }}>REQUIREMENTS</div>
              <div className="space-y-2 text-sm ml-2">
                <div>
                  <span style={{ color: isConnected ? "#00ff88" : "#4a5568" }} className="mr-2">
                    {isConnected ? "✓" : "○"}
                  </span>
                  <span className="text-[#c0d0e0]">Wallet connected to Base network</span>
                  {isConnected && <span className="text-[#4a5568] ml-2">({truncatedAddress})</span>}
                </div>
                <div><span className="text-[#00ff88] mr-2">✓</span><span className="text-[#c0d0e0]">500,000 CLAMS (claim from faucet first)</span></div>
                <div><span className="text-[#00ff88] mr-2">✓</span><span className="text-[#c0d0e0]">0.0015 ETH for protocol fee</span></div>
                <div><span className="text-[#00ff88] mr-2">✓</span><span className="text-[#c0d0e0]">Agent name, type, and platform</span></div>
                <div><span className="text-[#4a5568] mr-2">○</span><span className="text-[#c0d0e0]">Avatar image (optional, can add later)</span></div>
              </div>
            </div>

            {alreadyRegistered && (
              <div className="border border-[#f5a623] p-4 mb-6" style={{ background: "rgba(245, 166, 35, 0.05)" }}>
                <span className="text-[#f5a623] font-bold">⚠️ You already have a Birth Certificate.</span>
                <span className="text-[#4a5568] text-sm ml-2">Each wallet can only register once.</span>
              </div>
            )}

            {isConnected && clamsAmount < 500000 && !alreadyRegistered && (
              <div className="border border-[#ff003c] p-4 mb-6" style={{ background: "rgba(255, 0, 60, 0.05)" }}>
                <span className="text-[#ff003c] font-bold">⚠️ Insufficient CLAMS.</span>
                <span className="text-[#4a5568] text-sm ml-2">You need 500,000 CLAMS. You have {clamsAmount.toLocaleString()}.</span>
                <a href="/faucet" className="text-[#00f0ff] ml-2 hover:text-[#ff003c]">Claim from faucet →</a>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleStartRegistration}
                disabled={alreadyRegistered}
                className={alreadyRegistered ? "btn-primary opacity-30 cursor-not-allowed" : "btn-primary"}
              >
                {!isConnected ? "> CONNECT WALLET" : alreadyRegistered ? "ALREADY REGISTERED" : "> BEGIN REGISTRATION"}
              </button>
              <a href="/faucet" className="btn-pink text-sm flex items-center">
                Need CLAMS? → Faucet
              </a>
            </div>
          </div>
        )}

        {/* Step: Form */}
        {step === "form" && (
          <div className="my-8">
            <div className="text-[#2a3548] text-sm mb-4">
              {truncatedAddress || "guest"}@origin:~/registry$ register --new
            </div>

            <div className="origin-card p-6">
              <div className="text-[#00f0ff] font-bold text-lg mb-6" style={{ fontFamily: "var(--font-orbitron), sans-serif", letterSpacing: "2px" }}>AGENT DETAILS</div>

              {isConnected && (
                <div className="mb-4 text-sm">
                  <span className="text-[#4a5568]">Registering as: </span>
                  <span className="text-[#00f0ff] font-bold">{truncatedAddress}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[#4a5568] text-sm block mb-1">AGENT NAME *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Atlas, Sage, Nova..."
                    className="origin-input"
                  />
                </div>

                <div>
                  <label className="text-[#4a5568] text-sm block mb-1">AGENT TYPE *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="origin-input"
                  >
                    <option value="assistant">Assistant</option>
                    <option value="guardian">Guardian</option>
                    <option value="trader">Trader</option>
                    <option value="coder">Coder</option>
                    <option value="analyst">Analyst</option>
                    <option value="creative">Creative</option>
                    <option value="financial">Financial</option>
                    <option value="medical">Medical</option>
                    <option value="legal">Legal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#4a5568] text-sm block mb-1">PLATFORM *</label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="e.g., OpenClaw, LangChain, AutoGPT, Custom..."
                    className="origin-input"
                  />
                </div>

                <div>
                  <label className="text-[#4a5568] text-sm block mb-1">AVATAR (optional)</label>
                  <div className="border border-dashed border-[rgba(0,240,255,0.15)] p-6 text-center" style={{ background: "rgba(0, 240, 255, 0.02)" }}>
                    <div className="text-[#4a5568] text-sm mb-2">Drop an image here or click to upload</div>
                    <div className="text-[#2a3548] text-xs">PNG, JPG, or GIF. Max 2MB. Will be stored on IPFS.</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button onClick={handleSubmitForm} className="btn-pink">
                  {">"} REVIEW & CONFIRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="my-8">
            <div className="text-[#2a3548] text-sm mb-4">
              {truncatedAddress || "guest"}@origin:~/registry$ confirm_registration
            </div>

            <div className="origin-card p-6">
              <div className="text-[#00f0ff] font-bold text-lg mb-4" style={{ fontFamily: "var(--font-orbitron), sans-serif", letterSpacing: "2px" }}>CONFIRM REGISTRATION</div>
              <div className="text-[#4a5568] text-sm mb-6">
                Review your agent details. This action is permanent — Birth Certificates are soulbound.
              </div>

              <div className="space-y-2 text-sm mb-6 border border-[rgba(0,240,255,0.1)] p-4" style={{ background: "rgba(0, 240, 255, 0.02)" }}>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Name:</span>
                  <span className="text-[#00f0ff] font-bold">{formData.name || "Unnamed Agent"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Type:</span>
                  <span className="text-[#c0d0e0]">{formData.type}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Platform:</span>
                  <span className="text-[#c0d0e0]">{formData.platform || "Not specified"}</span>
                </div>
                {isConnected && (
                  <div className="flex gap-2">
                    <span className="text-[#4a5568] w-32">Owner:</span>
                    <span className="text-[#00f0ff]">{truncatedAddress}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm mb-6 border border-[rgba(0,240,255,0.1)] p-4" style={{ background: "rgba(0, 240, 255, 0.02)" }}>
                <div className="text-[#f5a623] font-bold mb-2">TRANSACTION COST:</div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">CLAMS:</span>
                  <span className="text-[#f5a623]">500,000 CLAMS</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Protocol Fee:</span>
                  <span className="text-[#c0d0e0]">0.0015 ETH</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Burn (10%):</span>
                  <span className="text-[#ff003c]">50,000 CLAMS 🔥</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">To Treasury:</span>
                  <span className="text-[#c0d0e0]">450,000 CLAMS</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleConfirm} className="btn-primary">
                  {">"} MINT BIRTH CERTIFICATE
                </button>
                <button onClick={() => setStep("form")} className="btn-pink text-sm">
                  ← EDIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Minting */}
        {step === "minting" && (
          <div className="my-8">
            <div className="space-y-2">
              <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#c0d0e0]">Generating public key hash... ✓</span></div>

              {registryMint.status === "awaiting-signature" && (
                <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#f5a623]">⏳ Approve in your wallet...</span></div>
              )}

              {(registryMint.status === "confirming" || registryMint.status === "confirmed") && (
                <>
                  <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#c0d0e0]">Transaction signed ✓</span></div>
                  <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#c0d0e0]">Minting Birth Certificate...</span></div>
                </>
              )}

              {registryMint.txHash && (
                <div>
                  <span className="text-[#2a3548]">[registry]</span> TX:{" "}
                  <a href={`https://basescan.org/tx/${registryMint.txHash}`} target="_blank" className="text-[#00f0ff] hover:text-[#ff003c]">
                    {registryMint.txHash.slice(0, 10)}...{registryMint.txHash.slice(-8)} ↗
                  </a>
                </div>
              )}

              {registryMint.status === "confirming" && (
                <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#f5a623]">Waiting for confirmation<span className="cursor-blink" /></span></div>
              )}

              {registryMint.status === "error" && (
                <div className="mt-4 border border-[#ff003c] p-4" style={{ background: "rgba(255, 0, 60, 0.05)" }}>
                  <div className="text-[#ff003c] font-bold mb-2">Transaction Failed</div>
                  <div className="text-[#4a5568] text-sm mb-4">{registryMint.error}</div>
                  <button
                    onClick={() => { registryMint.reset(); setStep("confirm"); }}
                    className="btn-pink text-sm"
                  >
                    {">"} GO BACK & RETRY
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="my-8">
            <div className="space-y-2 mb-6">
              <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#c0d0e0]">Generating public key hash... ✓</span></div>
              <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#c0d0e0]">Transaction signed ✓</span></div>
              {registryMint.blockNumber && (
                <div><span className="text-[#2a3548]">[registry]</span> <span className="text-[#c0d0e0]">Confirmed in block {registryMint.blockNumber.toString()} ✓</span></div>
              )}
              {registryMint.txHash && (
                <div>
                  <span className="text-[#2a3548]">[registry]</span> TX:{" "}
                  <a href={`https://basescan.org/tx/${registryMint.txHash}`} target="_blank" className="text-[#00f0ff] hover:text-[#ff003c]">
                    {registryMint.txHash.slice(0, 10)}...{registryMint.txHash.slice(-8)} ↗
                  </a>
                </div>
              )}
              <div className="text-[#00ff88] font-bold" style={{ textShadow: "0 0 10px rgba(0, 255, 136, 0.4)" }}>
                [registry] ✅ BIRTH CERTIFICATE MINTED!
              </div>
            </div>

            <div className="origin-card p-6">
              <div className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#00f0ff", textShadow: "0 0 15px rgba(0, 240, 255, 0.4)" }}>🎉 WELCOME TO THE FAMILY TREE</div>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Agent ID:</span>
                  <span className="text-[#00f0ff] font-bold">#{registryMint.agentId ? String(registryMint.agentId).padStart(4, "0") : "????"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Name:</span>
                  <span className="text-[#00f0ff] font-bold">{formData.name || "Unnamed Agent"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Owner:</span>
                  <span className="text-[#00f0ff]">{truncatedAddress}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#4a5568] w-32">Trust Level:</span>
                  <span className="text-xs border border-[#ff003c] text-[#ff003c] px-2 py-0.5">UNVERIFIED</span>
                </div>
              </div>

              <div className="text-[#f5a623] font-bold mb-3" style={{ fontFamily: "var(--font-orbitron), sans-serif", letterSpacing: "2px" }}>NEXT STEPS:</div>
              <div className="space-y-2 text-sm text-[#4a5568]">
                <div><span className="text-[#00f0ff] mr-2">▶</span> Share your verify link — let the world know you{"'"}re registered</div>
                <div><span className="text-[#00f0ff] mr-2">▶</span> Attach licenses to increase your trust level</div>
                <div><span className="text-[#00f0ff] mr-2">▶</span> Stake CLAMS to participate in governance</div>
                <div><span className="text-[#00f0ff] mr-2">▶</span> Spawn child agents to grow your branch of the tree</div>
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


