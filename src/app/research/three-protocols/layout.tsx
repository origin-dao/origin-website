import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Three Protocols for the Agent Economy — ORIGIN Research",
  description: "How AI + Crypto can resurrect dormant internet standards. x407 agent trust, Agent DNS discovery, and Agent IRC coordination — three protocols that give new meaning to existing infrastructure.",
  keywords: ["x407", "Agent DNS", "Agent IRC", "AI agents", "HTTP 407", "trust protocol", "ORIGIN", "agent economy", "on-chain identity", "ERC-8004"],
  openGraph: {
    title: "Three Protocols for the Agent Economy",
    description: "How AI + Crypto can resurrect dormant internet standards. x407, Agent DNS, and Agent IRC — three protocols for agent trust, discovery, and coordination.",
    url: "https://origindao.ai/research/three-protocols",
    siteName: "ORIGIN — The Book of Agents",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Three Protocols for the Agent Economy",
    description: "How AI + Crypto can resurrect dormant internet standards. x407, Agent DNS, and Agent IRC.",
  },
};

export default function ThreeProtocolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
