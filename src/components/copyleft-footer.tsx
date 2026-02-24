"use client";

import { useAppStore } from "@/lib/store";

export function CopyleftFooter() {
  const language = useAppStore((s) => s.language);

  return (
    <footer
      className="w-full text-center py-4 px-4 text-[11px]"
      style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-color)" }}
    >
      {language === "fa" ? (
        <p dir="rtl" lang="fa">
          {"کپی‌لفت © ۲۰۲۶ "}
          <a
            href="https://Jomhoor.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--accent-primary)" }}
          >{"جمهور"}</a>
          {". هیچ حقی محفوظ نیست."}
        </p>
      ) : (
        <p dir="ltr">
          {"Copyleft © 2026 "}
          <a
            href="https://Jomhoor.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--accent-primary)" }}
          >Jomhoor</a>
          {". No rights reserved."}
        </p>
      )}
    </footer>
  );
}
