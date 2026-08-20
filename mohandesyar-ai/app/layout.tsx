import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./print.css";
import PwaRegister from "./pwa-register";

export const metadata: Metadata = {
  title: "مهندس‌یار AI | دستیار هوشمند عمران و معماری",
  description: "سامانه حرفه‌ای مستندسازی میدانی و گزارش‌های رسمی پروژه‌های عمرانی و معماری.",
  manifest: "/manifest.webmanifest",
  applicationName: "مهندس‌یار AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مهندس‌یار AI",
  },
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
  other: { "codex-preview": "development" },
};

export const viewport: Viewport = {
  themeColor: "#082532",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body><PwaRegister />{children}</body></html>;
}
