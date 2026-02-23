"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, type ReactNode } from "react";
import { polygon } from "wagmi/chains";
import { reconnect, disconnect as disconnectCore } from "@wagmi/core";

/**
 * Manual reconnect handler.
 *
 * wagmi's built-in reconnectOnMount throws ConnectorChainMismatchError
 * when the wallet is on a different chain (e.g. 7368) than the stored
 * connection chain (137 / Polygon). We disable the built-in reconnect
 * and handle it ourselves with proper error catching.
 */
function ReconnectHandler() {
  useEffect(() => {
    reconnect(wagmiConfig).catch((err) => {
      console.warn(
        "[CivicCompass] Reconnect skipped — clearing stale session:",
        err?.message ?? err,
      );
      // Clean disconnect; if that fails, wipe wagmi localStorage keys
      try {
        disconnectCore(wagmiConfig);
      } catch {
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith("wagmi."))
            .forEach((k) => localStorage.removeItem(k));
        } catch { /* SSR / incognito */ }
      }
    });
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
          <ReconnectHandler />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
