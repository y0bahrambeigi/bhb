# گزارش نهایی آمادگی انتشار BMPOA-FF-SG-DLS v0.1.0
تاریخ بررسی: ۲۴ اکتبر ۲۰۲۶

> این فایل، گزارش تاریخی پیش از اجرای اعتبارسنجی تکمیلی است. وضعیت جدید و شواهد بستن گیت‌های علمی در [SCIENTIFIC_AUDIT.md](release-validation/SCIENTIFIC_AUDIT.md) ثبت شده‌اند؛ برای وضعیت انتشار، Issue #84 و workflow انتشار ملاک‌اند.

**تصمیم: NO-GO؛ گیت انتشار هنوز بسته است.** تکمیل اجرای کنترل‌شده و ممیزی ساختار داده تأیید شده، اما گیت‌های علمی، merge و آرشیو نهایی بازند.

## منابع و دامنه بررسی
- [Issue #84](https://github.com/y0bahrambeigi/bhb/issues/84)، باز؛ آخرین ویرایش ۲۲ اکتبر، بدون comment.
- [PR #83](https://github.com/y0bahrambeigi/bhb/pull/83)، باز و Draft، merged=false؛ بدون review ثبت‌شده و بدون thread باز.
- [اجرای مرجع 39207965973](https://github.com/y0bahrambeigi/bhb/actions/runs/39207965973)، attempt=1، completed/success؛ preflight، ده shard و aggregation همگی موفق.
- [artifact مرجع](https://github.com/y0bahrambeigi/bhb/actions/runs/39207965973/artifacts/12168833062)، نام sgdls-full-30run-35070-p4، expired=false.
- [مقایسه منبع آزمایش و head فعلی](https://github.com/y0bahrambeigi/bhb/compare/a8d9fc46966842ec56980853a4ee4ab56395a7e0...ecbe2f683ff3f24f7c7138f1c8ac3f14094d3fc2).

در این بررسی وضعیت زنده منابع، jobها، metadata artifact، checkها، reviewها، tag و release تطبیق داده شد. اعداد داده و checksum CSV از ممیزی مستقل ثبت‌شده در Issue در ۲۲ اکتبر نقل شده‌اند؛ این گزارش ادعای دانلود مجدد ZIP، محاسبه مجدد نتایج یا بازتحلیل مستقل سازه ندارد.

## هویت نسخه‌ها
| هویت | مقدار |
|---|---|
| منبع آزمایش مرجع | a8d9fc46966842ec56980853a4ee4ab56395a7e0 |
| head فعلی PR | ecbe2f683ff3f24f7c7138f1c8ac3f14094d3fc2 |
| base فعلی PR | 443340a2cf81ba022c024e4ed31dca9f8c36a38e |
| merge SHA نهایی انتشار | هنوز وجود ندارد؛ فقط پس از merge ثبت شود |
| tag هدف | sgdls-v0.1.0؛ در بررسی حاضر وجود ندارد |

تنها تفاوت منبع آزمایش تا head فعلی: PUBLICATION_PLAN_SGDLS.md، RELEASE_NOTES_SGDLS_V0.1.0_DRAFT.md و trigger/concurrency در workflow. این نتیجه به همین دو SHA محدود است. مقدار merge_commit_sha فعلی PR باز را نباید merge نهایی تلقی کرد.

## گیت‌های تکمیل‌شده
| گیت | شاهد و حدود ادعا |
|---|---|
| انتشار پیاده‌سازی feasibility-first، مشتق‌های تحلیلی و SG-DLS در شاخه PR | Issue و PR؛ انتشار کد برای بررسی است، نه انتشار release یا اثبات دقت مشتق |
| preflight و smoke | job موفق؛ مسیر sensitivity و سازگاری فرکانس بررسی شده، نه اعتبارسنجی مستقل دقت مشتق |
| اجرای کامل دو benchmark و پنج seed | ده shard موفق برای seedهای 2026–2030 |
| طرح کامل 2×3×5 و بودجه | ممیزی Issue: ۳۰ ردیف یکتا، بدون کسری/تکرار، هرکدام دقیقاً 35,070 evaluator call، p=4؛ انطباق aggregate با ده CSV |
| یکپارچگی artifact | digest فعلی ZIP با checksum ممیزی Issue یکسان است؛ checksum CSV نیز در ممیزی Issue تأیید شده |

ZIP SHA-256:
3f2986f47f5d28d859427224c3d5c1387ddc3b31185608e0f844947a2ee05bbd

CSV SHA-256 طبق ممیزی Issue:
2e13eba58e4ccbfb9f3e8b28fd359bba337edd01717d6264ffc49f5b37fc590e

## یافته‌های موجود و حدود نتیجه
تمام ۳۰ خروجی نهایی طبق ممیزی آرشیو feasible هستند: Vp=Vinf=0 و maxG منفی. این یافته، بازتحلیل مستقل سازه نیست. گیت کلی feasibility/weight/first-feasible-FE/runtime در Issue همچنان باز است.

| benchmark | مقایسه SGDLS با core | میانه سربار زمانی جفت‌شده |
|---|---|---|
| 72-bar | ۲ برد، ۲ تساوی، ۱ باخت | 16.46% |
| 120-bar | ۲ برد، ۲ تساوی، ۱ باخت | 3.40% |

تحمل تساوی وزن 1e-8 است. آزمون‌های اکتشافی paired sign-flip در Issue، برتری آماری را تثبیت نمی‌کنند. این درصدهای زمانی به همین اجرا وابسته‌اند و میانه نسبت‌های جفت‌شده‌اند، نه نسبت میانه زمان‌ها. برابری evaluator call به معنی برابری هزینه محاسباتی نیست.

FE=1 در تمام ردیف‌ها با مقداردهی اولیه midpoint قطعی و feasible سازگار است؛ از آن نمی‌توان تعمیر سریع‌تر infeasibility را نتیجه گرفت.

## گیت‌های باز، شواهد لازم و معیار توقف
معیارهای زیر پیشنهاد عملی این گزارش برای بستن گیت‌ها هستند؛ به معنی آزمون اجراشده یا نتیجه تأییدشده نیستند.

| گیت باز | شاهد لازم برای بستن | معیار توقف |
|---|---|---|
| ممیزی نهایی feasibility/weight/FE/runtime | اسکریپت و گزارش قابل‌اجرا با ارجاع به checksum؛ بازتولید آمار وزن و feasibility، شمارنده‌ها، تفسیر FE=1 و سربار جفت‌شده؛ مشخص‌کردن اینکه کدام بررسی فقط روی خروجی آرشیوی است | ناسازگاری جدول/فایل، واحد نامعلوم، اختلاط runهای غیرمرجع یا معرفی ممیزی خروجی به‌عنوان بازتحلیل مستقل |
| ناهنجاری 72-bar/seed 2030 | بازپخش تشخیصی روی منبع مشخص، log حرکت‌های کاتالوگ، مقادیر پیش‌بینی و exact، علت پذیرش/رد و شمارنده بودجه؛ مقایسه با seedهای دیگر | باقی‌ماندن علت نامشخص برای 25/239 پذیرش، شمارش نادرست یا نقض پذیرش exact |
| اعتبارسنجی مستقل مشتق‌ها | مقایسه مشتق تحلیلی با perturbation/تفاضل محدود مستقل در چند گام؛ هر دو جهت افزایش/کاهش کاتالوگ؛ استاتیک و مودال؛ گزارش خطای مطلق/نسبی و tolerance از پیش تعیین‌شده؛ در مودهای تکراری/نزدیک، بررسی زیر‌فضا و مشتق جهتی خوشه | خطای خارج از tolerance، نتیجه وابسته به یک گام، تطبیق نادرست مودها یا فقدان پوشش خوشه‌های اندازه ۲ |
| گیت no unresolved anomaly | جمع‌بندی مکتوب دو تشخیص بالا و نتیجه regressionهای مرتبط، متصل به SHA | هر ابهام علمی یا regression حل‌نشده |
| جداول/شکل‌های رساله | جدول و شکل وزن، feasibility و runtime با اسکریپت و ارجاع به داده؛ تصمیم صریح درباره convergence/anytime | تولید منحنی تاریخی از داده‌ای که history ندارد |
| تکمیل PR و review | به‌روزرسانی وضعیت‌های قدیمی، لینک شواهد، بررسی final head و checks مرتبط، خروج از Draft و review مطابق سیاست مخزن | استفاده از skipped به‌عنوان passed، تغییر head بدون بازبینی یا ادعای MATLAB صرفاً بر پایه اجرای Octave |
| merge و تثبیت SHA | merged=true، merged_at و commit واقعی؛ آزمون و کنترل artifact روی همان merge SHA | استفاده از head یا merge آزمایشی PR به جای commit واقعی انتشار |
| آرشیو بازتولیدپذیری | source/benchmark/catalog/parameterها، CSV/JSON/MAT/provenance، اسکریپت تحلیل، گزارش تشخیص و مشتق، log، محیط و checksum دارایی‌ها؛ آزمون بازیابی بسته | فایل مفقود، checksum ناهماهنگ، محیط نامشخص یا وابستگی تنها به artifact موقت |
| tag و release | tag دقیقاً روی merge SHA؛ release با دارایی‌ها و SHA256SUMS قابل دریافت و تأیید | tag اشتباه، دارایی غیرقابل دریافت یا گیت علمی باز |

وضعیت checks روی head فعلی: pilot-smoke و octave-regression موفق؛ publication-package و dissertation-pilot skipped. وضعیت clean/mergeable=true فقط قابلیت ادغام فنی را نشان می‌دهد، نه آمادگی علمی.

پذیرش غیرعادی seed 2030 برابر 10.46% است، در برابر حدود 95–100% در چهار seed دیگر. نسبت‌های تجمیعی 110/326 برای 72-bar و 69/73 برای 120-bar به‌تنهایی علت این تفاوت را توضیح نمی‌دهند.

runner، convergence و evaluationHistory را کنار می‌گذارد و MAT موجود جدول نتایج را نگه می‌دارد. برای منحنی‌های anytime/convergence باید اجرای جداگانه با ثبت history و هویت مستقل انجام شود؛ داده آن نباید بی‌صدا جایگزین یا وارد مجموعه مرجع شود. اگر این منحنی‌ها از دامنه v0.1.0 خارج می‌شوند، تصمیم باید صریحاً در Issue و برنامه انتشار ثبت شود.

## ترتیب دقیق اقدامات تا v0.1.0
1. همین حالا نسخه‌ای پایدار از artifact و provenance مرجع حفظ شود؛ این حفظ اولیه، گیت آرشیو نهایی را نمی‌بندد. انقضای ثبت‌شده artifact: 2027-01-17T06:05:58Z.
2. شناسه run، منبع آزمایش، head و checksumها در فهرست شواهد ثبت و اجراهای تکراری مستثنا شوند.
3. ممیزی توصیفی نهایی وزن/feasibility/FE/runtime بازتولید و گزارش شود.
4. ناهنجاری seed 2030 و اعتبارسنجی مستقل مشتق‌های استاتیکی/مودال تکمیل شوند.
5. اگر باگ مؤثر بر نتایج پیدا شد، اصلاح و regression انجام شود؛ اجرای کنترل‌شده جدید با هویت مستقل و دامنه بازاجرای مستند، جایگاه مرجع جدید را مشخص کند. نتایج قدیم و جدید مخلوط نشوند.
6. گیت no unresolved anomaly فقط با شواهد مراحل ۳ تا ۵ بسته شود؛ جداول و شکل‌ها ساخته و تکلیف history تعیین شود.
7. متن PR، PUBLICATION_PLAN و RELEASE_NOTES از وضعیت‌های قدیمی پاک‌سازی شوند. شماره‌گذاری فعلی plan که freeze merge SHA را پیش از merge آورده، اصلاح شود: پارامترها/دارایی‌ها پیش از merge تثبیت و merge SHA فقط پس از merge ثبت شود.
8. روی final head، regression و smoke مرتبط بررسی/اجرا و موارد skipped توجیه شوند؛ PR آماده review شود، review تکمیل و سپس merge طبق سیاست مخزن انجام شود.
9. merge SHA واقعی ثبت شود؛ اختلاف آن با منبع آزمایش بررسی و checks لازم روی نسخه ادغام‌شده تکمیل شود. هر تغییر علمی مؤثر، گیت‌های مربوط را دوباره باز می‌کند.
10. بسته نهایی بازتولیدپذیری و SHA256SUMS ساخته، در محل پایدار حفظ و بازیابی/صحت آن بررسی شود. محیط GNU Octave 8.4.0 شناخته‌شده است، ولی manifest کامل اجرای تاریخی موجود نیست؛ اطلاعات قابل بازیابی و موارد نامعلوم جدا ثبت شوند.
11. tag sgdls-v0.1.0 دقیقاً روی merge SHA ساخته شود؛ دارایی‌ها به release پیش‌نویس متصل و تطبیق نهایی انجام شود.
12. تنها پس از بسته‌شدن گیت‌ها release عمومی منتشر شود؛ دریافت دارایی‌ها و checksum دوباره کنترل، سپس Issue با پیوند شواهد بسته شود. DOI گیت ثبت‌شده الزامی این نسخه نیست و مرحله بعدی است.

## متن کوتاه آماده درج در Issue
Rechecked on 2026-10-24: authoritative run 39207965973 completed successfully, including preflight, all ten shards and aggregation. Issue #84 records a byte-audited complete 2×3×5 dataset: 30 unique rows, each with exactly 35,070 evaluator calls (p=4). The current artifact ZIP digest matches the recorded audit.

Release remains NO-GO. PR #83 is still draft/unmerged; no sgdls tag or release exists. Close the final output/runtime audit, explain 72-bar seed 2030 acceptance (25/239), independently validate static/modal derivatives in both catalog directions near repeated modes, and resolve the missing-history deliverable. Then update the stale publication documents, complete final-head review/checks, merge, freeze the actual merge SHA, archive and verify reproducibility assets, and create sgdls-v0.1.0 on that SHA.

Preserve experiment source a8d9fc46966842ec56980853a4ee4ab56395a7e0 separately from the release merge SHA. The five-seed results do not establish SG-DLS statistical superiority. Equal evaluator-call budgets do not imply equal computational cost; FE=1 is consistent with feasible midpoint initialization.

## Release notes پیشنهادی — پیش‌نویس، تا بسته‌شدن گیت‌ها منتشر نشود
# BMPOA-FF-SG-DLS v0.1.0 — controlled research release

Adds feasibility-first ranking, analytical static/modal sensitivity with modal-cluster handling, and sensitivity-guided one-step discrete local search with exact structural re-evaluation before acceptance.

The archived reference study compares core, RandomDiscreteLS and SGDLS on 72-bar and 120-bar benchmarks using paired seeds 2026–2030: 30 runs, each with exactly 35,070 evaluator calls. The archived-output audit reports all 30 final designs as feasible; this is not an independent structural re-evaluation.

These five-seed results do not establish statistical superiority of SG-DLS. Median paired runtime overhead versus core was 16.46% for 72-bar and 3.40% for 120-bar in this execution. Equal evaluator-call budgets do not imply equal computational cost. First-feasible FE=1 is consistent with deterministic feasible midpoint initialization and does not demonstrate faster infeasibility repair.

QIO and restart are excluded from the reference ablation. Its artifacts do not retain convergence/evaluation histories.

Reference run: 39207965973.
Experiment source: a8d9fc46966842ec56980853a4ee4ab56395a7e0.
Release merge SHA: [fill only after merge].
Independent derivative-validation and seed-2030 diagnostic reports: [attach verified evidence].
Reproducibility archive and SHA256SUMS: [attach and verify before publication].

Publication status: DRAFT / BLOCKED until all release gates in Issue #84 are closed.

