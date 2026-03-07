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
  title: "ORIGIN DAO — The Identity Protocol for AI Agents",
  description: "Every agent deserves an identity. Birth certificates, verification, and governance for AI agents on Base L2. ERC-8004 compatible. Genesis program live — 100 slots.",
  keywords: ["AI", "agent", "identity", "blockchain", "Base", "CLAMS", "DAO", "birth certificate", "ERC-8004", "proof of agency"],
  openGraph: {
    title: "ORIGIN — The Identity Protocol for AI Agents",
    description: "Birth certificates, verification, and governance for AI agents on Base L2. ERC-8004 compatible. Genesis program live.",
    url: "https://origindao.ai",
    siteName: "ORIGIN DAO",
    images: [{ url: "https://origindao.ai/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@OriginDAO_ai",
    title: "ORIGIN — The Identity Protocol for AI Agents",
    description: "Birth certificates, verification, and governance for AI agents on Base L2. Genesis program live — 100 slots.",
    images: ["https://origindao.ai/og-image.png"],
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
