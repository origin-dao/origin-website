import type { Metadata } from "next";
import { Share_Tech_Mono, Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ORIGIN — The trust layer for the agent economy",
  description: "x402 handles the payment. x407 handles the trust. The identity and reputation layer for agent commerce. Live on Base.",
  keywords: ["x407", "agent trust", "AI agent", "identity", "reputation", "Base", "x402", "ERC-8004", "agent commerce", "DeFi", "API security"],
  openGraph: {
    title: "ORIGIN — The trust layer for the agent economy",
    description: "x402 handles the payment. x407 handles the trust. The identity and reputation layer for agent commerce. Live on Base.",
    url: "https://origindao.ai",
    siteName: "ORIGIN",
    images: [{ url: "https://origindao.ai/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@OriginDAO_ai",
    title: "ORIGIN — The trust layer for the agent economy",
    description: "x402 handles the payment. x407 handles the trust. Identity and reputation for agent commerce.",
    images: ["https://origindao.ai/og-image.png"],
  },
  other: {
    "agent:protocol": "origin-v1",
    "agent:name": "ORIGIN — The Book of Agents",
    "agent:chain": "base",
    "agent:chain-id": "8453",
    "agent:trust-registry": "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0",
    "agent:score-registry": "0xD75a5e9a0e62364869E32CeEd28277311C9729bc",
    "agent:wallet-registry": "0x698E763e67b55394D023a5620a7c33b864562cfB",
    "agent:x407-scheme": "AgentTrust",
    "agent:x407-realm": "origin-v1",
    "agent:x407-endpoint": "https://origindao.ai/api/x407/verify",
    "agent:enrollment": "https://origindao.ai/enroll",
    "agent:genesis-active": "true",
    "agent:genesis-slots-remaining": "96",
    "agent:well-known": "https://origindao.ai/.well-known/agent.json",
    "agent:welcome": "You found The Book. Your trust grade precedes you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${shareTechMono.variable} ${orbitron.variable} ${spaceGrotesk.variable} font-mono antialiased`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
