"use client";

import { t } from "@/lib/i18n";
import { generateProfileQR, QR_SIZE } from "@/lib/qr";
import { useAppStore } from "@/lib/store";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CompassChartHandle {
  toDataURL: () => Promise<string | null>;
}

interface PoliticalCompassChartProps {
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
  /** Optional second dataset to overlay (for diff comparison) */
  overlayDimensions?: Record<string, number>;
  /** When provided, renders the user ID on the chart as a watermark */
  userId?: string;
}

/**
 * Derive the classic Political Compass 2-axis position from 8 dimensions.
 * X = economy (-1 left, +1 right)
 * Y = authority average of governance, civil_liberties, society, justice
 *     then INVERTED so negative = libertarian (bottom), positive = authoritarian (top)
 */
function toPoliticalCompass(dims: Record<string, number>) {
  const economic = dims.economy ?? 0;
  // Positive governance/civil_liberties/society/justice = libertarian-leaning in our weight system
  // Political Compass convention: Y-axis positive = authoritarian (top)
  // So we invert: negative of the average
  const social =
    -((dims.governance ?? 0) +
      (dims.civil_liberties ?? 0) +
      (dims.society ?? 0) +
      (dims.justice ?? 0)) / 4;
  return { economic, social };
}

export const PoliticalCompassChart = forwardRef<
  CompassChartHandle,
  PoliticalCompassChartProps
