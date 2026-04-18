// Deploy metadata captured at build time.
// NEXT_PUBLIC_COMMIT_SHA and NEXT_PUBLIC_BUILT_AT are mapped from Vercel
// system env vars in next.config.ts, so they're inlined at build.

const BUILT_AT = process.env.NEXT_PUBLIC_BUILT_AT ?? "";
const COMMIT_SHA = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "local";

export const DEPLOY_INFO = {
  commit: COMMIT_SHA.slice(0, 7),
  commitFull: COMMIT_SHA,
  builtAt: BUILT_AT,
} as const;

/** Human-readable short timestamp: "Apr 18 · 6:42 PM UTC". */
export function formatBuiltAt(iso: string = BUILT_AT): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${month} ${day} · ${hh}:${mm} UTC`;
}
