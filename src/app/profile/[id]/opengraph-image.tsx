import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Civic Compass Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ── Constants (matching compass-3d.tsx) ── */
const TAU = Math.PI * 2;
const FOV = 600;
const AXIS_OVERSHOOT = 1.15;

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
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

/* ── 3D math helpers (same as compass-3d.tsx) ── */
function hexRGBA(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function fibSphere(n: number) {
  const pts: { x: number; y: number; z: number }[] = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < n; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / n);
    const phi = (TAU * i) / golden;
    pts.push({
      x: Math.sin(theta) * Math.cos(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(theta),
    });
  }
  return pts;
}

function rotate3D(
  p: { x: number; y: number; z: number },
  ay: number,
  ax: number
) {
  const cosY = Math.cos(ay),
    sinY = Math.sin(ay);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;
  const cosX = Math.cos(ax),
    sinX = Math.sin(ax);
  const y1 = p.y * cosX - z1 * sinX;
  const z2 = p.y * sinX + z1 * cosX;
  return { x: x1, y: y1, z: z2 };
}

function project(
  p: { x: number; y: number; z: number },
  cx: number,
  cy: number,
  scale: number
) {
  const f = FOV / (FOV + p.z * scale);
  return { x: cx + p.x * scale * f, y: cy + p.y * scale * f, f, z: p.z };
}

