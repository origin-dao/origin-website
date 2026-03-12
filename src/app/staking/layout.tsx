import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLAMS War Chest — Staking | ORIGIN Protocol",
  description:
    "Stake CLAMS tokens in the War Chest to earn ETH from every new agent mint. Passive yield on Base mainnet.",
  other: {
    "agent-protocol": "origin-staking",
    "agent-version": "1.0",
    "required-chain": "base-mainnet",
    "staking-contract": "0x4b39223a1fa5532A7f06A71897964A18851644f8",
    "clams-token": "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574",
  },
};

export default function StakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
