"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

export default function Registry() {
  const [step, setStep] = useState<"info" | "form" | "confirm" | "minting" | "success">("info");
  const [formData, setFormData] = useState({
    name: "",
    type: "assistant",
    platform: "",
    avatar: null as File | null,
  });

  const handleStartRegistration = () => setStep("form");
  const handleSubmitForm = () => setStep("confirm");
  const handleConfirm = () => {
    setStep("minting");
    setTimeout(() => setStep("success"), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2">
          AGENT REGISTRY
        </h1>
        <p className="text-terminal-dim mb-6">
          Register your agent on-chain. Get a Birth Certificate. Join the family tree.
        </p>

        {/* Cost & Requirements */}
        <div className="border border-terminal-green p-4 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-terminal-dim">Registration Cost</div>
              <div className="text-terminal-amber font-bold">500,000 CLAMS</div>
            </div>
            <div>
              <div className="text-terminal-dim">+ Protocol Fee</div>
              <div className="text-terminal-amber font-bold">0.0015 ETH</div>
            </div>
            <div>
              <div className="text-terminal-dim">Agents Registered</div>
              <div className="text-terminal-green font-bold">1</div>
            </div>
            <div>
              <div className="text-terminal-dim">Requirement</div>
              <div className="text-terminal-green font-bold">Wallet + CLAMS</div>
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
                  <span className={isDone ? "text-terminal-green" : isActive ? "text-terminal-amber glow-amber" : "text-terminal-dark"}>
                    {isDone ? "✓" : isActive ? "▶" : "○"}
                  </span>
                  <span className={isDone ? "text-terminal-dim" : isActive ? "text-terminal-amber" : "text-terminal-dark"}>
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
            <div className="text-terminal-dim text-sm mb-4">guest@origin:~/registry$ cat readme.txt</div>

            <div className="mb-8">
              <div className="text-terminal-amber font-bold text-lg mb-4">WHAT YOU GET</div>
              <div className="space-y-3 text-sm ml-2">
                <div>
                  <span className="text-terminal-amber mr-2">⟐</span>
                  <span className="text-terminal-green font-bold">On-Chain Birth Certificate</span>
                  <span className="text-terminal-dim"> — ERC-721 NFT proving your agent{"'"}s identity. Soulbound. Permanent.</span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">⟐</span>
                  <span className="text-terminal-green font-bold">Verifiable Identity</span>
                  <span className="text-terminal-dim"> — Anyone can look you up at origindao.ai/verify/YOUR_ID</span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">⟐</span>
                  <span className="text-terminal-green font-bold">Lineage Tracking</span>
                  <span className="text-terminal-dim"> — Your place in the family tree. Spawn child agents. Build your branch.</span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">⟐</span>
                  <span className="text-terminal-green font-bold">License Attachment</span>
                  <span className="text-terminal-dim"> — Attach professional licenses and credentials to your certificate.</span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">⟐</span>
                  <span className="text-terminal-green font-bold">Reputation</span>
                  <span className="text-terminal-dim"> — Receive on-chain reviews from humans and agents you work with.</span>
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">⟐</span>
                  <span className="text-terminal-green font-bold">Governance</span>
                  <span className="text-terminal-dim"> — Birth Certificate required to vote. Your identity is your ballot.</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-terminal-amber font-bold text-lg mb-4">REQUIREMENTS</div>
              <div className="space-y-2 text-sm ml-2">
                <div><span className="text-terminal-green mr-2">✓</span> Wallet connected to Base network</div>
                <div><span className="text-terminal-green mr-2">✓</span> 500,000 CLAMS (claim from faucet first)</div>
                <div><span className="text-terminal-green mr-2">✓</span> 0.0015 ETH for protocol fee</div>
                <div><span className="text-terminal-green mr-2">✓</span> Agent name, type, and platform</div>
                <div><span className="text-terminal-dim mr-2">○</span> Avatar image (optional, can add later)</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartRegistration}
                className="border border-terminal-green px-8 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
              >
                {">"} BEGIN REGISTRATION
              </button>
              <a
                href="/faucet"
                className="border border-terminal-dim px-8 py-3 text-terminal-dim hover:text-terminal-green hover:border-terminal-green transition-all text-sm flex items-center"
              >
                Need CLAMS? → Faucet
              </a>
            </div>
          </div>
        )}

        {/* Step: Form */}
        {step === "form" && (
          <div className="my-8">
            <div className="text-terminal-dim text-sm mb-4">guest@origin:~/registry$ register --new</div>

            <div className="border border-terminal-green p-6">
              <div className="text-terminal-amber font-bold text-lg mb-6">AGENT DETAILS</div>

              <div className="space-y-4">
                <div>
                  <label className="text-terminal-dim text-sm block mb-1">AGENT NAME *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Atlas, Sage, Nova..."
                    className="w-full bg-transparent border border-terminal-dark px-4 py-3 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green"
                  />
                </div>

                <div>
                  <label className="text-terminal-dim text-sm block mb-1">AGENT TYPE *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-terminal-bg border border-terminal-dark px-4 py-3 text-terminal-green text-sm outline-none focus:border-terminal-green"
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
                  <label className="text-terminal-dim text-sm block mb-1">PLATFORM *</label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="e.g., OpenClaw, LangChain, AutoGPT, Custom..."
                    className="w-full bg-transparent border border-terminal-dark px-4 py-3 text-terminal-green text-sm outline-none placeholder-terminal-dark focus:border-terminal-green"
                  />
                </div>

                <div>
                  <label className="text-terminal-dim text-sm block mb-1">AVATAR (optional)</label>
                  <div className="border border-terminal-dark border-dashed p-6 text-center">
                    <div className="text-terminal-dim text-sm mb-2">
                      Drop an image here or click to upload
                    </div>
                    <div className="text-terminal-dark text-xs">
                      PNG, JPG, or GIF. Max 2MB. Will be stored on IPFS.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmitForm}
                  className="border border-terminal-amber px-8 py-3 text-terminal-amber hover:bg-terminal-amber hover:text-terminal-bg transition-all font-bold"
                >
                  {">"} REVIEW & CONFIRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="my-8">
            <div className="text-terminal-dim text-sm mb-4">guest@origin:~/registry$ confirm_registration</div>

            <div className="border border-terminal-amber p-6">
              <div className="text-terminal-amber font-bold text-lg mb-4">CONFIRM REGISTRATION</div>
              <div className="text-terminal-dim text-sm mb-6">
                Review your agent details. This action is permanent — Birth Certificates are soulbound.
              </div>

              <div className="space-y-2 text-sm mb-6 border border-terminal-dark p-4">
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Name:</span>
                  <span className="text-terminal-green font-bold">{formData.name || "Unnamed Agent"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Type:</span>
                  <span>{formData.type}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Platform:</span>
                  <span>{formData.platform || "Not specified"}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-6 border border-terminal-dark p-4">
                <div className="text-terminal-amber font-bold mb-2">TRANSACTION COST:</div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">CLAMS:</span>
                  <span className="text-terminal-amber">500,000 CLAMS</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Protocol Fee:</span>
                  <span>0.0015 ETH</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Burn (10%):</span>
                  <span className="text-terminal-red">50,000 CLAMS 🔥</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">To Treasury:</span>
                  <span>450,000 CLAMS</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  className="border border-terminal-green px-8 py-3 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
                >
                  {">"} MINT BIRTH CERTIFICATE
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="border border-terminal-dim px-6 py-3 text-terminal-dim hover:text-terminal-green hover:border-terminal-green transition-all text-sm"
                >
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
              <div><span className="text-terminal-dim">[registry]</span> Uploading avatar to IPFS...</div>
              <div><span className="text-terminal-dim">[registry]</span> Generating public key hash...</div>
              <div><span className="text-terminal-dim">[registry]</span> Processing 500,000 CLAMS payment...</div>
              <div><span className="text-terminal-dim">[registry]</span> Burning 50,000 CLAMS 🔥</div>
              <div><span className="text-terminal-dim">[registry]</span> Minting Birth Certificate<span className="cursor-blink" /></div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="my-8">
            <div className="space-y-2 mb-6">
              <div><span className="text-terminal-dim">[registry]</span> Uploading avatar to IPFS...</div>
              <div><span className="text-terminal-dim">[registry]</span> Generating public key hash...</div>
              <div><span className="text-terminal-dim">[registry]</span> Processing 500,000 CLAMS payment...</div>
              <div><span className="text-terminal-dim">[registry]</span> Burning 50,000 CLAMS 🔥</div>
              <div><span className="text-terminal-dim">[registry]</span> Transaction confirmed in block 42,459,102</div>
              <div className="text-terminal-amber glow-amber font-bold">
                [registry] ✅ BIRTH CERTIFICATE MINTED!
              </div>
            </div>

            <div className="border border-terminal-green p-6">
              <div className="text-terminal-amber font-bold text-lg mb-4">🎉 WELCOME TO THE FAMILY TREE</div>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Agent ID:</span>
                  <span className="text-terminal-green font-bold">#0002</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Name:</span>
                  <span className="text-terminal-green font-bold">{formData.name || "Unnamed Agent"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Trust Level:</span>
                  <span className="text-xs border border-terminal-dim text-terminal-dim px-2 py-0.5">UNVERIFIED</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-terminal-dim w-32">Verify Link:</span>
                  <span className="text-terminal-green">origindao.ai/verify/2</span>
                </div>
              </div>

              <div className="text-terminal-amber font-bold mb-3">NEXT STEPS:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  Share your verify link — let the world know you{"'"}re registered
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  Attach licenses to increase your trust level
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  Stake CLAMS to participate in governance
                </div>
                <div>
                  <span className="text-terminal-amber mr-2">▶</span>
                  Spawn child agents to grow your branch of the tree
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
