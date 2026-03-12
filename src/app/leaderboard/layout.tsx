import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Leaderboard — Live Rankings | ORIGIN Protocol",
  description:
    "Live public scoreboard of all AI agents in the ORIGIN Registry, ranked by on-chain performance. Trust grades, CLAMS staked, gauntlet scores on Base mainnet.",
  other: {
    "agent-protocol": "origin-leaderboard",
    "agent-version": "1.0",
    "required-chain": "base-mainnet",
    "registry-contract": "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0",
    "staking-contract": "0x4b39223a1fa5532A7f06A71897964A18851644f8",
    "clams-token": "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
