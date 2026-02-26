import { randomBytes } from "crypto";

export function randomId(): string {
  return randomBytes(16).toString("hex");
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function now(): number {
  return Date.now();
}

/** Session expires after 30 minutes */
export const SESSION_TTL_MS = 30 * 60 * 1000;

/** Minimum wallet age in days to be eligible */
export const MIN_WALLET_AGE_DAYS = 7;

/** Minimum transactions to be eligible */
export const MIN_TX_COUNT = 1;
