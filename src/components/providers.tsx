"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, type ReactNode } from "react";
import { polygon } from "wagmi/chains";

/**
 * On mount, purge any stale wagmi.* localStorage keys left over from
 * before we switched to noopStorage.  This prevents
 * ConnectorChainMismatchError during hydration.
 */
function WagmiCacheCleaner() {
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith("wagmi.") || k.startsWith("rk-")
      );
      if (keys.length > 0) {
        keys.forEach((k) => localStorage.removeItem(k));
        console.info("[CivicCompass] Cleared stale wagmi/rk cache keys:", keys);
      }
    } catch {
      /* SSR / incognito — ignore */
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  const rkTheme =
    theme === "light"
      ? lightTheme({
          accentColor: "#5B9DF5",
          borderRadius: "medium",
        })
      : darkTheme({
          accentColor: "#5B9DF5",
          borderRadius: "medium",
          overlayBlur: "small",
        });

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rkTheme} locale="en" initialChain={polygon}>
          <WagmiCacheCleaner />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
