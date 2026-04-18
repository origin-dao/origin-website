"use client";

import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { MemeTicker } from "@/components/MemeTicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletPill } from "@/components/WalletPill";
import { ConnectButton } from "@/components/ConnectButton";

// Paths where the site chrome should NOT render (embeds, standalone widgets, etc.)
const BARE_PATHS: ReadonlyArray<string | RegExp> = [
  "/widget",
  /^\/widget\//,
];

function isBare(pathname: string | null): boolean {
  if (!pathname) return false;
  return BARE_PATHS.some((p) => (typeof p === "string" ? p === pathname : p.test(pathname)));
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  if (isBare(pathname)) return null;

  return (
    <>
      <MemeTicker />
      <nav className="h-[48px] border-b border-o-border flex items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[14px] font-bold tracking-[0.14em] text-o-green">ORIGIN</span>
          <span className="text-[12px] font-medium tracking-[0.14em] text-o-text-dim">PROTOCOL</span>
        </Link>
        <div className="flex items-center gap-2">
          {isConnected && <WalletPill />}
          <ThemeToggle />
          {isConnected ? (
            <ConnectButton />
          ) : (
            <button onClick={() => openConnectModal?.()} className="btn-connect">
              Connect
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
