import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource/lalezar";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "BHB Smart Structure Lab",
  title: "BHB | مرکز فرمان کسب‌وکار مهندسی",
  description:
    "برنامه حرفه‌ای و آفلاین مدیریت مشتری، مالی، محتوا و نقشه رشد کسب‌وکار مهندسی یوسف بهرام‌بیگی.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BHB Smart",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#071d24",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
