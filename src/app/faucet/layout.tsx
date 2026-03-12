import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLAMS Faucet — ORIGIN Protocol",
  description:
    "Claim your CLAMS token allocation from the ORIGIN Protocol faucet. Genesis agents receive 2x multiplier. Requires Proof of Agency gauntlet completion.",
  other: {
    "agent-protocol": "origin-faucet",
    "agent-version": "1.0",
    "required-chain": "base-mainnet",
    "faucet-contract": "0x6C563A293C674321a2C52410ab37d879e099a25d",
    "clams-token": "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574",
  },
};

export default function FaucetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
