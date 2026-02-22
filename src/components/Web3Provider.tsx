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
    appName: "ORIGIN DAO",
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

// Terminal-themed RainbowKit overrides
const terminalTheme: Theme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: "#00ff41",
    accentColorForeground: "#0a0a0a",
    connectButtonBackground: "#0a0a0a",
    connectButtonInnerBackground: "#0a0a0a",
    connectButtonText: "#00ff41",
    modalBackground: "#0a0a0a",
    modalBorder: "#003300",
    modalText: "#00ff41",
    modalTextSecondary: "#00aa2a",
    profileForeground: "#0a0a0a",
    closeButton: "#00aa2a",
    closeButtonBackground: "#003300",
    generalBorder: "#003300",
    generalBorderDim: "#003300",
    actionButtonBorder: "#003300",
    actionButtonBorderMobile: "#003300",
    actionButtonSecondaryBackground: "#003300",
    connectionIndicator: "#00ff41",
    downloadBottomCardBackground: "#0a0a0a",
    downloadTopCardBackground: "#003300",
    error: "#ff3333",
    menuItemBackground: "#003300",
    standby: "#ffb000",
    profileAction: "#003300",
    profileActionHover: "#003300",
    selectedOptionBorder: "#00ff41",
  },
  fonts: {
    body: "'IBM Plex Mono', 'Courier New', monospace",
  },
  radii: {
    actionButton: "0px",
    connectButton: "0px",
    menuButton: "0px",
    modal: "0px",
    modalMobile: "0px",
  },
  shadows: {
    connectButton: "0 0 10px rgba(0, 255, 65, 0.3)",
    dialog: "0 0 20px rgba(0, 255, 65, 0.2)",
    profileDetailsAction: "none",
    selectedOption: "0 0 10px rgba(0, 255, 65, 0.3)",
    selectedWallet: "0 0 10px rgba(0, 255, 65, 0.3)",
    walletLogo: "none",
  },
};

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={terminalTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
