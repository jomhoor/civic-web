"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { useAppStore } from "@/lib/store";
import { useState, type ReactNode } from "react";
import { polygon } from "wagmi/chains";

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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rkTheme} locale="en" initialChain={polygon}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
