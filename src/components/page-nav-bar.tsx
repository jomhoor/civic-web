"use client";

import { SettingsBar } from "@/components/settings-bar";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";

interface PageNavBarProps {
  /** Show the "Dashboard" / home button (default: true) */
  showHome?: boolean;
  /** Additional class names for the container */
  className?: string;
}

/**
 * Shared top bar for authenticated pages.
 * Shows a home/dashboard button, settings bar, and disconnect button.
 */
export function PageNavBar({ showHome = true, className = "" }: PageNavBarProps) {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const { disconnect: disconnectWallet } = useDisconnect();

  function handleDisconnect() {
    disconnectWallet();
    useAppStore.getState().logout();
    router.push("/");
  }

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      {showHome && (
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-outline text-sm py-2 px-3 flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <LayoutDashboard size={14} strokeWidth={1.5} />
          {t("tab_compass", language)}
        </button>
      )}
      <SettingsBar />
      <button
        onClick={handleDisconnect}
        className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        <LogOut size={14} strokeWidth={1.5} />
        {t("disconnect", language)}
      </button>
    </div>
  );
}
