import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Civic Compass — Your Multidimensional Voice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AXES = [
  { key: "Economy", color: "#0EBB90", value: 0.7 },
  { key: "Governance", color: "#8CDAF5", value: 0.55 },
  { key: "Civil Liberties", color: "#FEEB34", value: 0.85 },
  { key: "Society", color: "#E87461", value: 0.6 },
  { key: "Diplomacy", color: "#A78BFA", value: 0.45 },
  { key: "Environment", color: "#34D399", value: 0.75 },
  { key: "Justice", color: "#F59E0B", value: 0.65 },
  { key: "Technology", color: "#60A5FA", value: 0.8 },
];

/* ── 3D Math (matches compass-3d.tsx) ── */
const TAU = Math.PI * 2;
const FOV = 600;
const AXIS_OVERSHOOT = 1.15;

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

function rot(
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
  return { x: x1, y: p.y * cosX - z1 * sinX, z: p.y * sinX + z1 * cosX };
}

function proj(
  p: { x: number; y: number; z: number },
  cx: number,
  cy: number,
  s: number
) {
  const f = FOV / (FOV + p.z * s);
  return { x: cx + p.x * s * f, y: cy + p.y * s * f, f };
}

function hexRGBA(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function OGImage() {
  const cx = 420;
  const cy = 315;
  const S = 200;
  const n = AXES.length;
  const angleY = 0.6;
  const angleX = 0.35;
  const axes3D = fibSphere(n);

  // Project axis endpoints (with overshoot)
  const axisEnds = axes3D.map((a) => {
    const r = rot(a, angleY, angleX);
    return {
      ...proj(
        {
          x: r.x * AXIS_OVERSHOOT,
          y: r.y * AXIS_OVERSHOOT,
          z: r.z * AXIS_OVERSHOOT,
        },
        cx,
        cy,
        S
      ),
      z: r.z,
    };
  });

  // Project data points (scaled by value)
  const dataEnds = axes3D.map((a, i) => {
    const v = AXES[i].value;
    const r = rot(a, angleY, angleX);
    return {
      ...proj({ x: r.x * v, y: r.y * v, z: r.z * v }, cx, cy, S),
      z: r.z,
    };
  });

  // Grid rings (3D projected polygons)
  const gridSteps = [0.33, 0.66, 1.0];
  const gridRings = gridSteps.map((gv) =>
    axes3D
      .map((a) => {
        const r = rot(
          { x: a.x * gv, y: a.y * gv, z: a.z * gv },
          angleY,
          angleX
        );
        const p = proj(r, cx, cy, S);
        return `${p.x},${p.y}`;
      })
      .join(" ")
  );

  // Data shape polygon
  const dataPolygon = dataEnds.map((p) => `${p.x},${p.y}`).join(" ");

  // Inner triangles for depth illusion
  const triangles = axes3D.map((_, i) => {
    const i2 = (i + 1) % n;
    const avgZ = (dataEnds[i].z + dataEnds[i2].z) / 2;
    const alpha = 0.06 + (1 + avgZ) * 0.06;
    return {
      points: `${cx},${cy} ${dataEnds[i].x},${dataEnds[i].y} ${dataEnds[i2].x},${dataEnds[i2].y}`,
      fill: hexRGBA(AXES[i].color, alpha),
    };
  });

  // Depth-sorted indices for proper rendering
  const depthOrder = axes3D
    .map((_, i) => ({ i, z: dataEnds[i].z }))
    .sort((a, b) => a.z - b.z);

  // Label positions (further from center)
  const labelEnds = axes3D.map((a) => {
    const r = rot(a, angleY, angleX);
    const lk = AXIS_OVERSHOOT * 1.35;
    return {
      ...proj({ x: r.x * lk, y: r.y * lk, z: r.z * lk }, cx, cy, S),
      z: r.z,
    };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #121228 50%, #0d1117 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* 3D Compass area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "840px",
            height: "100%",
            position: "relative",
          }}
        >
          <svg
            width="840"
            height="630"
            viewBox="0 0 840 630"
            style={{ position: "absolute" }}
          >
            {/* Grid rings (3D projected) */}
            {gridRings.map((ring, idx) => (
              <polygon
                key={`grid-${idx}`}
                points={ring}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}

            {/* Axis lines from center to endpoints */}
            {AXES.map((a, i) => (
              <line
                key={`axis-${i}`}
                x1={cx}
                y1={cy}
                x2={axisEnds[i].x}
                y2={axisEnds[i].y}
                stroke={a.color}
                strokeWidth="1.2"
                opacity="0.4"
              />
            ))}

            {/* Axis endpoint dots */}
            {AXES.map((a, i) => (
              <circle
                key={`axdot-${i}`}
                cx={axisEnds[i].x}
                cy={axisEnds[i].y}
                r="3"
                fill={hexRGBA(a.color, 0.7)}
              />
            ))}

            {/* Inner triangles (depth-shaded faces) */}
            {triangles.map((t, i) => (
              <polygon
                key={`tri-${i}`}
                points={t.points}
                fill={t.fill}
              />
            ))}

            {/* Data shape outline + fill */}
            <polygon
              points={dataPolygon}
              fill="rgba(91,157,245,0.15)"
              stroke="rgba(91,157,245,0.75)"
              strokeWidth="2"
            />

            {/* Data nodes — depth sorted, with glow */}
            {depthOrder.map(({ i: idx, z }) => {
              const dp = dataEnds[idx];
              const alpha = Math.min(1, 0.5 + (1 + z) * 0.25);
              const nodeR = 3 + dp.f * 2;
              return (
                <g key={`node-${idx}`}>
                  <circle
                    cx={dp.x}
                    cy={dp.y}
                    r={nodeR + 4}
                    fill={hexRGBA(AXES[idx].color, alpha * 0.25)}
                  />
                  <circle
                    cx={dp.x}
                    cy={dp.y}
                    r={nodeR}
                    fill={hexRGBA(AXES[idx].color, alpha)}
                  />
                </g>
              );
            })}

            {/* Center dot */}
            <circle
              cx={cx}
              cy={cy}
              r="2"
              fill="rgba(200,220,255,0.25)"
            />
          </svg>

          {/* Depth-sorted labels */}
          {depthOrder.map(({ i: lIdx, z: lz }) => {
            const le = labelEnds[lIdx];
            const alpha = Math.min(1, 0.5 + (1 + lz) * 0.25);
            return (
              <div
                key={`label-${lIdx}`}
                style={{
                  position: "absolute",
                  left: `${le.x - 60}px`,
                  top: `${le.y - 10}px`,
                  width: "120px",
                  textAlign: "center",
                  color: hexRGBA(AXES[lIdx].color, alpha),
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {AXES[lIdx].key}
              </div>
            );
          })}
        </div>

        {/* Right side — text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: "60px",
            width: "360px",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Civic</span>
            <span>Compass</span>
          </div>

          <div
            style={{
              width: "48px",
              height: "3px",
              background: "linear-gradient(90deg, #5B9DF5, #A78BFA)",
              borderRadius: "2px",
              display: "flex",
            }}
          />

          <div
            style={{
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: 1.5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your politics has a shape,</span>
            <span>not a side.</span>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            compass.jomhoor.org
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, #0EBB90, #8CDAF5, #FEEB34, #E87461, #A78BFA, #34D399, #F59E0B, #60A5FA)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
