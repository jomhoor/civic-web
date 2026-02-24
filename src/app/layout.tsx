import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://compass.jomhoor.org"
  ),
  title: "Civic Compass",
  description: "Track your civic identity as it evolves",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <Providers>
          <ThemeProvider>
            {children}
            <footer
              className="w-full text-center py-4 px-4 text-[11px] space-y-0.5"
              style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-color)" }}
            >
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
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
