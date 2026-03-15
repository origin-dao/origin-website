"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/config/contracts";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectButton() {
  const { address, isConnected } = useAccount();

  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none" as const, userSelect: "none" as const },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="border border-terminal-green px-4 py-1.5 text-terminal-green text-sm hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
                  >
                    {">"} CONNECT
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="border border-terminal-red px-4 py-1.5 text-terminal-red text-sm hover:bg-terminal-red hover:text-terminal-bg transition-all font-bold"
                  >
                    ⚠ WRONG NETWORK
                  </button>
                );
              }

              const ethDisplay = ethBalance
                ? `${parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH`
                : "...";

              const clamsDisplay = clamsBalance !== undefined
                ? `${Number(formatUnits(clamsBalance as bigint, 18)).toLocaleString()} 🦪`
                : "...";

              return (
                <div className="flex items-center gap-3 text-sm">
                  {/* Balances */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-terminal-dim">
                    <span>{ethDisplay}</span>
                    <span className="text-terminal-dark">|</span>
                    <span className="text-terminal-amber">{clamsDisplay}</span>
                  </div>

                  {/* Address button */}
                  <button
                    onClick={openAccountModal}
                    className="border border-terminal-green px-4 py-1.5 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all font-bold glow"
                  >
                    {truncateAddress(account.address)}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}

/**
 * Inline wallet status for use inside pages (faucet, the book).
 * Shows address + CLAMS balance when connected, connect button otherwise.
 */
export function WalletStatus() {
  const { address, isConnected } = useAccount();

  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  if (!isConnected || !address) {
    return null;
  }

  const clamsDisplay = clamsBalance !== undefined
    ? Number(formatUnits(clamsBalance as bigint, 18)).toLocaleString()
    : "...";

  return (
    <div className="border border-terminal-green p-3 text-sm">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
        <div>
          <span className="text-terminal-dim">Wallet: </span>
          <span className="text-terminal-green font-bold">{truncateAddress(address)}</span>
        </div>
        <div>
          <span className="text-terminal-dim">CLAMS: </span>
          <span className="text-terminal-amber font-bold">{clamsDisplay} 🦪</span>
        </div>
      </div>
    </div>
  );
}
