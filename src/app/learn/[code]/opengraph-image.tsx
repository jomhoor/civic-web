import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Civic Compass — Learn";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API_BASE =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

export default async function OGImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let titleFa = "";
  let titleEn = "";
  let cardCount = 0;

  try {
    const res = await fetch(`${API_BASE}/flashcards/decks/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      // Strip ZWNJ (U+200C) — Satori's bidi algorithm reverses segments around it
      titleFa = String(data.titleFa ?? "").replace(/\u200C/g, "");
      titleEn = String(data.titleEn ?? "");
      cardCount = data.cards?.length ?? 0;
    }
  } catch {
    // Fallback
  }

  // Load Parastoo font for Persian text
  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/parastoo@5.2.3/files/parastoo-arabic-700-normal.woff"
    );
    if (fontRes.ok) fontData = await fontRes.arrayBuffer();
  } catch {
    // Fallback without custom font
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
          fontFamily: fontData ? "Parastoo" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,187,144,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "rgba(14,187,144,0.2)",
            border: "2px solid rgba(14,187,144,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            fontSize: "32px",
            color: "#0EBB90",
            fontWeight: 700,
          }}
        >
          {"CC"}
        </div>

        {/* Persian title — use row-reverse flex to simulate RTL (Satori ignores CSS direction and crashes on Unicode bidi marks) */}
        {titleFa.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
              width: "100%",
              padding: "0 40px",
            }}
          >
            {titleFa.split(/\s+/).map((word, i) => (
              <div
                key={i}
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#ffffff",
                  display: "flex",
                }}
              >
                {word}
              </div>
            ))}
          </div>
        ) : null}

        {/* English title */}
        {titleEn.length > 0 ? (
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            {titleEn}
          </div>
        ) : null}

        {/* Card count badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 24px",
            borderRadius: "999px",
            background: "rgba(14,187,144,0.2)",
            border: "1px solid rgba(14,187,144,0.3)",
            marginBottom: "32px",
          }}
        >
          <div style={{ fontSize: "18px", color: "#0EBB90", fontWeight: 600, display: "flex" }}>
            {`${String(cardCount)} cards`}
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "absolute",
            bottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              display: "flex",
            }}
          >
            {"Civic Compass - Learn & Earn"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Parastoo",
              data: fontData,
              weight: 700 as const,
              style: "normal" as const,
            },
          ]
        : [],
    }
  );
}
