declare module "wagmi/chains" {
  import { type Chain } from "viem";
  export const base: Chain & { id: 8453 };
  export const mainnet: Chain & { id: 1 };
}

declare module "wagmi" {
  import { type ReactNode } from "react";
  import { type Address } from "viem";

  export interface Config {}

  export function createConfig(config: Record<string, unknown>): Config;
  export function http(url?: string): unknown;

  export function WagmiProvider(props: {
    config: Config;
    children: ReactNode;
  }): JSX.Element;

  export function useAccount(): {
    address?: Address;
    isConnected: boolean;
    isConnecting: boolean;
    isDisconnected: boolean;
  };

  export function useBalance(config?: Record<string, unknown>): {
    data?: { value: bigint; decimals: number; formatted: string; symbol: string };
    isLoading: boolean;
    isError: boolean;
  };

  export function useReadContract(config: Record<string, unknown>): {
    data?: unknown;
    isLoading: boolean;
    isError: boolean;
  };

  export function useWriteContract(): {
    writeContract: (config: Record<string, unknown>) => void;
    data?: unknown;
    isLoading: boolean;
    isError: boolean;
  };
}

declare module "@tanstack/react-query" {
  import { type ReactNode } from "react";

  export class QueryClient {
    constructor(config?: Record<string, unknown>);
  }

  export function QueryClientProvider(props: {
    client: QueryClient;
    children: ReactNode;
  }): JSX.Element;
}

declare module "@rainbow-me/rainbowkit" {
  import { type ReactNode } from "react";

  export interface Theme {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    radii: Record<string, string>;
    shadows: Record<string, string>;
  }

  export function darkTheme(): Theme;
  export function lightTheme(): Theme;

  export function RainbowKitProvider(props: {
    theme?: Theme;
    modalSize?: "compact" | "wide";
    children: ReactNode;
  }): JSX.Element;

  export function useConnectModal(): {
    openConnectModal?: () => void;
  };

  export function connectorsForWallets(
    walletList: Array<{
      groupName: string;
      wallets: unknown[];
    }>,
    config: {
      appName: string;
      projectId: string;
    }
  ): unknown[];

  export const ConnectButton: {
    (): JSX.Element;
    Custom: (props: {
      children: (renderProps: {
        account?: {
          address: string;
          displayName: string;
          ensAvatar?: string;
          ensName?: string;
          hasPendingTransactions: boolean;
        };
        chain?: {
          hasIcon: boolean;
          iconUrl?: string;
          iconBackground?: string;
          id: number;
          name?: string;
          unsupported?: boolean;
        };
        openAccountModal: () => void;
        openChainModal: () => void;
        openConnectModal: () => void;
        mounted: boolean;
      }) => ReactNode;
    }) => JSX.Element;
  };
}

declare module "@rainbow-me/rainbowkit/wallets" {
  export const metaMaskWallet: unknown;
  export const coinbaseWallet: unknown;
  export const walletConnectWallet: unknown;
}

declare module "@rainbow-me/rainbowkit/styles.css" {}
