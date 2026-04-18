"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supported",
      wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet],
    },
  ],
  {
    appName: "ORIGIN",
    projectId,
  }
);

const config = createConfig({
  connectors,
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

// Terminal-futurist RainbowKit theme
const originTheme: Theme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: "#00ffa3",
    accentColorForeground: "#050805",
    connectButtonBackground: "#0a0f0a",
    connectButtonInnerBackground: "#0a0f0a",
    connectButtonText: "#00ffa3",
    modalBackground: "#0a0f0a",
    modalBorder: "#1a3a2a",
    modalText: "#e0f0e0",
    modalTextSecondary: "#7a9a7a",
    profileForeground: "#0a0f0a",
    closeButton: "#7a9a7a",
    closeButtonBackground: "#0e140e",
    generalBorder: "#1a3a2a",
    generalBorderDim: "#1a3a2a",
    actionButtonBorder: "#1a3a2a",
    actionButtonBorderMobile: "#1a3a2a",
    actionButtonSecondaryBackground: "#0e140e",
    connectionIndicator: "#00ffa3",
    downloadBottomCardBackground: "#0a0f0a",
    downloadTopCardBackground: "#0e140e",
    error: "#ff3d3d",
    menuItemBackground: "#0e140e",
    standby: "#f5a623",
    profileAction: "#0e140e",
    profileActionHover: "#1a3a2a",
    selectedOptionBorder: "#00ffa3",
  },
  fonts: {
    body: "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace",
  },
  radii: {
    actionButton: "0px",
    connectButton: "0px",
    menuButton: "0px",
    modal: "0px",
    modalMobile: "0px",
  },
  shadows: {
    connectButton: "none",
    dialog: "0 0 30px rgba(0, 255, 163, 0.08)",
    profileDetailsAction: "none",
    selectedOption: "0 0 10px rgba(0, 255, 163, 0.15)",
    selectedWallet: "0 0 10px rgba(0, 255, 163, 0.15)",
    walletLogo: "none",
  },
};

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={originTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
