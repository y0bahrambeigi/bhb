# Python Learning Studio Ultra

محیط فوق‌مدرن و تعاملی فارسی برای یادگیری Python، برنامه‌نویسی علمی و پروژه‌های مهندسی عمران.

**طراحی و توسعه:** یوسف بهرام بیگی | Yousef Bahram Beigi

## قابلیت‌های اصلی

- Monaco Editor شبیه VS Code
- اجرای واقعی Python با Pyodide
- NumPy و Matplotlib و نمایش نمودار داخل برنامه
- Test Runner و تمرین‌های خودکار
- آزمون چندمرحله‌ای، XP، Level و Achievement
- پروژه‌های مهندسی عمران: خمش تیر، خرپا و SDOF
- توضیح صوتی فارسی
- PWA و Service Worker
- ذخیره پیشرفت در LocalStorage
- AI Tutor محلی + امکان اتصال به AI Gateway امن

## اجرای زنده

https://y0bahrambeigi.github.io/bhb/python-learning-studio-pro/

## Citation / DOI

نسخه `1.0.0` برای آرشیو علمی و دریافت DOI رسمی آماده شده است.

- `CITATION.cff` — فراداده استاندارد استناد نرم‌افزار
- `.zenodo.json` — فراداده آماده Zenodo
- `RELEASE_NOTES_v1.0.0.md` — یادداشت انتشار نسخه مرجع

**وضعیت DOI:** Pending Zenodo registration. شماره DOI رسمی فقط پس از آرشیو Release توسط Zenodo/DataCite درج خواهد شد و هیچ DOI ساختگی در پروژه استفاده نمی‌شود.

عنوان استناد پیشنهادی:

> Yousef Bahram Beigi. *Python Learning Studio Ultra: An Interactive Python and Computational Civil Engineering Learning Environment*. Version 1.0.0, 2026.

## معماری چندسکویی

این پروژه اکنون چهار مسیر اجرا دارد:

1. **Web/PWA** — اجرا روی Chrome, Edge, Firefox و Safari و نصب به‌صورت وب‌اپ روی بسیاری از دستگاه‌ها.
2. **Windows / macOS / Linux** — بسته‌بندی با Electron و electron-builder.
3. **Android** — بسته‌بندی با Capacitor و ساخت APK توسط GitHub Actions.
4. **iOS** — تولید پروژه Capacitor/Xcode توسط GitHub Actions؛ خروجی IPA نهایی به امضای Apple Developer نیاز دارد.

## ساخت دسکتاپ در سیستم محلی

```bash
cd python-learning-studio-pro
npm install
npm run desktop
```

برای تولید فایل‌های نصب:

```bash
npm run desktop:dist
```

خروجی‌های هدف شامل Windows NSIS/Portable، macOS DMG/ZIP و Linux AppImage/DEB هستند.

## Android

```bash
npm install
npm run mobile:prepare
npx cap add android
npx cap sync android
```

Workflow با نام `Build Python Studio Android` به‌صورت خودکار APK دیباگ را به‌عنوان Artifact تولید می‌کند. برای انتشار در Google Play باید keystore و امضای Release جداگانه اضافه شود.

## iOS

```bash
npm install
npm run mobile:prepare
npx cap add ios
npx cap sync ios
```

Workflow با نام `Prepare Python Studio iOS` پروژه Xcode را می‌سازد. امضای نهایی و انتشار در App Store نیازمند Apple Developer Account، Certificate و Provisioning Profile است.

## حالت آفلاین

فایل‌های اصلی برنامه، آیکون و منابع بازدیدشده توسط Service Worker کش می‌شوند. Pyodide، Monaco، NumPy و Matplotlib در اولین بارگذاری از CDN دریافت می‌شوند و سپس مرورگر تلاش می‌کند پاسخ‌های دریافت‌شده را برای استفاده آفلاین کش کند. برای بسته کاملاً آفلاین و بدون نیاز به اولین اتصال اینترنت، باید Runtimeهای Pyodide و Monaco به‌صورت محلی Vendor شوند؛ این مرحله حجم مخزن و بسته نهایی را به‌طور قابل‌توجهی افزایش می‌دهد.

## AI واقعی

کلید API نباید داخل GitHub Pages یا JavaScript عمومی قرار گیرد. برنامه یک `AI Gateway endpoint` می‌پذیرد تا ارتباط با مدل AI از طریق backend/serverless امن انجام شود.

## فایل‌های Cross-platform

- `package.json` — Electron و Capacitor
- `desktop/electron/main.cjs` — پوسته Desktop
- `capacitor.config.json` — تنظیمات Android/iOS
- `scripts/prepare-mobile.mjs` — آماده‌سازی Web Assets برای موبایل
- `.github/workflows/python-studio-desktop.yml`
- `.github/workflows/python-studio-android.yml`
- `.github/workflows/python-studio-ios.yml`

## توسعه‌دهنده

**Yousef Bahram Beigi**  
Civil Engineering • Python • AI • Computational Engineering
