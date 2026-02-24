"use client";

import { createGuestSession, getNonce, verifySiwe } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ExternalLink, HelpCircle, Loader2, Lock, UserCircle, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useDisconnect, useSignMessage, useSwitchChain } from "wagmi";
import { polygon } from "wagmi/chains";

export default function ConnectPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);
  const setGuestAuth = useAppStore((s) => s.setGuestAuth);
  const language = useAppStore((s) => s.language);

  const { openConnectModal } = useConnectModal();
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<"idle" | "signing" | "switching" | "verifying" | "error">("idle");
  const [error, setError] = useState("");
  const [siweAttempted, setSiweAttempted] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  /**
   * Combined chain-switch + SIWE flow.
   *
   * useAccount().chainId reflects wagmi's *stored* connection chain, NOT the
   * connector's actual current chain. So we ALWAYS call switchChainAsync
   * first to force the wallet onto Polygon before signing.
   */
  const handleSiwe = useCallback(async () => {
    if (!address) return;
    if (siweAttempted) return;
    setSiweAttempted(true);
    setError("");

    try {
      // 0. Force-switch to Polygon — this is a no-op if already on 137,
      //    but ensures the connector actually moves to the right chain.
      setStatus("switching");
      try {
        await switchChainAsync({ chainId: polygon.id });
      } catch (switchErr: unknown) {
        const msg = switchErr instanceof Error ? switchErr.message : "";
        // "already pending" or similar means it's fine
        if (!msg.toLowerCase().includes("already") && !msg.toLowerCase().includes("same")) {
          throw switchErr;
        }
      }

      // 1. Get nonce
      setStatus("signing");
      const { nonce } = await getNonce();

      // 2. Build SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Civic Compass",
        uri: window.location.origin,
        version: "1",
        chainId: polygon.id,
        nonce,
      });
      const messageStr = siweMessage.prepareMessage();

      // 3. Sign
      const signature = await signMessageAsync({ message: messageStr });

      // 4. Verify with backend
      setStatus("verifying");
      const result = await verifySiwe(messageStr, signature);
      setAuth(result.user, result.token);

      // 5. Navigate — skip onboarding for returning users
      const hasOnboarded = useAppStore.getState().hasOnboarded;
      router.push(hasOnboarded ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      console.error("SIWE failed:", err);
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.includes("ChainMismatch") || msg.includes("chain")) {
        setError(
          language === "fa"
            ? "لطفاً شبکه کیف پول را به Polygon تغییر دهید و دوباره تلاش کنید."
            : "Please switch your wallet to Polygon network and try again."
        );
      } else {
        setError(msg.includes("User rejected") || msg.includes("denied")
          ? t("connect_error", language)
          : msg);
      }
      setStatus("error");
      setSiweAttempted(false);
      disconnect();
    }
  }, [address, switchChainAsync, signMessageAsync, setAuth, router, disconnect, language, siweAttempted]);

  const [guestLoading, setGuestLoading] = useState(false);

  const handleSkip = useCallback(async () => {
    setGuestLoading(true);
    try {
      const { user, token } = await createGuestSession();
      setGuestAuth(user, token);
      router.push("/dashboard");
    } catch (err) {
      console.error("Guest auth failed:", err);
      setGuestLoading(false);
    }
  }, [setGuestAuth, router]);

  // When wallet connects, auto-trigger the flow
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

        <button
          onClick={() => setShowWalletInfo(true)}
          className="flex items-center justify-center gap-1.5 text-xs mx-auto transition-opacity hover:opacity-80"
          style={{ color: "var(--accent-primary)", marginTop: "-1rem" }}
        >
          <HelpCircle size={14} strokeWidth={1.5} />
          {t("wallet_info_title", language)}
        </button>

        {statusMessage ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {statusMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
            <button
              onClick={handleSkip}
              disabled={guestLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color: "var(--text-secondary)",
                background: "transparent",
              }}
            >
              {guestLoading ? (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <UserCircle size={16} strokeWidth={1.5} />
              )}
              {t("skip_connect", language)}
            </button>
          </div>
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
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent-primary)" }}>MetaMask</a>
            {language === "fa" ? " و " : " & "}
            <a href="https://walletconnect.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent-primary)" }}>WalletConnect</a>
          </p>
        </div>

      </div>

      {/* Wallet Info Popup */}
      {showWalletInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowWalletInfo(false)}
        >
          <div
            className="card p-6 sm:p-8 flex flex-col gap-4 max-w-md w-full shadow-xl relative"
            dir={language === "fa" ? "rtl" : "ltr"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWalletInfo(false)}
              className="absolute top-3 right-3 p-1 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-2">
              <Wallet size={22} strokeWidth={1.5} style={{ color: "var(--accent-primary)" }} />
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {t("wallet_info_title", language)}
              </h3>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {t("wallet_info_body", language)}
            </p>

            <a
              href={t("wallet_info_link", language)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "var(--accent-primary)" }}
            >
              <ExternalLink size={14} strokeWidth={1.5} />
              {t("wallet_info_link_label", language)}
            </a>

            <button
              onClick={() => setShowWalletInfo(false)}
              className="btn-primary w-full mt-2 justify-center text-sm"
            >
              {t("wallet_info_close", language)}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
