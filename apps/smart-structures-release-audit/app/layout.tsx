import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سازه‌های هوشمند | میز ممیزی انتشار",
  description: "مدیریت شواهد، گیت‌ها و بازبینی ۴۰ صفحه برای نسخهٔ v1.0.1 — وضعیت NO-GO",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
