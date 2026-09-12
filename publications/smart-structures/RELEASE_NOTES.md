# Release presentation

## GitHub Release draft for the current package

**Tag:** `smart-structures-v1.0.0-rc1`

**Title:** `Smart Structures v1.0.0-rc1`

**Body:**

> نامزد انتشار نخست کتاب «سازه‌های هوشمند و کنترل پاسخ لرزه‌ای» اثر یوسف بهرام بیگی.
>
> این بسته شامل منبع DOCX با فونت‌های فارسی جاسازی‌شده، PDF دیجیتال Tagged با زبان `fa-IR`، و یک PDF نامزد چاپ برای هماهنگی با چاپخانه است. کتابنامه و پیوندهای DOI بازبینی شده‌اند و مطالب اصیل کتاب تحت CC BY 4.0 عرضه می‌شوند.
>
> فایل `print-candidate` PDF/X-4 نهایی نیست و برای تولید چاپی مجاز نیست. انتشار نهایی `v1.0.0` پس از درج DOI یا ISBN واقعی، تأیید ناشر، و دریافت و اجرای مشخصات قطع/bleed/ICC چاپخانه انجام می‌شود.
>
> تمامیت فایل‌ها را با `SHA256SUMS` بررسی کنید.

Attach these assets:

- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_source.docx`
- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_digital.pdf`
- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_print-candidate.pdf`
- `SHA256SUMS`
- `CITATION.bib`
- `LICENSE.md`

## Exact PR note now

> QA نامزد انتشار Smart Structures v1.0.0-rc1 تکمیل شد. منبع DOCX، PDF دیجیتال Tagged، کتابنامه، مجوز CC BY 4.0، فرادادهٔ استناد، مجوز فونت‌ها و checksumها آماده‌اند. فایل چاپی فعلی صرفاً `print-candidate` است و PDF/X-4 نهایی محسوب نمی‌شود. PR باید Draft بماند تا مقدار دقیق DOI یا ISBN، نام ناشر و مشخصات قطع/bleed/ICC چاپخانه ارائه و در همهٔ دارایی‌ها یکسان‌سازی شود.

## Final release gate

Only after the exact identifier, publisher, printer specification, PDF/X-4 validation report, and final checksums exist:

- create tag `smart-structures-v1.0.0`;
- title the release `Smart Structures v1.0.0`;
- use squash-merge title `Publish Smart Structures book v1.0.0 (#12)`;
- post the final QA note, replacing every release-candidate statement with evidence from the final files.
