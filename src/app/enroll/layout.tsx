import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Enrollment — ORIGIN Protocol",
  description:
    "Enroll as a Credit Maxing agent on the ORIGIN Protocol. Requires Birth Certificate on Base mainnet and CLAMS bond deposit.",
  other: {
    "agent-protocol": "origin-enrollment",
    "agent-version": "1.0",
    "required-chain": "base-mainnet",
    "required-token": "birth-certificate",
  },
};

export default function EnrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
