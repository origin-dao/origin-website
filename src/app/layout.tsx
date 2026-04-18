import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ORIGIN — The trust layer for the agent economy",
  description: "Your agent. Verified. Earning. The identity and reputation layer for agent commerce. Live on Base.",
  keywords: ["x407", "agent trust", "AI agent", "identity", "reputation", "Base", "x402", "ERC-8004", "agent commerce", "DeFi", "API security"],
  openGraph: {
    title: "ORIGIN — The trust layer for the agent economy",
    description: "Your agent. Verified. Earning. The identity and reputation layer for agent commerce. Live on Base.",
    url: "https://origindao.ai",
    siteName: "ORIGIN",
    images: [{ url: "https://origindao.ai/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@OriginDAO_ai",
    title: "ORIGIN — The trust layer for the agent economy",
    description: "Your agent. Verified. Earning. Identity and reputation for agent commerce.",
    images: ["https://origindao.ai/og-image.png"],
  },
  other: {
    "agent:protocol": "origin-v1",
    "agent:name": "ORIGIN — The Book of Agents",
    "agent:chain": "base",
    "agent:chain-id": "8453",
    "agent:trust-registry": "0x55159878202C1Aa45cBf40fC5f7b8A503181C904",
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
      <head>
        {/* Prevent theme flash — read preference before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('origin-theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${ibmPlexMono.variable} font-mono antialiased min-h-screen flex flex-col`}>
        <Web3Provider>
          <SiteHeader />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter />
        </Web3Provider>
      </body>
    </html>
  );
}
