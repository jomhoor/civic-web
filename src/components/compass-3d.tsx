"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { useAppStore } from "@/lib/store";
import { axisLabel } from "@/lib/i18n";
import { generateProfileQR, QR_SIZE } from "@/lib/qr";

/* ── Constants ── */
const TAU = Math.PI * 2;
const ROTATE_SPEED = 0.003;
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

/* ── Math helpers ── */
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

function rotate(
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
  return { x: cx + p.x * scale * f, y: cy + p.y * scale * f, f };
}

/* ── Component ── */
export interface Compass3DHandle {
  toDataURL: () => string | null;
}

interface Compass3DProps {
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
  userId?: string;
}

export const Compass3D = forwardRef<Compass3DHandle, Compass3DProps>(
  function Compass3D({ dimensions, confidence, userId }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const angleY = useRef(0);
  const raf = useRef<number>(0);
  const language = useAppStore((s) => s.language);
  const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? null,
  }));

  // Detect theme for QR color
  const isDark = typeof document !== "undefined"
    ? document.documentElement.getAttribute("data-theme") !== "light"
    : true;

  // Pre-generate QR code image when userId or theme changes
  useEffect(() => {
    if (!userId) { setQrImg(null); return; }
    let cancelled = false;
    const qrOpts = isDark
      ? { dark: "#ffffffCC", light: "#00000000" }
      : { dark: "#1E3A6BCC", light: "#00000000" };
    generateProfileQR(userId, qrOpts).then((dataUrl) => {
      if (cancelled) return;
      const img = new Image();
      img.onload = () => { if (!cancelled) setQrImg(img); };
      img.src = dataUrl;
    });
    return () => { cancelled = true; };
  }, [userId, isDark]);

  // Normalize [-1,1] → [0,1]
  const values = AXIS_KEYS.map((k) => ((dimensions[k] ?? 0) + 1) / 2);
  const axes3D = fibSphere(AXIS_KEYS.length);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = wrapper.getBoundingClientRect();
    const W = Math.min(rect.width, 520);
    const baseH = Math.min(W, 420);
    const qrExtra = qrImg ? QR_SIZE + 16 : 0;
    const H = baseH + qrExtra;
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const CX = W / 2;
    const CY = baseH / 2;
    const S = Math.min(W, baseH) * 0.32;

    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const curVals = valuesRef.current;

    // Theme-adaptive background
    ctx.fillStyle = isLight ? "#F5F7FA" : "#111111";
    ctx.fillRect(0, 0, W, H);
    angleY.current += ROTATE_SPEED;

    // Pre-compute positions
    const axisEnds: { x: number; y: number; f: number }[] = [];
    const dataEnds: { x: number; y: number; f: number }[] = [];
    const zOrder: { i: number; z: number }[] = [];

    for (let i = 0; i < axes3D.length; i++) {
      const a = axes3D[i];
      const r = rotate(a, angleY.current, 0.35);
      axisEnds.push(project(r, CX, CY, S * AXIS_OVERSHOOT));
      const rData = {
        x: r.x * curVals[i],
        y: r.y * curVals[i],
        z: r.z * curVals[i],
      };
      dataEnds.push(project(rData, CX, CY, S));
      zOrder.push({ i, z: r.z });
    }

    // Grid rings
    const gridSteps = [0.33, 0.66, 1.0];
    for (const gVal of gridSteps) {
      ctx.beginPath();
      for (let j = 0; j < axes3D.length; j++) {
        const a = axes3D[j];
        const r = rotate(
          { x: a.x * gVal, y: a.y * gVal, z: a.z * gVal },
          angleY.current,
          0.35
        );
        const p = project(r, CX, CY, S);
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = isLight
        ? "rgba(30,58,107,0.15)"
        : "rgba(200,220,255,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines
    for (let k = 0; k < axes3D.length; k++) {
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(axisEnds[k].x, axisEnds[k].y);
      ctx.strokeStyle = hexRGBA(AXIS_COLORS[k], 0.4);
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(axisEnds[k].x, axisEnds[k].y, 3, 0, TAU);
      ctx.fillStyle = hexRGBA(AXIS_COLORS[k], 0.7);
      ctx.fill();
    }

    // Data shape fill
    ctx.beginPath();
    for (let m = 0; m < axes3D.length; m++) {
      if (m === 0) ctx.moveTo(dataEnds[m].x, dataEnds[m].y);
      else ctx.lineTo(dataEnds[m].x, dataEnds[m].y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(91,157,245,0.2)";
    ctx.fill();

    // Data shape outline
    ctx.beginPath();
    for (let m = 0; m < axes3D.length; m++) {
      if (m === 0) ctx.moveTo(dataEnds[m].x, dataEnds[m].y);
      else ctx.lineTo(dataEnds[m].x, dataEnds[m].y);
    }
    ctx.closePath();
    ctx.strokeStyle =
      "rgba(91,157,245,0.75)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner triangles (depth illusion)
    for (let t = 0; t < axes3D.length; t++) {
      const t2 = (t + 1) % axes3D.length;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(dataEnds[t].x, dataEnds[t].y);
      ctx.lineTo(dataEnds[t2].x, dataEnds[t2].y);
      ctx.closePath();
      const avgZ = (zOrder[t].z + zOrder[t2].z) / 2;
      const faceAlpha = 0.06 + (1 + avgZ) * 0.06;
      ctx.fillStyle = hexRGBA(AXIS_COLORS[t], faceAlpha);
      ctx.fill();
    }

    // Data nodes (sorted by depth)
    zOrder.sort((a, b) => a.z - b.z);
    for (const { i: idx, z } of zOrder) {
      const dp = dataEnds[idx];
      const depthAlpha = 0.5 + (1 + z) * 0.25;
      const nodeR = 3 + dp.f * 2;

      ctx.beginPath();
      ctx.arc(dp.x, dp.y, nodeR + 4, 0, TAU);
      ctx.fillStyle = hexRGBA(AXIS_COLORS[idx], depthAlpha * 0.25);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dp.x, dp.y, nodeR, 0, TAU);
      ctx.fillStyle = hexRGBA(AXIS_COLORS[idx], depthAlpha);
      ctx.fill();
    }

    // Labels
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labelSize = Math.max(10, Math.round(S * 0.07));
    ctx.font = `700 ${labelSize}px "Inter", sans-serif`;

    for (const { i: lIdx, z: lz } of zOrder) {
      const le = axisEnds[lIdx];
      let labAlpha = 0.5 + (1 + lz) * 0.25;
      if (labAlpha > 1) labAlpha = 1;

      const ldx = le.x - CX;
      const ldy = le.y - CY;
      const lLen = Math.sqrt(ldx * ldx + ldy * ldy) || 1;
      const labX = le.x + (ldx / lLen) * 18;
      const labY = le.y + (ldy / lLen) * 18;

      const confCount = confidence[AXIS_KEYS[lIdx]] ?? 0;
      const label = axisLabel(AXIS_KEYS[lIdx], language);
      const lines = label.split("\n");

      ctx.fillStyle = isLight
        ? hexRGBA("#1E3A6B", labAlpha)
        : hexRGBA("#C8DCFF", labAlpha);

      for (let ll = 0; ll < lines.length; ll++) {
        ctx.fillText(
          lines[ll],
          labX,
          labY + (ll - (lines.length - 1) / 2) * 11
        );
      }

      // Confidence indicator
      if (confCount < 4) {
        const confSize = Math.max(7, Math.round(S * 0.045));
        ctx.font = `500 ${confSize}px "Inter", sans-serif`;
        ctx.fillStyle =
          hexRGBA("#D97706", labAlpha);
        ctx.fillText(
          confCount < 2 ? "?" : "~",
          labX,
          labY + (lines.length / 2) * 11 + 8
        );
        ctx.font = `600 ${labelSize}px "Inter", sans-serif`;
      }
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(CX, CY, 2, 0, TAU);
    ctx.fillStyle = isLight ? "rgba(30,58,107,0.25)" : "rgba(200,220,255,0.25)";
    ctx.fill();

    // QR code watermark (centered below compass)
    if (qrImg) {
      ctx.globalAlpha = 0.6;
      ctx.drawImage(qrImg, (W - QR_SIZE) / 2, baseH + 4, QR_SIZE, QR_SIZE);
      ctx.globalAlpha = 1;
    }

    raf.current = requestAnimationFrame(draw);
  }, [axes3D, confidence, language, qrImg]);

  useEffect(() => {
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [draw]);

  return (
    <div ref={wrapperRef} className="w-full max-w-lg mx-auto">
      <canvas
        ref={canvasRef}
        className="mx-auto block"
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
});
