import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon, polygonAmoy } from "wagmi/chains";
import { createStorage, noopStorage } from "wagmi";

/**
 * Wagmi + RainbowKit configuration.
 *
 * Uses noopStorage to prevent wagmi from persisting connection state
 * across page reloads. This avoids ConnectorChainMismatchError when
 * the wallet switches chains between sessions. Our auth is JWT-based
 * (persisted in Zustand), so wagmi doesn't need to remember sessions.
 *
 * NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID must be set in .env.local
 * Get one free at https://cloud.walletconnect.com
 */
export const wagmiConfig = getDefaultConfig({
  appName: "Civic Compass",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "PLACEHOLDER",
  chains: [polygon, polygonAmoy],
  ssr: true,
  storage: createStorage({ storage: noopStorage }),
});
