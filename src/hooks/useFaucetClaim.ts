"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  createWalletClient,
  custom,
  createPublicClient,
  http,
} from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES, FAUCET_ABI } from "@/config/contracts";

export type ClaimStatus =
  | "idle"
  | "awaiting-signature"
  | "confirming"
  | "confirmed"
  | "error";

interface ClaimState {
  status: ClaimStatus;
  txHash?: `0x${string}`;
  error?: string;
  blockNumber?: bigint;
}

export function useFaucetClaim() {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<ClaimState>({ status: "idle" });

  const claim = useCallback(
    async (philosophicalFlex: string) => {
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

        // Create viem clients directly
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

        // Send the transaction
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.faucet,
          abi: FAUCET_ABI,
          functionName: "claim",
          args: [philosophicalFlex],
        });

        setState({ status: "confirming", txHash: hash });

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        setState({
          status: "confirmed",
          txHash: hash,
          blockNumber: receipt.blockNumber,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        const message = msg.includes("User rejected") || msg.includes("user rejected")
          ? "Transaction rejected in wallet. No gas was spent."
          : msg.includes("insufficient funds")
          ? "Insufficient ETH for gas fees."
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
    claim,
    reset,
    isConnected,
    address,
  };
}
