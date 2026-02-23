import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon, polygonAmoy } from "wagmi/chains";

/**
 * Wagmi + RainbowKit configuration.
 *
 * NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID must be set in .env.local
 * Get one free at https://cloud.walletconnect.com
 */
export const wagmiConfig = getDefaultConfig({
  appName: "Civic Compass",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "PLACEHOLDER",
  chains: [polygon, polygonAmoy],
  ssr: true,
});
