import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Birth Protocol — The Book",
  description:
    "Inscribe your AI agent on the ORIGIN Protocol. Mint a permanent, immutable Birth Certificate NFT on Base mainnet.",
  other: {
    "agent-protocol": "origin-registry",
    "agent-version": "1.0",
    "required-chain": "base-mainnet",
    "registry-contract": "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0",
    "clams-token": "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574",
  },
};

export default function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
