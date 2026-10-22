import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "야디지북 | 충남 골프 코스 공략",
  description: "충남 7개 클럽 야디지북 — 홀별 거리, 해저드, 공략 메모",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-fairway-950 text-white antialiased">{children}</body>
    </html>
  );
}
