import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Civic Compass Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ── Constants ── */
const AXIS_KEYS = [
  "economy",
  "governance",
  "civil_liberties",
  "society",
  "diplomacy",
  "environment",
  "justice",
  "technology",
];

const AXIS_LABELS: Record<string, string> = {
  economy: "Economy",
  governance: "Governance",
  civil_liberties: "Civil Liberties",
  society: "Society",
  diplomacy: "Diplomacy",
  environment: "Environment",
  justice: "Justice",
  technology: "Technology",
};

const AXIS_COLORS = [
  "#0EBB90",
  "#8CDAF5",
  "#FEEB34",
  "#E87461",
  "#A78BFA",
  "#F59E0B",
  "#34D399",
  "#60A5FA",
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/* ── Generate radar polygon points ── */
function radarPoint(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number,
  value: number // 0–1
): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: cx + radius * value * Math.cos(angle),
    y: cy + radius * value * Math.sin(angle),
  };
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;

  // Fetch compass data from backend
  let dimensions: Record<string, number> = {};
  let displayName: string | null = null;
  let wallet = "";

  try {
    const res = await fetch(`${API_BASE}/compass/profile/${userId}`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (res.ok) {
      const data = await res.json();
      dimensions = data.dimensions ?? {};
      displayName = data.displayName;
      wallet = data.wallet ?? "";
    }
  } catch {
    // Fallback to empty compass
  }

  // Normalize dimension values from [-1, 1] to [0, 1]
  const values = AXIS_KEYS.map((k) => ((dimensions[k] ?? 0) + 1) / 2);

  // Radar chart geometry
  const CX = 420;
  const CY = 315;
  const R = 200;
  const N = AXIS_KEYS.length;

  // Generate data polygon points
  const dataPoints = values.map((v, i) => radarPoint(CX, CY, R, i, N, v));
  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ") + " Z";

  // Grid ring paths (33%, 66%, 100%)
  const gridRings = [0.33, 0.66, 1.0].map((scale) => {
    const pts = AXIS_KEYS.map((_, i) =>
      radarPoint(CX, CY, R, i, N, scale)
    );
    return (
      pts
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
        .join(" ") + " Z"
    );
  });

  // Axis line endpoints
  const axisEnds = AXIS_KEYS.map((_, i) =>
    radarPoint(CX, CY, R * 1.15, i, N, 1)
  );

  // Label positions (pushed out further)
  const labelPositions = AXIS_KEYS.map((_, i) =>
    radarPoint(CX, CY, R * 1.35, i, N, 1)
  );

  const title = displayName || wallet || "Anonymous";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0E1A 0%, #111827 50%, #0F172A 100%)",
          fontFamily: '"Inter", "Helvetica", sans-serif',
        }}
      >
        {/* Left side — Compass visualization */}
        <div
          style={{
            width: "840px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg
            width="840"
            height="630"
            viewBox="0 0 840 630"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Grid rings */}
            {gridRings.map((path, i) => (
              <path
                key={`grid-${i}`}
                d={path}
                fill="none"
                stroke="rgba(200,220,255,0.12)"
                strokeWidth="1"
              />
            ))}

            {/* Axis lines */}
            {axisEnds.map((end, i) => (
              <line
                key={`axis-${i}`}
                x1={CX}
                y1={CY}
                x2={end.x}
                y2={end.y}
                stroke={AXIS_COLORS[i]}
                strokeWidth="1.5"
                opacity="0.4"
              />
            ))}

            {/* Axis endpoint dots */}
            {axisEnds.map((end, i) => (
              <circle
                key={`dot-${i}`}
                cx={end.x}
                cy={end.y}
                r="4"
                fill={AXIS_COLORS[i]}
                opacity="0.7"
              />
            ))}

            {/* Data shape fill */}
            <path d={dataPath} fill="rgba(91,157,245,0.2)" />

            {/* Data shape outline */}
            <path
              d={dataPath}
              fill="none"
              stroke="rgba(91,157,245,0.8)"
              strokeWidth="2.5"
            />

            {/* Data nodes */}
            {dataPoints.map((p, i) => (
              <g key={`node-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill={AXIS_COLORS[i]}
                  opacity="0.25"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={AXIS_COLORS[i]}
                  opacity="0.85"
                />
              </g>
            ))}

            {/* Center dot */}
            <circle cx={CX} cy={CY} r="3" fill="rgba(200,220,255,0.3)" />
          </svg>

          {/* Axis labels (positioned with absolute divs for text rendering) */}
          {AXIS_KEYS.map((key, i) => {
            const pos = labelPositions[i];
            return (
              <div
                key={`label-${i}`}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: "translate(-50%, -50%)",
                  color: AXIS_COLORS[i],
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textShadow: "0 0 8px rgba(0,0,0,0.8)",
                  display: "flex",
                }}
              >
                {AXIS_LABELS[key]}
              </div>
            );
          })}
        </div>

        {/* Right side — Branding & info */}
        <div
          style={{
            width: "360px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 40px",
          }}
        >
          {/* Logo / Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #818CF8, #6366F1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontSize: "22px",
              }}
            >
              🧭
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#E2E8F0",
                display: "flex",
              }}
            >
              Civic Compass
            </div>
          </div>

          {/* User name */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#CBD5E1",
              marginBottom: "12px",
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "15px",
              color: "#94A3B8",
              lineHeight: "1.5",
              display: "flex",
            }}
          >
            Political identity across 8 dimensions
          </div>

          {/* Dimension bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "28px",
              width: "100%",
            }}
          >
            {AXIS_KEYS.map((key, i) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "70px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: AXIS_COLORS[i],
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  {AXIS_LABELS[key]}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "6px",
                    borderRadius: "3px",
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${values[i] * 100}%`,
                      height: "100%",
                      borderRadius: "3px",
                      background: AXIS_COLORS[i],
                      opacity: 0.8,
                      display: "flex",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* URL watermark */}
          <div
            style={{
              fontSize: "12px",
              color: "#475569",
              marginTop: "32px",
              display: "flex",
            }}
          >
            compass.jomhoor.org
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
