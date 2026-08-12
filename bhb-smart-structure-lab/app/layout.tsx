import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource/lalezar";
import "./globals.css";

export const metadata: Metadata = {
  title: "آزمایشگاه سازه هوشمند BHB",
  description:
    "نقشه عملی تبدیل تخصص مهندسی سازه، هوش مصنوعی و آموزش به یک کسب‌وکار درآمدزا و پایدار.",
  other: {
    "codex-preview": "development",
  },
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
      <body>{children}</body>
    </html>
  );
}
