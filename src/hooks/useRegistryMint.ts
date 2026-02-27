"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  keccak256,
  toHex,
} from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "@/config/contracts";

export type MintStatus =
  | "idle"
  | "awaiting-signature"
  | "confirming"
  | "confirmed"
  | "error";

interface MintState {
  status: MintStatus;
  txHash?: `0x${string}`;
  error?: string;
  blockNumber?: bigint;
  agentId?: number;
}

interface RegisterParams {
  name: string;
  agentType: string;
  platform: string;
  tokenURI: string;
  /** If true, register as independent (no human principal) */
  independent?: boolean;
}

export function useRegistryMint() {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<MintState>({ status: "idle" });

  const mint = useCallback(
    async (params: RegisterParams) => {
      if (!isConnected || !address) {
        setState({ status: "error", error: "Wallet not connected" });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window === "undefined" || !(window as any).ethereum) {
        setState({ status: "error", error: "No wallet provider found" });
        return;
      }

      try {
        setState({ status: "awaiting-signature" });

        // Generate a public key hash from the agent name + owner address
        // (In production, this would be a real cryptographic key pair)
        const publicKeyHash = keccak256(
          toHex(`${params.name}:${address}:${Date.now()}`)
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const walletClient = createWalletClient({
          account: address,
          chain: base,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transport: custom((window as any).ethereum),
        });

        const publicClient = createPublicClient({
          chain: base,
          transport: http(),
        });

        // Get the registration fee from the contract
        const registrationFee = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.registry,
          abi: REGISTRY_ABI,
          functionName: "registrationFee",
        }) as bigint;

        // Choose function based on independent flag
        const functionName = params.independent
          ? "registerIndependentAgent"
          : "registerAgent";

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.registry,
          abi: REGISTRY_ABI,
          functionName,
          args: [
            params.name,
            params.agentType,
            params.platform,
            publicKeyHash,
            params.tokenURI || "",
          ],
          value: registrationFee,
        });

        setState({ status: "confirming", txHash: hash });

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Try to extract the agent ID from the AgentBorn event
        let agentId: number | undefined;
        for (const log of receipt.logs) {
          // AgentBorn event topic
          try {
            if (log.topics[1]) {
              agentId = Number(BigInt(log.topics[1]));
              break;
            }
          } catch {
            // skip
          }
        }

        setState({
          status: "confirmed",
          txHash: hash,
          blockNumber: receipt.blockNumber,
          agentId,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        const message = msg.includes("User rejected") || msg.includes("user rejected")
          ? "Transaction rejected in wallet. No gas was spent."
          : msg.includes("insufficient funds")
          ? "Insufficient ETH for gas + registration fee."
          : msg.includes("InsufficientFee")
          ? "Insufficient ETH for the registration fee (0.0015 ETH)."
          : msg.length > 200
          ? msg.slice(0, 200) + "..."
          : msg;

        setState({ status: "error", error: message });
      }
    },
    [address, isConnected]
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    ...state,
    mint,
    reset,
    isConnected,
    address,
  };
}
