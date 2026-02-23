"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const hasVisited = useAppStore((s) => s.hasVisited);

  useEffect(() => {
    if (user) {
      // Already authenticated — go to dashboard
      router.replace("/dashboard");
    } else if (hasVisited) {
      // Visited before but logged out — go to connect
      router.replace("/connect");
    } else {
      // First visit — show welcome/settings page
      router.replace("/welcome");
    }
  }, [user, hasVisited, router]);

  return null;
}
