# Release presentation

## GitHub Release draft for the current package

**Tag:** `smart-structures-v1.0.0-rc1`

**Title:** `Smart Structures v1.0.0-rc1`

**Body:**

> نامزد انتشار نخست کتاب «سازه‌های هوشمند و کنترل پاسخ لرزه‌ای» اثر یوسف بهرام بیگی.
>
> این بسته شامل منبع DOCX با فونت‌های فارسی جاسازی‌شده، PDF دیجیتال Tagged با زبان `fa-IR` و وب‌اپ تعاملی و آفلاین کتاب است. کتابنامه و پیوندهای DOI بازبینی شده‌اند و مطالب اصیل کتاب تحت CC BY 4.0 عرضه می‌شوند.
>
> این انتشار صرفاً دیجیتال است. فایل `print-candidate` دارایی انتشار نهایی نیست و PDF/X-4، قطع، bleed و ICC در دامنه این نسخه قرار ندارند. انتشار نهایی `v1.0.0` پس از رزرو DOI نسخه در Zenodo و همگام‌سازی فراداده انجام می‌شود.
>
> تمامیت فایل‌ها را با `SHA256SUMS` بررسی کنید.

Attach these assets:

- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_source.docx`
- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_digital.pdf`
- `SHA256SUMS`
- `CITATION.bib`
- `CITATION.cff`
- `LICENSE.md`

## Exact PR note now

> QA نامزد انتشار دیجیتال Smart Structures v1.0.0-rc1 تکمیل شد. منبع DOCX، PDF دیجیتال Tagged، وب‌اپ نصب‌شونده، کتابنامه، مجوز CC BY 4.0، فرادادهٔ استناد، مجوز فونت‌ها و checksumها آماده‌اند. نسخه چاپی خارج از دامنه است. PR باید Draft بماند تا DOI نسخه در Zenodo رزرو و در همه دارایی‌های دیجیتال یکسان‌سازی شود.

## Final release gate

Only after the exact Zenodo DOI, digital publication date, synchronized metadata, webapp validation, and final checksums exist:

- create tag `smart-structures-v1.0.0`;
- title the release `Smart Structures v1.0.0`;
- use squash-merge title `Publish Smart Structures digital book v1.0.0 (#12)`;
- post the final QA note, replacing every release-candidate statement with evidence from the final files.
