import type { Metadata } from "next";
import type { ReactNode } from "react";

const API_BASE =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: userId } = await params;

  let title = "Civic Compass Profile";
  let description = "View user's civic compass";

  try {
    const res = await fetch(`${API_BASE}/compass/profile/${userId}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const name = data.displayName || data.wallet || "Anonymous";
      title = `${name} — Civic Compass`;
      description = `View ${name}'s civic compass`;
    }
  } catch {
    // Use defaults
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Civic Compass",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
