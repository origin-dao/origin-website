declare module "viem" {
  export type Address = `0x${string}`;
  export function formatEther(value: bigint): string;
  export function formatUnits(value: bigint, decimals: number): string;
  export function parseEther(ether: string): bigint;
  export function parseUnits(value: string, decimals: number): bigint;
  export type Chain = {
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: Record<string, { http: readonly string[] }>;
    blockExplorers?: Record<string, { name: string; url: string }>;
  };
  export function createPublicClient(config: Record<string, unknown>): unknown;
  export function http(url?: string): unknown;
}
