# فرم تأیید استقرار Sepolia و مالکیت Safe

این فرم آخرین دروازه پیش از تراکنش استقرار است. هیچ secret در این فایل ثبت نمی‌شود.

## داده‌های عمومی لازم

| مورد | مقدار |
|---|---|
| آدرس deployer در Sepolia | `PENDING` |
| آدرس Safe در Sepolia | `PENDING` |
| تراکنش ایجاد Safe | `PENDING` |
| نسخه Safe و singleton | `1.5.0 / PENDING` |
| تعداد مالکان Safe | ۵ |
| threshold | ۳ |
| پنج آدرس عمومی مالکان | `PENDING` |
| commit SHA مورد استقرار | `PENDING` |
| SHA-256 قرارداد | `cd383585bce3319fbf9f66b34e16cf1b4f324d0bd6cca18ad3575295bb141b0e` |

## کنترل پیش از امضا

- [ ] هر پنج مالک Safe آدرس را روی دستگاه خود کنترل کرده‌اند؛
- [ ] هیچ دو مالک از یک seed phrase استفاده نمی‌کنند؛
- [ ] شبکه Safe و deployer هر دو Sepolia با chain ID 11155111 هستند؛
- [ ] Safe رسمی نسخه 1.5.0 با threshold سه از پنج روی explorer مشاهده می‌شود؛
- [ ] تراکنش ایجاد Safe از factory رسمی و singleton/code hash رجیستری قفل‌شده تأیید شده است؛
- [ ] deployer فقط Sepolia ETH لازم برای gas دارد؛
- [ ] `initialOwner` دقیقاً آدرس checksum شده Safe است؛
- [ ] `npm ci`, build, typecheck، 19 آزمون قرارداد/preflight و `npm run test:deployment` روی commit نهایی موفق‌اند؛
- [ ] `npm run preflight:sepolia` هویت رسمی Safe، سابقه factory، پنج مالک متمایز و threshold سه را تأیید کرده است؛
- [ ] `npm run coverage` و `npm run audit:ci` روی commit نهایی موفق‌اند؛
- [ ] خروجی compile و bytecode با artifact مورد انتظار مطابقت دارد؛
- [ ] هیچ private key، seed phrase یا API key در مخزن/چت وجود ندارد.

## پارامتر مالک اولیه

یک کپی محلی از فایل نمونه بسازید و آدرس عمومی Safe و تراکنش ایجاد آن را جایگزین کنید:

```json
{
  "BHBEngineeringTokenModule": {
    "initialOwner": "0xCHECKSUMMED_SAFE_ADDRESS",
    "safeCreationTransactionHash": "0xSAFE_CREATION_TRANSACTION_HASH"
  }
}
```

پارامتر واقعی به‌طور اجباری با گزینه `--parameters` به Ignition داده می‌شود. ماژول اصلی در نبود این پارامتر fail-closed است و deployer را به‌عنوان مالک جایگزین نمی‌کند.

## فرمان‌های استقرار

رمزهای زیر فقط در Hardhat keystore روی دستگاه امضاکننده ذخیره می‌شوند:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
```

سپس `npm run deploy:sepolia` و `npm run verify:sepolia` اجرا می‌شوند. هر دو فرمان preflight زنجیره و Safe را اجرا و فایل پارامتر نهایی را به‌صورت اجباری به Ignition می‌دهند؛ در پایان آدرس با `npm run sync:sepolia` در داشبورد همگام می‌شود.

## کنترل پس از استقرار

- [ ] source code در Sepolia Etherscan verified است؛
- [ ] `name`, `symbol`, `decimals`, `cap` و `totalSupply` کنترل شده‌اند؛
- [ ] `owner()` برابر Safe است؛
- [ ] موجودی Safe برابر 100,000,000 BHB است؛
- [ ] `remainingMintAllowance()` برابر 20,000,000 BHB است؛
- [ ] تراکنش سه‌امضایی pause و unpause آزمایش شده است؛
- [ ] یک انتقال آزمایشی کم‌مقدار انجام شده است؛
- [ ] `dashboard/deployment.json` حاوی آدرس و explorer رسمی است؛
- [ ] tx hash، آدرس قرارداد، آدرس Safe و commit SHA در GitHub ثبت شده‌اند.

## توقف اجباری

اگر Safe اشتباه، threshold اشتباه، source verification ناموفق، bytecode متفاوت یا یافته امنیتی حل‌نشده وجود دارد، توزیع توکن متوقف می‌شود. قرارداد اشتباه «اصلاح» نمی‌شود؛ نسخه جدید باید پس از تحلیل و ثبت عمومی منتشر شود.
