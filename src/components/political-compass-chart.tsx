"use client";

import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { forwardRef } from "react";

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
  HTMLDivElement,
  PoliticalCompassChartProps
>(function PoliticalCompassChart(
  { dimensions, confidence, overlayDimensions, userId },
  ref
) {
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);

  const { economic, social } = toPoliticalCompass(dimensions);
  const overlay = overlayDimensions
    ? toPoliticalCompass(overlayDimensions)
    : null;

  // Chart area constants (SVG viewBox coordinates)
  const size = 400;
  const pad = 52; // padding for labels
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

  // Quadrant colours (subtle fills)
  const isDark = theme !== "light";
  const quadrantAlpha = isDark ? 0.12 : 0.08;

  // Authoritarian Left (top-left) — red
  // Authoritarian Right (top-right) — blue
  // Libertarian Left (bottom-left) — green
  // Libertarian Right (bottom-right) — purple/yellow
  const quadrants = [
    { x: pad, y: pad, color: `rgba(232, 116, 97, ${quadrantAlpha})`, label: t("quad_auth_left", language), lx: pad + grid * 0.25, ly: pad + grid * 0.15 },
    { x: cx, y: pad, color: `rgba(96, 165, 250, ${quadrantAlpha})`, label: t("quad_auth_right", language), lx: cx + grid * 0.25, ly: pad + grid * 0.15 },
    { x: pad, y: cy, color: `rgba(52, 211, 153, ${quadrantAlpha})`, label: t("quad_lib_left", language), lx: pad + grid * 0.25, ly: cy + grid * 0.35 },
    { x: cx, y: cy, color: `rgba(167, 139, 250, ${quadrantAlpha})`, label: t("quad_lib_right", language), lx: cx + grid * 0.25, ly: cy + grid * 0.35 },
  ];

  const gridLineColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const axisColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";
  const labelColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const quadLabelColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)";

  // Grid lines at 0.25 intervals
  const ticks = [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75];

  return (
    <div ref={ref} className="card p-3 sm:p-6 w-full max-w-lg mx-auto">
      <div className="w-full aspect-square max-h-[400px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
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
          <text x={pad - 8} y={cy} textAnchor="end" fill={labelColor} fontSize={11} fontWeight={600} dominantBaseline="central">
            {t("axis_econ_left", language)}
          </text>
          <text x={size - pad + 8} y={cy} textAnchor="start" fill={labelColor} fontSize={11} fontWeight={600} dominantBaseline="central">
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
          <circle cx={dotX} cy={dotY} r={2.5} fill="#fff" opacity={0.8} />

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

          {/* User ID watermark */}
          {userId && (
            <text
              x={size - pad}
              y={size - pad + 36}
              textAnchor="end"
              fill={labelColor}
              fontSize={9}
              fontWeight={500}
              style={{ userSelect: "none", letterSpacing: "0.5px" }}
            >
              {userId.length > 12
                ? `${userId.slice(0, 6)}...${userId.slice(-4)}`
                : userId}
            </text>
          )}
        </svg>
      </div>

      {/* Score summary below the chart */}
      <div className="mt-3 flex justify-center gap-6 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span>
          <strong style={{ color: "var(--text-primary)" }}>{t("axis_econ_left", language)} / {t("axis_econ_right", language)}:</strong>{" "}
          {economic > 0 ? "+" : ""}{economic.toFixed(2)}
        </span>
        <span>
          <strong style={{ color: "var(--text-primary)" }}>{t("axis_authoritarian", language)} / {t("axis_libertarian", language)}:</strong>{" "}
          {social > 0 ? "+" : ""}{social.toFixed(2)}
        </span>
      </div>
    </div>
  );
});
