"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const ensClient = createPublicClient({ chain: mainnet, transport: http() });

export function WalletPill() {
  const { address } = useAccount();
  const [ens, setEns] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEns(null);
    if (!address) return;
    (async () => {
      try {
        const name = await ensClient.getEnsName({ address });
        if (!cancelled) setEns(name ?? null);
      } catch {
        // ENS resolution failed — stay with short address
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address) return null;

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <span className="wallet-pill">
      {ens ? (
        <>
          <span className="wallet-pill-ens">{ens}</span>
          <span className="wallet-pill-addr">{short}</span>
        </>
      ) : (
        <span className="wallet-pill-addr">{short}</span>
      )}
    </span>
  );
}
