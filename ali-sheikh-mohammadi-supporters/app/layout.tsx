import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "حامیان دکتر علی شیخ محمدی | ارومیه",
  description: "پایگاه خبر، نظرسنجی و مشارکت شهروندی حامیان دکتر علی شیخ محمدی برای شورای اسلامی شهر ارومیه.",
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