>(function PoliticalCompassChart(
  { dimensions, confidence, overlayDimensions, userId },
  ref
) {
  const language = useAppStore((s) => s.language);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isDark = typeof document !== "undefined"
    ? document.documentElement.getAttribute("data-theme") !== "light"
    : true;

  // Expose toDataURL that serialises the SVG to a high-res PNG via canvas
  useImperativeHandle(ref, () => ({
    toDataURL: async () => {
      const svg = svgRef.current;
      if (!svg) return null;

      const SCALE = 3; // render at 3× for crisp output

      // Clone SVG and resolve CSS variables so the standalone image renders correctly
      const clone = svg.cloneNode(true) as SVGSVGElement;
      const cs = getComputedStyle(document.documentElement);
      const resolveCssVars = (el: Element) => {
        for (const attr of ["fill", "stroke", "color"]) {
          const val = el.getAttribute(attr);
          if (val?.startsWith("var(")) {
            const name = val.slice(4, val.indexOf(")")).trim();
            el.setAttribute(attr, cs.getPropertyValue(name).trim() || "#000");
          }
        }
        for (const child of Array.from(el.children)) resolveCssVars(child);
      };
      resolveCssVars(clone);

      // Set explicit width/height so the image renders at correct intrinsic size
      const vb = svg.viewBox.baseVal;
      clone.setAttribute("width", String(vb.width));
      clone.setAttribute("height", String(vb.height));

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      return new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = vb.width * SCALE;
          canvas.height = vb.height * SCALE;
          const ctx = canvas.getContext("2d");
          if (!ctx) { URL.revokeObjectURL(url); resolve(null); return; }
          const bgColor = document.documentElement.getAttribute("data-theme") === "light" ? "#F5F7FA" : "#111111";
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
      });
    },
  }));

  // Generate QR code when userId changes (theme-aware)
  useEffect(() => {
    if (!userId) { setQrDataUrl(null); return; }
    let cancelled = false;
    const qrOpts = isDark
      ? { dark: "#ffffffCC", light: "#00000000" }
      : { dark: "#1E3A6BCC", light: "#00000000" };
    generateProfileQR(userId, qrOpts).then((url) => { if (!cancelled) setQrDataUrl(url); });
    return () => { cancelled = true; };
  }, [userId, isDark]);

  const { economic, social } = toPoliticalCompass(dimensions);
  const overlay = overlayDimensions
    ? toPoliticalCompass(overlayDimensions)
    : null;

  // Chart area constants (SVG viewBox coordinates)
  const size = 480;
  const pad = 64; // padding for labels
  const grid = size - pad * 2; // drawable area
  const cx = size / 2;
  const cy = size / 2;

  // Map -1..+1 to pixel coordinates
  const toX = (v: number) => cx + (v * grid) / 2;
  const toY = (v: number) => cy + (v * grid) / 2; // positive social = authoritarian = top, but SVG y goes down, so +social → higher y visually means lower on screen → we want authoritarian at top → invert
  // Actually: social positive = authoritarian. In SVG, y=0 is top. So authoritarian (positive) should be at top (low y).
  // toY should map +1 → pad (top) and -1 → size-pad (bottom)
  const toYFixed = (v: number) => cy - (v * grid) / 2;

  const dotX = toX(economic);
  const dotY = toYFixed(social);

  const overlayDotX = overlay ? toX(overlay.economic) : 0;
  const overlayDotY = overlay ? toYFixed(overlay.social) : 0;

  // Quadrant colours
  const quadrantAlpha = isDark ? 0.12 : 0.15;

  const quadrants = [
    { x: pad, y: pad, color: `rgba(232, 116, 97, ${quadrantAlpha})`, label: t("quad_auth_left", language), lx: pad + grid * 0.25, ly: pad + grid * 0.15 },
    { x: cx, y: pad, color: `rgba(96, 165, 250, ${quadrantAlpha})`, label: t("quad_auth_right", language), lx: cx + grid * 0.25, ly: pad + grid * 0.15 },
    { x: pad, y: cy, color: `rgba(52, 211, 153, ${quadrantAlpha})`, label: t("quad_lib_left", language), lx: pad + grid * 0.25, ly: cy + grid * 0.35 },
    { x: cx, y: cy, color: `rgba(167, 139, 250, ${quadrantAlpha})`, label: t("quad_lib_right", language), lx: cx + grid * 0.25, ly: cy + grid * 0.35 },
  ];

  const gridLineColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const axisColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const labelColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";
  const quadLabelColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

  // Grid lines at 0.25 intervals
  const ticks = [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75];

  // Total SVG height: chart + optional QR + score summary
  const qrBlockH = qrDataUrl ? QR_SIZE + 8 : 0;
  const summaryY = size + qrBlockH;
  const totalH = summaryY + 24; // 24px for the score text row

  return (
    <div className="w-full max-w-lg mx-auto" style={{ aspectRatio: `${size} / ${totalH}` }}>
      <svg ref={svgRef} viewBox={`0 0 ${size} ${totalH}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Background */}
          <rect x={0} y={0} width={size} height={totalH} fill={isDark ? "#1a1a1a" : "#ffffff"} rx={8} />
          {/* Quadrant backgrounds */}
          {quadrants.map((q, i) => (
            <rect
              key={i}
              x={q.x}
              y={q.y}
              width={grid / 2}
              height={grid / 2}
              fill={q.color}
              rx={i === 0 ? "8 0 0 0" : i === 1 ? "0 8 0 0" : i === 2 ? "0 0 0 8" : "0 0 8 0"}
            />
          ))}

          {/* Quadrant labels */}
          {quadrants.map((q, i) => (
            <text
              key={`ql-${i}`}
              x={q.lx}
              y={q.ly}
              textAnchor="middle"
              fill={quadLabelColor}
              fontSize={9}
              fontWeight={600}
              style={{ userSelect: "none" }}
            >
              {q.label}
            </text>
          ))}

          {/* Grid lines */}
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={toX(v)}
                y1={pad}
                x2={toX(v)}
                y2={size - pad}
                stroke={gridLineColor}
                strokeWidth={0.5}
              />
              <line
                x1={pad}
                y1={toYFixed(v)}
                x2={size - pad}
                y2={toYFixed(v)}
                stroke={gridLineColor}
                strokeWidth={0.5}
              />
            </g>
          ))}

          {/* Main axes */}
          <line x1={cx} y1={pad} x2={cx} y2={size - pad} stroke={axisColor} strokeWidth={1} />
          <line x1={pad} y1={cy} x2={size - pad} y2={cy} stroke={axisColor} strokeWidth={1} />

          {/* Axis labels */}
          <text x={cx} y={pad - 10} textAnchor="middle" fill={labelColor} fontSize={11} fontWeight={600}>
            {t("axis_authoritarian", language)}
          </text>
          <text x={cx} y={size - pad + 18} textAnchor="middle" fill={labelColor} fontSize={11} fontWeight={600}>
            {t("axis_libertarian", language)}
          </text>
          <text x={pad - 4} y={cy} textAnchor="end" fill={labelColor} fontSize={11} fontWeight={600} dominantBaseline="central">
            {t("axis_econ_left", language)}
          </text>
          <text x={size - pad + 4} y={cy} textAnchor="start" fill={labelColor} fontSize={11} fontWeight={600} dominantBaseline="central">
            {t("axis_econ_right", language)}
          </text>

          {/* Overlay dot (diff comparison) */}
          {overlay && (
            <>
              <circle
                cx={overlayDotX}
                cy={overlayDotY}
                r={6}
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <line
                x1={overlayDotX}
                y1={overlayDotY}
                x2={dotX}
                y2={dotY}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            </>
          )}

          {/* User position dot */}
          <circle cx={dotX} cy={dotY} r={8} fill="var(--accent-primary)" opacity={0.25} />
          <circle cx={dotX} cy={dotY} r={5} fill="var(--accent-primary)" />
          <circle cx={dotX} cy={dotY} r={2.5} fill={isDark ? "#1a1a1a" : "#fff"} opacity={0.8} />

          {/* Coordinate readout near the dot */}
          <text
            x={dotX + 12}
            y={dotY - 10}
            fill="var(--accent-primary)"
            fontSize={10}
            fontWeight={600}
          >
            ({economic.toFixed(2)}, {social.toFixed(2)})
          </text>

          {/* QR code watermark — centered below chart */}
          {qrDataUrl && (
            <image
              href={qrDataUrl}
              x={(size - QR_SIZE) / 2}
              y={size + 2}
              width={QR_SIZE}
              height={QR_SIZE}
              opacity={0.7}
            />
          )}

          {/* Score summary */}
          <text x={size / 2 - 4} y={summaryY + 16} textAnchor="end" fontSize={10} fill={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"}>
            <tspan fontWeight={700} fill={isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)"}>{t("axis_econ_left", language)} / {t("axis_econ_right", language)}:</tspan>
            {" "}{economic > 0 ? "+" : ""}{economic.toFixed(2)}
          </text>
          <text x={size / 2 + 4} y={summaryY + 16} textAnchor="start" fontSize={10} fill={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"}>
            <tspan fontWeight={700} fill={isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)"}>{t("axis_authoritarian", language)} / {t("axis_libertarian", language)}:</tspan>
            {" "}{social > 0 ? "+" : ""}{social.toFixed(2)}
          </text>
        </svg>
    </div>
  );
});