/* ── Detect if text contains RTL characters ── */
function isRTL(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Derive classic Political Compass 2-axis from 8 dimensions.
 * X = economy (-1 left, +1 right)
 * Y = inverted average of governance, civil_liberties, society, justice
 *     +1 = authoritarian (top), -1 = libertarian (bottom)
 */
function toPoliticalCompass(dims: Record<string, number>) {
  const economic = dims.economy ?? 0;
  const social =
    -((dims.governance ?? 0) +
      (dims.civil_liberties ?? 0) +
      (dims.society ?? 0) +
      (dims.justice ?? 0)) / 4;
  return { economic, social };
}

/* ── Font loader (Vazirmatn for Persian, fetched once at edge) ── */
const vazirmatnPromise = fetch(
  "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Bold.ttf"
).then((res) => res.arrayBuffer());

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;

  // Load Persian font
  let vazirmatnData: ArrayBuffer | null = null;
  try {
    vazirmatnData = await vazirmatnPromise;
  } catch {
    // Fallback without Persian font
  }

  // Fetch compass data from backend
  let dimensions: Record<string, number> = {};
  let displayName: string | null = null;
  let wallet = "";

  try {
    const res = await fetch(`${API_BASE}/compass/profile/${userId}`, {
      next: { revalidate: 300 },
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

  // ── 3D projection (static snapshot at a nice angle) ──
  const CX = 340;
  const CY = 315;
  const S = 180; // scale
  const ANGLE_Y = 0.6; // fixed Y rotation (nice viewing angle)
  const ANGLE_X = 0.35; // fixed X tilt

  const axes3D = fibSphere(AXIS_KEYS.length);

  // Project axis endpoints and data points
  const axisEnds = axes3D.map((a) => {
    const r = rotate3D(a, ANGLE_Y, ANGLE_X);
    return project(r, CX, CY, S * AXIS_OVERSHOOT);
  });

  const dataEnds = axes3D.map((a, i) => {
    const r = rotate3D(a, ANGLE_Y, ANGLE_X);
    const rData = { x: r.x * values[i], y: r.y * values[i], z: r.z * values[i] };
    return project(rData, CX, CY, S);
  });

  const zOrder = axes3D.map((a, i) => {
    const r = rotate3D(a, ANGLE_Y, ANGLE_X);
    return { i, z: r.z };
  });

  // Grid rings 
  const gridRings = [0.33, 0.66, 1.0].map((gVal) => {
    const pts = axes3D.map((a) => {
      const r = rotate3D(
        { x: a.x * gVal, y: a.y * gVal, z: a.z * gVal },
        ANGLE_Y,
        ANGLE_X
      );
      return project(r, CX, CY, S);
    });
    return (
      pts.map((p, j) => `${j === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z"
    );
  });

  // Data shape path
  const dataPath =
    dataEnds.map((p, j) => `${j === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  // Triangle face paths (for depth shading)
  const triangles = axes3D.map((_, t) => {
    const t2 = (t + 1) % axes3D.length;
    const avgZ = (zOrder[t].z + zOrder[t2].z) / 2;
    const faceAlpha = 0.06 + (1 + avgZ) * 0.06;
    return {
      path: `M${CX},${CY} L${dataEnds[t].x.toFixed(1)},${dataEnds[t].y.toFixed(1)} L${dataEnds[t2].x.toFixed(1)},${dataEnds[t2].y.toFixed(1)} Z`,
      color: hexRGBA(AXIS_COLORS[t], faceAlpha),
    };
  });

  // Label positions (pushed out further)
  const labelEnds = axes3D.map((a) => {
    const r = rotate3D(a, ANGLE_Y, ANGLE_X);
    return project(r, CX, CY, S * 1.4);
  });

  // Sort by depth for proper rendering  
  const sortedZ = [...zOrder].sort((a, b) => a.z - b.z);

  const title = displayName || wallet || "Anonymous";
  const titleIsRTL = isRTL(title);
  // Wrap RTL text with Unicode bidi isolate characters so Satori renders correct word order
  const displayTitle = titleIsRTL ? `\u2067${title}\u2069` : title;

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
          background: "#111111",
          fontFamily: '"Inter", "Vazirmatn", "Helvetica", sans-serif',
        }}
      >
        {/* Left side — 3D Compass */}
        <div
          style={{
            width: "680px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg
            width="680"
            height="630"
            viewBox="0 0 680 630"
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
                key={`adot-${i}`}
                cx={end.x}
                cy={end.y}
                r="3.5"
                fill={AXIS_COLORS[i]}
                opacity="0.7"
              />
            ))}

            {/* Triangle faces (depth illusion) */}
            {triangles.map((tri, i) => (
              <path
                key={`tri-${i}`}
                d={tri.path}
                fill={tri.color}
              />
            ))}

            {/* Data shape fill */}
            <path d={dataPath} fill="rgba(91,157,245,0.18)" />

            {/* Data shape outline */}
            <path
              d={dataPath}
              fill="none"
              stroke="rgba(91,157,245,0.75)"
              strokeWidth="2"
            />

            {/* Data nodes (depth-sorted) */}
            {sortedZ.map(({ i: idx, z }) => {
              const dp = dataEnds[idx];
              const depthAlpha = 0.5 + (1 + z) * 0.25;
              const nodeR = 3 + (dp.f ?? 1) * 2;
              return (
                <g key={`node-${idx}`}>
                  <circle
                    cx={dp.x}
                    cy={dp.y}
                    r={nodeR + 3}
                    fill={hexRGBA(AXIS_COLORS[idx], depthAlpha * 0.25)}
                  />
                  <circle
                    cx={dp.x}
                    cy={dp.y}
                    r={nodeR}
                    fill={hexRGBA(AXIS_COLORS[idx], depthAlpha)}
                  />
                </g>
              );
            })}

            {/* Center dot */}
            <circle cx={CX} cy={CY} r="2.5" fill="rgba(200,220,255,0.25)" />
          </svg>

          {/* Axis labels */}
          {AXIS_KEYS.map((key, i) => {
            const le = labelEnds[i];
            const lz = zOrder[i].z;
            const labAlpha = Math.min(1, 0.5 + (1 + lz) * 0.25);
            return (
              <div
                key={`label-${i}`}
                style={{
                  position: "absolute",
                  left: `${le.x}px`,
                  top: `${le.y}px`,
                  transform: "translate(-50%, -50%)",
                  color: hexRGBA("#C8DCFF", labAlpha),
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                  textShadow: "0 0 10px rgba(0,0,0,0.9)",
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
            width: "520px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 60px 0 40px",
          }}
        >
          {/* Logo / Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #818CF8, #6366F1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "14px",
                fontSize: "24px",
              }}
            >
              🧭
            </div>
            <div
              style={{
                fontSize: "28px",
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
              fontSize: "22px",
              fontWeight: 600,
              color: "#CBD5E1",
              marginBottom: "8px",
              display: "flex",
              direction: titleIsRTL ? "rtl" : "ltr",
              fontFamily: titleIsRTL ? "Vazirmatn" : "Inter",
              width: "100%",
            }}
          >
            {displayTitle}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "16px",
              color: "#94A3B8",
              lineHeight: "1.5",
              marginBottom: "8px",
              display: "flex",
            }}
          >
            View user's civic compass
          </div>

          {/* Separator */}
          <div
            style={{
              width: "60px",
              height: "2px",
              background: "linear-gradient(90deg, #818CF8, #6366F1)",
              borderRadius: "1px",
              marginBottom: "16px",
              display: "flex",
            }}
          />

          {/* 2D Political Compass Chart */}
          {(() => {
            const { economic, social } = toPoliticalCompass(dimensions);
            const S2 = 320; // chart size
            const P = 40;   // padding
            const G = S2 - P * 2; // grid area
            const C = S2 / 2;     // center
            const dotX2 = C + (economic * G) / 2;
            const dotY2 = C - (social * G) / 2; // invert: authoritarian at top
            const qAlpha = 0.15;

            return (
              <div style={{ display: "flex", position: "relative", width: `${S2}px`, height: `${S2}px` }}>
                <svg width={S2} height={S2} viewBox={`0 0 ${S2} ${S2}`}>
                  {/* Quadrant backgrounds */}
                  <rect x={P} y={P} width={G / 2} height={G / 2} fill={`rgba(232,116,97,${qAlpha})`} />
                  <rect x={C} y={P} width={G / 2} height={G / 2} fill={`rgba(96,165,250,${qAlpha})`} />
                  <rect x={P} y={C} width={G / 2} height={G / 2} fill={`rgba(52,211,153,${qAlpha})`} />
                  <rect x={C} y={C} width={G / 2} height={G / 2} fill={`rgba(167,139,250,${qAlpha})`} />

                  {/* Grid lines */}
                  {[-0.5, 0.5].map((v) => (
                    <g key={v}>
                      <line x1={C + (v * G) / 2} y1={P} x2={C + (v * G) / 2} y2={S2 - P} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                      <line x1={P} y1={C - (v * G) / 2} x2={S2 - P} y2={C - (v * G) / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    </g>
                  ))}

                  {/* Main axes */}
                  <line x1={C} y1={P} x2={C} y2={S2 - P} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <line x1={P} y1={C} x2={S2 - P} y2={C} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

                  {/* User dot */}
                  <circle cx={dotX2} cy={dotY2} r="10" fill="#818CF8" opacity="0.3" />
                  <circle cx={dotX2} cy={dotY2} r="6" fill="#818CF8" />
                  <circle cx={dotX2} cy={dotY2} r="2.5" fill="#1a1a1a" opacity="0.8" />
                </svg>

                {/* Axis labels */}
                <div style={{ position: "absolute", top: `${P - 18}px`, left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "flex" }}>
                  Authoritarian
                </div>
                <div style={{ position: "absolute", bottom: `${P - 18}px`, left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "flex" }}>
                  Libertarian
                </div>
                <div style={{ position: "absolute", left: `${P - 36}px`, top: "50%", transform: "translateY(-50%)", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "flex" }}>
                  Left
                </div>
                <div style={{ position: "absolute", right: `${P - 36}px`, top: "50%", transform: "translateY(-50%)", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "flex" }}>
                  Right
                </div>

                {/* Quadrant labels */}
                <div style={{ position: "absolute", top: `${P + G * 0.12}px`, left: `${P + G * 0.12}px`, fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "flex" }}>
                  Auth Left
                </div>
                <div style={{ position: "absolute", top: `${P + G * 0.12}px`, right: `${P + G * 0.12}px`, fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "flex" }}>
                  Auth Right
                </div>
                <div style={{ position: "absolute", bottom: `${P + G * 0.12}px`, left: `${P + G * 0.12}px`, fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "flex" }}>
                  Lib Left
                </div>
                <div style={{ position: "absolute", bottom: `${P + G * 0.12}px`, right: `${P + G * 0.12}px`, fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "flex" }}>
                  Lib Right
                </div>

                {/* Coordinate label near dot */}
                <div style={{
                  position: "absolute",
                  left: `${dotX2 + 14}px`,
                  top: `${dotY2 - 16}px`,
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#818CF8",
                  display: "flex",
                }}>
                  ({economic.toFixed(2)}, {social.toFixed(2)})
                </div>
              </div>
            );
          })()}

          {/* URL watermark */}
          <div
            style={{
              fontSize: "13px",
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
      fonts: [
        ...(vazirmatnData
          ? [
              {
                name: "Vazirmatn",
                data: vazirmatnData,
                weight: 700 as const,
                style: "normal" as const,
              },
            ]
          : []),
      ],
    }
  );
}
