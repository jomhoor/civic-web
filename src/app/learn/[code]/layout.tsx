import type { Metadata } from "next";
import type { ReactNode } from "react";

const API_BASE =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://compass.jomhoor.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  let titleFa = "";
  let titleEn = code;

  try {
    const res = await fetch(`${API_BASE}/flashcards/decks/${encodeURIComponent(code)}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      titleFa = data.titleFa || "";
      titleEn = data.titleEn || code;
    }
  } catch {
    // Use defaults
  }

  const title = titleFa ? `${titleFa} — Civic Compass` : `${titleEn} — Civic Compass`;
  const description = titleFa
    ? `یادگیری ${titleFa} با فلش‌کارت‌های تعاملی`
    : `Learn ${titleEn} with interactive flashcards`;
  const url = `${SITE_URL}/learn/${encodeURIComponent(code)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Civic Compass",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function LearnDeckLayout({ children }: { children: ReactNode }) {
  return children;
}
