import type { Metadata } from "next";
import "./globals.css";
import "./print.css";

export const metadata: Metadata = {
  title: "مهندس‌یار AI | دستیار هوشمند عمران و معماری",
  description: "سامانه حرفه‌ای مستندسازی میدانی و گزارش‌های رسمی پروژه‌های عمرانی و معماری.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
