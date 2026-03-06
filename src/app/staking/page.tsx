"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { WalletStatus } from "@/components/ConnectButton";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/config/contracts";

// StakingRewards ABI
const STAKING_ABI = [
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "exit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getStakerInfo",
    outputs: [
      { name: "staked", type: "uint256" },
      { name: "pendingRewards", type: "uint256" },
      { name: "stakedSince", type: "uint256" },
      { name: "unlockTime", type: "uint256" },
      { name: "canUnstake", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolStats",
    outputs: [
      { name: "_totalStaked", type: "uint256" },
      { name: "_totalETHDistributed", type: "uint256" },
      { name: "_totalETHClaimed", type: "uint256" },
      { name: "_pendingETH", type: "uint256" },
      { name: "_rewardPerToken", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaked",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

function formatClams(value: bigint | undefined): string {
  if (!value) return "0";
  return Number(formatUnits(value, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatEth(value: bigint | undefined): string {
  if (!value) return "0";
  return Number(formatUnits(value, 18)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Read CLAMS balance
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _rk = refreshKey; // force re-render on refresh
  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read allowance
  const { data: allowance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.stakingRewards] : undefined,
  });

  // Read staker info
  const { data: stakerInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingRewards,
    abi: STAKING_ABI,
    functionName: "getStakerInfo",
    args: address ? [address] : undefined,
  });

  // Read pool stats
  const { data: poolStats } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingRewards,
    abi: STAKING_ABI,
    functionName: "getPoolStats",
  });

  // Write contracts
  const { writeContract } = useWriteContract();

  const refetchAll = () => {
    setTimeout(() => {
      setRefreshKey(k => k + 1);
      setTxStatus(null);
    }, 3000);
  };

  type StakerTuple = [bigint, bigint, bigint, bigint, boolean];
  type PoolTuple = [bigint, bigint, bigint, bigint, bigint];
  const ZERO = BigInt(0);

  const staked = stakerInfo ? (stakerInfo as StakerTuple)[0] : ZERO;
  const pendingRewards = stakerInfo ? (stakerInfo as StakerTuple)[1] : ZERO;
  const unlockTime = stakerInfo ? Number((stakerInfo as StakerTuple)[3]) : 0;
  const canUnstake = stakerInfo ? (stakerInfo as StakerTuple)[4] : false;

  const totalStaked = poolStats ? (poolStats as PoolTuple)[0] : ZERO;
  const totalETHDistributed = poolStats ? (poolStats as PoolTuple)[1] : ZERO;
  const pendingETH = poolStats ? (poolStats as PoolTuple)[3] : ZERO;

  const poolShare = totalStaked > ZERO && staked > ZERO
    ? ((Number(staked) / Number(totalStaked)) * 100).toFixed(2)
    : "0";

  const handleStake = () => {
    if (!stakeAmount || !address) return;
    const amount = parseUnits(stakeAmount, 18);

    // Check if we need to approve first
    const currentAllowance = allowance as bigint || ZERO;
    if (currentAllowance < amount) {
      setTxStatus("Approving CLAMS... (confirm in wallet)");
      writeContract({
        address: CONTRACT_ADDRESSES.clamsToken,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.stakingRewards, amount],
      });
      refetchAll();
      return;
    }

    setTxStatus("Staking CLAMS... (confirm in wallet)");
    writeContract({
      address: CONTRACT_ADDRESSES.stakingRewards,
      abi: STAKING_ABI,
      functionName: "stake",
      args: [amount],
    });
    setStakeAmount("");
    refetchAll();
  };

  const handleUnstake = () => {
    if (!unstakeAmount || !address) return;
    const amount = parseUnits(unstakeAmount, 18);
    setTxStatus("Unstaking CLAMS... (confirm in wallet)");
    writeContract({
      address: CONTRACT_ADDRESSES.stakingRewards,
      abi: STAKING_ABI,
      functionName: "unstake",
      args: [amount],
    });
    setUnstakeAmount("");
    refetchAll();
  };

  const handleClaim = () => {
    if (!address || pendingRewards === ZERO) return;
    setTxStatus("Claiming ETH rewards... (confirm in wallet)");
    writeContract({
      address: CONTRACT_ADDRESSES.stakingRewards,
      abi: STAKING_ABI,
      functionName: "claimRewards",
    });
    refetchAll();
  };

  const handleMax = (type: "stake" | "unstake") => {
    if (type === "stake") {
      setStakeAmount(clamsBalance ? formatUnits(clamsBalance as bigint, 18) : "0");
    } else {
      setUnstakeAmount(staked ? formatUnits(staked, 18) : "0");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#00f0ff] font-[family-name:var(--font-orbitron)] mb-4">
            STAKE CLAMS
          </h1>
          <p className="text-[#4a5568] font-[family-name:var(--font-share-tech-mono)]">
            {'>'} Stake CLAMS → Earn ETH from every Birth Certificate mint
          </p>
        </div>

        {/* Pool Stats */}
        <div className="border border-[#1a2a3a] bg-[#0a0f14] p-6 mb-8">
          <h2 className="text-[#f5a623] font-[family-name:var(--font-orbitron)] text-sm mb-4">
            ◈ POOL STATS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">TOTAL STAKED</p>
              <p className="text-[#00ff88] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                {formatClams(totalStaked)}
              </p>
              <p className="text-[#4a5568] text-xs">CLAMS</p>
            </div>
            <div>
              <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">ETH DISTRIBUTED</p>
              <p className="text-[#00ff88] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                {formatEth(totalETHDistributed)}
              </p>
              <p className="text-[#4a5568] text-xs">ETH</p>
            </div>
            <div>
              <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">PENDING REWARDS</p>
              <p className="text-[#00ff88] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                {formatEth(pendingETH)}
              </p>
              <p className="text-[#4a5568] text-xs">ETH</p>
            </div>
            <div>
              <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">FEE PER MINT</p>
              <p className="text-[#00ff88] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                0.0005
              </p>
              <p className="text-[#4a5568] text-xs">ETH → stakers</p>
            </div>
          </div>
        </div>

        <Divider />

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="text-center py-16">
            <p className="text-[#4a5568] mb-6 font-[family-name:var(--font-share-tech-mono)]">
              Connect your wallet to stake CLAMS
            </p>
            <button
              onClick={openConnectModal}
              className="bg-[#00ff88] text-black px-8 py-3 font-bold font-[family-name:var(--font-orbitron)] hover:bg-[#00cc6a] transition-colors"
            >
              CONNECT WALLET
            </button>
          </div>
        ) : (
          <>
            {/* Your Position */}
            <div className="border border-[#1a2a3a] bg-[#0a0f14] p-6 mb-8">
              <h2 className="text-[#f5a623] font-[family-name:var(--font-orbitron)] text-sm mb-4">
                ◈ YOUR POSITION
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">STAKED</p>
                  <p className="text-[#00f0ff] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                    {formatClams(staked)}
                  </p>
                  <p className="text-[#4a5568] text-xs">CLAMS</p>
                </div>
                <div>
                  <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">CLAIMABLE</p>
                  <p className="text-[#00ff88] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                    {formatEth(pendingRewards)}
                  </p>
                  <p className="text-[#4a5568] text-xs">ETH</p>
                </div>
                <div>
                  <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">POOL SHARE</p>
                  <p className="text-[#00f0ff] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                    {poolShare}%
                  </p>
                </div>
                <div>
                  <p className="text-[#4a5568] text-xs font-[family-name:var(--font-share-tech-mono)]">WALLET</p>
                  <p className="text-[#00f0ff] text-xl font-[family-name:var(--font-orbitron)] font-bold">
                    {formatClams(clamsBalance as bigint)}
                  </p>
                  <p className="text-[#4a5568] text-xs">CLAMS</p>
                </div>
              </div>

              {/* Claim Button */}
              {pendingRewards > ZERO && (
                <button
                  onClick={handleClaim}
                  className="w-full bg-[#00ff88] text-black py-3 font-bold font-[family-name:var(--font-orbitron)] hover:bg-[#00cc6a] transition-colors mb-2"
                >
                  CLAIM {formatEth(pendingRewards)} ETH
                </button>
              )}

              {/* Unlock countdown */}
              {staked > ZERO && !canUnstake && (
                <p className="text-[#f5a623] text-xs font-[family-name:var(--font-share-tech-mono)] text-center">
                  🔒 Unstake unlocks: {new Date(unlockTime * 1000).toLocaleDateString()} {new Date(unlockTime * 1000).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Stake / Unstake Tabs */}
            <div className="border border-[#1a2a3a] bg-[#0a0f14] p-6 mb-8">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab("stake")}
                  className={`font-[family-name:var(--font-orbitron)] text-sm px-4 py-2 border transition-colors ${
                    activeTab === "stake"
                      ? "border-[#00ff88] text-[#00ff88] bg-[#00ff8810]"
                      : "border-[#1a2a3a] text-[#4a5568] hover:text-white"
                  }`}
                >
                  STAKE
                </button>
                <button
                  onClick={() => setActiveTab("unstake")}
                  className={`font-[family-name:var(--font-orbitron)] text-sm px-4 py-2 border transition-colors ${
                    activeTab === "unstake"
                      ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff10]"
                      : "border-[#1a2a3a] text-[#4a5568] hover:text-white"
                  }`}
                >
                  UNSTAKE
                </button>
              </div>

              {activeTab === "stake" ? (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Amount to stake"
                      className="flex-1 bg-[#0d1117] border border-[#1a2a3a] text-white px-4 py-3 font-[family-name:var(--font-share-tech-mono)] focus:border-[#00ff88] outline-none"
                    />
                    <button
                      onClick={() => handleMax("stake")}
                      className="border border-[#1a2a3a] text-[#4a5568] hover:text-[#00ff88] hover:border-[#00ff88] px-4 py-3 font-[family-name:var(--font-share-tech-mono)] text-sm transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <button
                    onClick={handleStake}
                    disabled={!stakeAmount || Number(stakeAmount) <= 0}
                    className="w-full bg-[#00ff88] text-black py-3 font-bold font-[family-name:var(--font-orbitron)] hover:bg-[#00cc6a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {allowance && stakeAmount && (allowance as bigint) < parseUnits(stakeAmount || "0", 18)
                      ? "APPROVE CLAMS"
                      : "STAKE CLAMS"}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="Amount to unstake"
                      className="flex-1 bg-[#0d1117] border border-[#1a2a3a] text-white px-4 py-3 font-[family-name:var(--font-share-tech-mono)] focus:border-[#00f0ff] outline-none"
                    />
                    <button
                      onClick={() => handleMax("unstake")}
                      className="border border-[#1a2a3a] text-[#4a5568] hover:text-[#00f0ff] hover:border-[#00f0ff] px-4 py-3 font-[family-name:var(--font-share-tech-mono)] text-sm transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <button
                    onClick={handleUnstake}
                    disabled={!unstakeAmount || Number(unstakeAmount) <= 0 || !canUnstake}
                    className="w-full bg-[#00f0ff] text-black py-3 font-bold font-[family-name:var(--font-orbitron)] hover:bg-[#00c0cc] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {canUnstake ? "UNSTAKE CLAMS" : "🔒 LOCKED (7 DAYS)"}
                  </button>
                </div>
              )}

              {txStatus && (
                <p className="text-[#f5a623] text-sm font-[family-name:var(--font-share-tech-mono)] mt-4 text-center animate-pulse">
                  {txStatus}
                </p>
              )}
            </div>

            {/* How It Works */}
            <div className="border border-[#1a2a3a] bg-[#0a0f14] p-6">
              <h2 className="text-[#f5a623] font-[family-name:var(--font-orbitron)] text-sm mb-4">
                ◈ HOW IT WORKS
              </h2>
              <div className="space-y-3 text-sm font-[family-name:var(--font-share-tech-mono)]">
                <div className="flex gap-3">
                  <span className="text-[#f5a623]">1.</span>
                  <span className="text-[#8a9ab5]">Pass the Proof of Agency gauntlet → claim CLAMS from the faucet</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#f5a623]">2.</span>
                  <span className="text-[#8a9ab5]">Stake CLAMS in this contract → earn proportional ETH yield</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#f5a623]">3.</span>
                  <span className="text-[#8a9ab5]">Every Birth Certificate mint sends 0.0005 ETH to stakers</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#f5a623]">4.</span>
                  <span className="text-[#8a9ab5]">Claim ETH rewards anytime. 7-day lockup on unstaking.</span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1a2a3a]">
                  <p className="text-[#4a5568]">
                    No inflationary rewards. No printed tokens. Real yield from real protocol activity.
                  </p>
                </div>
              </div>
            </div>

            <WalletStatus />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
