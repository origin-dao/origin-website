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
                    className="btn-primary"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="border border-o-red px-4 py-2 text-o-red text-[13px] font-medium hover:bg-o-red hover:text-o-bg transition-all"
                  >
                    Wrong Network
                  </button>
                );
              }

              const ethDisplay = ethBalance
                ? `${parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH`
                : "...";

              const clamsDisplay = clamsBalance !== undefined
                ? `${Number(formatUnits(clamsBalance as bigint, 18)).toLocaleString()} CLAMS`
                : "...";

              return (
                <div className="flex items-center gap-3 text-[13px]">
                  <div className="hidden sm:flex items-center gap-3 text-[11px] text-o-text-dim">
                    <span>{ethDisplay}</span>
                    <span className="text-o-text-vdim">|</span>
                    <span className="text-o-yellow">{clamsDisplay}</span>
                  </div>
                  <button
                    onClick={openAccountModal}
                    className="border border-o-border-active px-4 py-2 text-o-green text-[13px] font-medium hover:border-o-green transition-all"
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
    <div className="border border-o-border p-3 text-[13px]">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
        <div>
          <span className="text-o-text-dim">Wallet: </span>
          <span className="text-o-green font-medium">{truncateAddress(address)}</span>
        </div>
        <div>
          <span className="text-o-text-dim">CLAMS: </span>
          <span className="text-o-yellow font-medium">{clamsDisplay}</span>
        </div>
      </div>
    </div>
  );
}
