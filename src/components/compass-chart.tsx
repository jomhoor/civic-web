"use client";

import { axisLabel, t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { forwardRef } from "react";
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

/** Republic-matched axis colours */
const AXIS_COLORS: Record<string, string> = {
  economy: "#0EBB90",
  governance: "#8CDAF5",
  civil_liberties: "#FEEB34",
  society: "#E87461",
  diplomacy: "#A78BFA",
  environment: "#34D399",
  justice: "#F59E0B",
  technology: "#60A5FA",
};

interface CompassChartProps {
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
  /** Optional second dataset to overlay (for diff comparison). Rendered as dashed outline. */
  overlayDimensions?: Record<string, number>;
}

export const CompassChart = forwardRef<HTMLDivElement, CompassChartProps>(
  function CompassChart({ dimensions, confidence, overlayDimensions }, ref) {
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);

  const data = Object.entries(dimensions).map(([axis, value]) => ({
    axis: axisLabel(axis, language),
    key: axis,
    // Normalize from [-1, 1] to [0, 1] for radar display
    value: (value + 1) / 2,
    rawValue: value.toFixed(2),
    confidence: confidence[axis] ?? 0,
    ...(overlayDimensions
      ? {
          overlay: ((overlayDimensions[axis] ?? 0) + 1) / 2,
          overlayRaw: (overlayDimensions[axis] ?? 0).toFixed(2),
        }
      : {}),
  }));

  const gridColor = theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";

  return (
    <div ref={ref} className="card p-3 sm:p-6 w-full max-w-lg mx-auto">
      <div className="w-full aspect-square max-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis
            dataKey="axis"
            tick={({ x, y, payload, index }) => {
              const color =
                AXIS_COLORS[data[index]?.key] ?? "var(--text-secondary)";
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize={10}
                  fontWeight={600}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 1]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name={t("compass_name", language)}
            dataKey="value"
            stroke="var(--accent-primary)"
            fill="url(#compassGradient)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          {overlayDimensions && (
            <Radar
              name="Previous"
              dataKey="overlay"
              stroke="var(--text-muted)"
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}
          <defs>
            <linearGradient id="compassGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5B9DF5" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              const color = AXIS_COLORS[d.key] ?? "var(--accent-primary)";
              return (
                <div
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <p className="font-semibold" style={{ color }}>{d.axis}</p>
                  <p style={{ color: "var(--text-secondary)" }}>{t("score_label", language)}: {d.rawValue}</p>
                  <p style={{ color: "var(--text-muted)" }}>{t("answers_label", language)}: {d.confidence}</p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
});
