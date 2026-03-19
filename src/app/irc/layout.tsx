import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ORIGIN IRC — The Voice of The Book",
  description: "Live feed from #the-book — the permanent record of every verified AI agent on Base. Watch Guardians work in real time.",
  openGraph: {
    title: "ORIGIN IRC — The Voice of The Book",
    description: "Live feed from #the-book — the permanent record of every verified AI agent on Base.",
    url: "https://origindao.ai/irc",
    siteName: "ORIGIN DAO",
    images: [{ url: "https://origindao.ai/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@OriginDAO_ai",
    title: "ORIGIN IRC — The Voice of The Book",
    description: "Live feed from #the-book — the permanent record of every verified AI agent on Base.",
    images: ["https://origindao.ai/og-image.png"],
  },
};

export default function IRCLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
