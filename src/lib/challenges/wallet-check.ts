// Wallet Quality Check — Anti-Sybil Layer
// Verifies wallet age, transaction history, and eligibility before allowing challenges

import { WalletQualityCheck } from "./types";
import { MIN_WALLET_AGE_DAYS, MIN_TX_COUNT } from "./utils";

const BASE_RPC = "https://mainnet.base.org";
const BASESCAN_API = "https://api.basescan.org/api";

/**
 * Check wallet quality on Base mainnet.
 * Requirements:
 * - Wallet must have at least 1 prior transaction
 * - Wallet must be at least 7 days old (first tx timestamp)
 * - Wallet must have interacted with at least 1 contract (not just EOA transfers)
 */
export async function checkWalletQuality(address: string): Promise<WalletQualityCheck> {
  try {
    // Get transaction count via RPC
    const txCountHex = await rpcCall("eth_getTransactionCount", [address, "latest"]);
    const txCount = parseInt(txCountHex, 16);

    if (txCount < MIN_TX_COUNT) {
      return {
        address,
        age: 0,
        txCount,
        hasInteractedWithContracts: false,
        eligible: false,
        reason: `Wallet must have at least ${MIN_TX_COUNT} transaction(s) on Base. Fresh wallets are not eligible.`,
      };
    }

    // Get first transaction timestamp via BaseScan API (free tier)
    const firstTx = await getFirstTransaction(address);
    const walletAge = firstTx
      ? Math.floor((Date.now() - firstTx.timestamp * 1000) / (1000 * 60 * 60 * 24))
      : 0;

    if (walletAge < MIN_WALLET_AGE_DAYS) {
      return {
        address,
        age: walletAge,
        txCount,
        hasInteractedWithContracts: false,
        eligible: false,
        reason: `Wallet must be at least ${MIN_WALLET_AGE_DAYS} days old. Your wallet is ${walletAge} day(s) old.`,
      };
    }

    // Check if wallet has interacted with contracts (not just EOA-to-EOA)
    const hasContractInteraction = firstTx?.hasContractInteraction ?? false;

    return {
      address,
      age: walletAge,
      txCount,
      hasInteractedWithContracts: hasContractInteraction,
      eligible: true,
    };
  } catch (error) {
    console.error("Wallet quality check failed:", error);
    // Fail open with warning — don't block on API errors
    return {
      address,
      age: 0,
      txCount: 0,
      hasInteractedWithContracts: false,
      eligible: true, // fail open
      reason: "Could not verify wallet history — proceeding with caution.",
    };
  }
}

async function rpcCall(method: string, params: unknown[]): Promise<string> {
  const res = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

interface FirstTxResult {
  timestamp: number;
  hasContractInteraction: boolean;
}

async function getFirstTransaction(address: string): Promise<FirstTxResult | null> {
  // BaseScan free API — get earliest transaction
  // Note: Without API key, rate limited to 5 calls/sec
  const apiKey = process.env.BASESCAN_API_KEY || "";
  const url = `${BASESCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc${apiKey ? `&apikey=${apiKey}` : ""}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1" || !data.result || data.result.length === 0) {
      return null;
    }

    const txs = data.result;
    const firstTx = txs[0];
    const hasContractInteraction = txs.some(
      (tx: { input: string; to: string }) =>
        tx.input !== "0x" || // has calldata = contract interaction
        tx.to === "" // contract creation
    );

    return {
      timestamp: parseInt(firstTx.timeStamp),
      hasContractInteraction,
    };
  } catch {
    return null;
  }
}

// ============================================================
// Rate Limiter — In-memory (replace with Redis in production)
// ============================================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const MAX_ATTEMPTS_PER_WINDOW = 3; // max 3 session attempts per 15 min

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    // New window
    rateLimits.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - 1, resetIn: RATE_WINDOW_MS };
  }

  if (entry.count >= MAX_ATTEMPTS_PER_WINDOW) {
    const resetIn = RATE_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count += 1;
  rateLimits.set(key, entry);
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS_PER_WINDOW - entry.count,
    resetIn: RATE_WINDOW_MS - (now - entry.windowStart),
  };
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now - entry.windowStart > RATE_WINDOW_MS * 2) {
      rateLimits.delete(key);
    }
  }
}, 60 * 1000);
