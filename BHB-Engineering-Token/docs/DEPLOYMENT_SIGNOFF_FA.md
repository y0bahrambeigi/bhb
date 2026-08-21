# فرم تأیید استقرار Sepolia و مالکیت Safe

این فرم آخرین دروازه پیش از تراکنش استقرار است. هیچ secret در این فایل ثبت نمی‌شود.

## داده‌های عمومی لازم

| مورد | مقدار |
|---|---|
| آدرس deployer در Sepolia | `PENDING` |
| آدرس Safe در Sepolia | `PENDING` |
| تعداد مالکان Safe | ۵ |
| threshold | ۳ |
| پنج آدرس عمومی مالکان | `PENDING` |
| commit SHA مورد استقرار | `PENDING` |
| SHA-256 قرارداد | `cd383585bce3319fbf9f66b34e16cf1b4f324d0bd6cca18ad3575295bb141b0e` |

## کنترل پیش از امضا

- [ ] هر پنج مالک Safe آدرس را روی دستگاه خود کنترل کرده‌اند؛
- [ ] هیچ دو مالک از یک seed phrase استفاده نمی‌کنند؛
- [ ] شبکه Safe و deployer هر دو Sepolia با chain ID 11155111 هستند؛
- [ ] Safe با threshold سه از پنج روی explorer مشاهده می‌شود؛
- [ ] deployer فقط Sepolia ETH لازم برای gas دارد؛
- [ ] `initialOwner` دقیقاً آدرس checksum شده Safe است؛
- [ ] `npm ci`, build, typecheck و 13 آزمون روی commit نهایی موفق‌اند؛
- [ ] `npm audit` دوباره اجرا و نتیجه ثبت شده است؛
- [ ] خروجی compile و bytecode با artifact مورد انتظار مطابقت دارد؛
- [ ] هیچ private key، seed phrase یا API key در مخزن/چت وجود ندارد.

## پارامتر مالک اولیه

یک کپی محلی از فایل نمونه بسازید و فقط آدرس عمومی Safe را جایگزین کنید:

```json
{
  "BHBEngineeringTokenModule": {
    "initialOwner": "0xCHECKSUMMED_SAFE_ADDRESS"
  }
}
```

پارامتر واقعی باید با گزینه `--parameters` به Ignition داده شود. پیش از اجرا، راهنمای همان نسخه Hardhat کنترل شود.

## فرمان‌های استقرار

رمزهای زیر فقط در Hardhat keystore روی دستگاه امضاکننده ذخیره می‌شوند:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
```

سپس استقرار و verify با پارامتر Safe انجام می‌شود و آدرس در داشبورد همگام می‌گردد. فرمان دقیق باید نام فایل پارامتر نهایی را داشته باشد.

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
