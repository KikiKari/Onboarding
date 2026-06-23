import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Projekt – Ideen werden Systeme", template: "%s | Projekt" },
  description:
    "Neun KI-Projekte, zwei Plattformen und ein gemeinsamer Ort für funktionierende Experimente.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Projekt – Ideen werden Systeme",
    description: "Onboarding, Projektseiten und interaktive Demos.",
    images: ["/media/og-projects.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
