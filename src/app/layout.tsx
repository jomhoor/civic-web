import { CopyleftFooter } from "@/components/copyleft-footer";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
  description:
    "Map your civic identity across eight dimensions. Your politics has a shape, not a side.",
  openGraph: {
    title: "Civic Compass — Your Multidimensional Voice",
    description:
      "Eight policy dimensions. One unique shape. Move beyond left-right — discover where you truly stand.",
    url: "https://compass.jomhoor.org",
    siteName: "Civic Compass",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Civic Compass — Your Multidimensional Voice",
    description:
      "Eight policy dimensions. One unique shape. Move beyond left-right.",
  },
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
            <CopyleftFooter />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
