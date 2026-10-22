import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SG-DLS Research Lab | یوسف بهرام بیگی', description: 'آزمایشگاه تعاملی نتایج بهینه‌سازی خرپای فولادی؛ داده‌های معتبر و دستیار پژوهش مبتنی بر شواهد' };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="fa" dir="rtl"><body>{children}</body></html>; }
