"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useDisconnect, useSwitchChain } from "wagmi";
import { polygon } from "wagmi/chains";
import { SiweMessage } from "siwe";
import { getNonce, verifySiwe } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Wallet, Lock, Loader2 } from "lucide-react";
import { t } from "@/lib/i18n";

export default function ConnectPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);
  const language = useAppStore((s) => s.language);

  const { openConnectModal } = useConnectModal();
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<"idle" | "signing" | "switching" | "verifying" | "error">("idle");
  const [error, setError] = useState("");
  const [siweAttempted, setSiweAttempted] = useState(false);

  /**
   * SIWE flow:
   * 1) Get nonce from backend
   * 2) Build SIWE message
   * 3) User signs in wallet
   * 4) Backend verifies → JWT
   * 5) Store & redirect
   */
  const handleSiwe = useCallback(async () => {
    if (!address || !chainId) return;
    if (siweAttempted) return; // prevent double-fire
    setSiweAttempted(true);

    setError("");

    try {
      // 0. Switch to Polygon if needed
      let activeChainId = chainId;
      if (chainId !== polygon.id) {
        setStatus("switching");
        await switchChainAsync({ chainId: polygon.id });
        activeChainId = polygon.id;
      }

      setStatus("signing");

      // 1. Get nonce
      const { nonce } = await getNonce();

      // 2. Build SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Civic Compass",
        uri: window.location.origin,
        version: "1",
        chainId: activeChainId,
        nonce,
      });
      const messageStr = siweMessage.prepareMessage();

      // 3. Sign — this opens the MetaMask signature popup
      const signature = await signMessageAsync({ message: messageStr });

      // 4. Verify with backend
      setStatus("verifying");
      const result = await verifySiwe(messageStr, signature);
      setAuth(result.user, result.token);

      // 5. Navigate
      router.push("/onboarding");
    } catch (err: unknown) {
      console.error("SIWE failed:", err);
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg.includes("User rejected") || msg.includes("denied")
        ? t("connect_error", language)
        : msg);
      setStatus("error");
      setSiweAttempted(false);
      // Disconnect so the user can retry cleanly
      disconnect();
    }
  }, [address, chainId, signMessageAsync, setAuth, router, disconnect, language, siweAttempted]);

  // When wallet connects, auto-trigger SIWE
  useEffect(() => {
    if (isConnected && address && status === "idle") {
      handleSiwe();
    }
  }, [isConnected, address, status, handleSiwe]);

  const statusMessage = status === "switching"
    ? (language === "fa" ? "لطفاً به شبکه Polygon تغییر دهید..." : "Switching to Polygon network...")
    : status === "signing"
    ? (language === "fa" ? "لطفاً پیام را در کیف پول امضا کنید..." : "Please sign the message in your wallet...")
    : status === "verifying"
    ? (language === "fa" ? "در حال تأیید..." : "Verifying...")
    : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="card max-w-md w-full p-5 sm:p-8 space-y-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold glow-text">
          {t("connect_title", language)}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {t("connect_desc", language)}
        </p>

        {statusMessage ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {statusMessage}
            </p>
          </div>
        ) : (
          <button
            onClick={() => {
              setError("");
              setSiweAttempted(false);
              setStatus("idle");
              openConnectModal?.();
            }}
            className="btn-primary w-full justify-center text-lg flex items-center gap-2"
          >
            <Wallet size={18} strokeWidth={1.5} />
            {t("connect_button", language)}
          </button>
        )}

        {error && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>
            <button
              onClick={() => {
                setError("");
                setSiweAttempted(false);
                setStatus("idle");
                openConnectModal?.();
              }}
              className="btn-outline text-sm px-4 py-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {language === "fa" ? "تلاش مجدد" : "Try Again"}
            </button>
          </div>
        )}

        <div className="pt-6" style={{ borderTop: "1px solid var(--border-color)" }}>
          <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Lock size={14} strokeWidth={1.5} />
            {t("connect_footer", language)}
          </p>
        </div>
      </div>
    </main>
  );
}
