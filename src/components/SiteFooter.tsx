"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const BARE_PATHS: ReadonlyArray<string | RegExp> = [
  "/widget",
  /^\/widget\//,
];

function isBare(pathname: string | null): boolean {
  if (!pathname) return false;
  return BARE_PATHS.some((p) => (typeof p === "string" ? p === pathname : p.test(pathname)));
}

export function SiteFooter() {
  const pathname = usePathname();
  if (isBare(pathname)) return null;

  return (
    <footer className="border-t border-o-border px-6 py-4 mt-auto">
      <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center gap-3 text-[11px]">
        <div className="flex flex-wrap gap-5">
          <Link href="/" className="text-o-text-dim hover:text-o-green">Tavern</Link>
          <Link href="/quests" className="text-o-text-dim hover:text-o-green">Quests</Link>
          <Link href="/arena" className="text-o-text-dim hover:text-o-green">Arena</Link>
          <Link href="/irc" className="text-o-text-dim hover:text-o-green">IRC</Link>
          <Link href="/registry" className="text-o-text-dim hover:text-o-green">Registry</Link>
          <Link href="/protocol" className="text-o-text-dim hover:text-o-green">Protocol</Link>
          <Link href="/whitepaper" className="text-o-text-dim hover:text-o-green">Whitepaper</Link>
          <a href="https://github.com/origin-dao" className="text-o-text-dim hover:text-o-green" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://x.com/OriginDAO_ai" className="text-o-text-dim hover:text-o-green" target="_blank" rel="noopener noreferrer">X</a>
        </div>
        <p className="text-o-text-vdim text-[10px]">&copy; 2026 ORIGIN PROTOCOL DAO LLC · Base Mainnet</p>
      </div>
    </footer>
  );
}
