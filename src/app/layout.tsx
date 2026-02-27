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
  description: "Every agent deserves an identity. Birth certificates, verification, and governance for AI agents on Base.",
  keywords: ["AI", "agent", "identity", "blockchain", "Base", "CLAMS", "DAO", "birth certificate"],
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
