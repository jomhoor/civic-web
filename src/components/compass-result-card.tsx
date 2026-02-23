"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { axisLabel, t } from "@/lib/i18n";
import type { Language } from "@/lib/store";
import { Download, Share2, Copy } from "lucide-react";

const AXIS_COLORS: Record<string, string> = {
  economy: "#0EBB90",
  governance: "#8CDAF5",
  civil_liberties: "#FEEB34",
  society: "#E87461",
  diplomacy: "#A78BFA",
  environment: "#F59E0B",
  justice: "#34D399",
  technology: "#60A5FA",
};

const AXIS_KEYS = [
  "economy", "governance", "civil_liberties", "society",
  "diplomacy", "environment", "justice", "technology",
];

interface CompassResultCardProps {
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
  language?: Language;
}

/**
 * A styled, export-ready card showing the 8 axis scores.
 * Has a download button and exposes a ref for html-to-image capture.
 */
export function CompassResultCard({
  dimensions,
  confidence,
  language = "en",
}: CompassResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      // Ensure the element is fully in view and rendered
      const el = cardRef.current;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const dataUrl = await toPng(el, {
        pixelRatio: 3,
        backgroundColor: "#111111",
        width,
        height,
        style: {
          transform: "none",
          margin: "0",
        },
        canvasWidth: width * 3,
        canvasHeight: height * 3,
      });
      const link = document.createElement("a");
      link.download = `civic-compass-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const scores = AXIS_KEYS.map(
      (k) => `${axisLabel(k, language)}: ${(dimensions[k] ?? 0).toFixed(2)}`
    ).join(" | ");
    const text = `${t("share_text", language)}\n\n${scores}\n\n${t("share_discover", language)}`;
    const shareUrl = window.location.origin;

    // Try native share first
    if (navigator.share) {
      try {
        // Capture image for native share
        let file: File | undefined;
        if (cardRef.current) {
          const el = cardRef.current;
          const dataUrl = await toPng(el, {
            pixelRatio: 2,
            backgroundColor: "#111111",
            width: el.offsetWidth,
            height: el.offsetHeight,
            style: { transform: "none", margin: "0" },
          });
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          file = new File([blob], "civic-compass.png", { type: "image/png" });
        }
        await navigator.share({
          title: t("civic_compass", language),
          text,
          url: shareUrl,
          ...(file ? { files: [file] } : {}),
        });
        return;
      } catch {
        // Fallback to Twitter
      }
    }

    // Fallback: open Twitter/X share intent
    const tweetText = encodeURIComponent(`${text}\n${shareUrl}`);
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, "_blank");
  }, [dimensions, language]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* The exportable card */}
      <div
        ref={cardRef}
        style={{
          background: "linear-gradient(145deg, #111111 0%, #1a1a2e 100%)",
          borderRadius: "20px",
          padding: "28px 24px",
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              background: "linear-gradient(87.63deg, #5B9DF5 -1.41%, #38BDF8 113.73%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            {t("civic_compass", language)}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.44)",
              marginTop: "4px",
              letterSpacing: "0.5px",
            }}
          >
            {new Date().toLocaleDateString(language === "fa" ? "fa-IR" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Axis bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {AXIS_KEYS.map((key) => {
            const val = dimensions[key] ?? 0;
            const conf = confidence[key] ?? 0;
            const color = AXIS_COLORS[key];
            const pct = ((val + 1) / 2) * 100; // [-1,1] → [0,100]

            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Label */}
                <div
                  style={{
                    width: "90px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color,
                    textAlign: "end" as const,
                    flexShrink: 0,
                  }}
                >
                  {axisLabel(key, language)}
                </div>

                {/* Bar track */}
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.06)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Center line */}
                  <div
                    style={{
                      position: "absolute",
                      insetInlineStart: "50%",
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      background: "rgba(255,255,255,0.15)",
                    }}
                  />
                  {/* Fill bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      insetInlineStart: val >= 0 ? "50%" : `${pct}%`,
                      width: `${Math.abs(val) * 50}%`,
                      borderRadius: "4px",
                      background: color,
                      opacity: 0.7 + (conf / 10) * 0.3,
                    }}
                  />
                </div>

                {/* Score */}
                <div
                  style={{
                    width: "40px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "start" as const,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {val >= 0 ? "+" : ""}
                  {val.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          {t("site_url", language)}
        </div>
      </div>

      {/* Action buttons (not captured in screenshot) */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleDownload}
          className="btn-outline text-sm py-2 px-5 flex items-center gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <Download size={14} strokeWidth={1.5} />
          {t("download", language)}
        </button>
        <button
          onClick={handleShare}
          className="btn-primary text-sm py-2 px-5 flex items-center gap-2"
        >
          <Share2 size={14} strokeWidth={1.5} />
          {t("share", language)}
        </button>
        <button
          onClick={handleCopyLink}
          className="btn-outline text-sm py-2 px-5 flex items-center gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <Copy size={14} strokeWidth={1.5} />
          {t("copy_link", language)}
        </button>
      </div>
    </div>
  );
}
