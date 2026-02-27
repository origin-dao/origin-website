/* eslint-disable @typescript-eslint/no-explicit-any */
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
  export function createPublicClient(config: Record<string, any>): any;
  export function createWalletClient(config: Record<string, any>): any;
  export function createClient(config: Record<string, any>): any;
  export function http(url?: string): any;
  export function custom(provider: any): any;
  export function keccak256(value: any): `0x${string}`;
  export function toHex(value: any): `0x${string}`;
  export function encodePacked(types: string[], values: any[]): `0x${string}`;
}

declare module "viem/chains" {
  import { Chain } from "viem";
  export const base: Chain;
  export const baseSepolia: Chain;
  export const mainnet: Chain;
}
