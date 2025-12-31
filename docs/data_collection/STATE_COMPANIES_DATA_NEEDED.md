# State Companies Data Collection Status

## Database Structure (COMPLETED ✅)
Schema updated with detailed columns for state companies revenue and expenditure.

## Data Status by Year

### 1403 - COMPLETED ✅
**Source:** Table 11 (جدول شماره ۱۱) from budget law 1403
**Status:** All detailed data loaded

**Revenue breakdown:**
- درآمدها: 30,178,537.345
- اعتبارات هزینه‌ای: 237,393.820
- اعتبارات تملک دارایی‌های سرمایه‌ای: 906,258.943
- تسهیلات بانکی و وام‌های داخلی: 1,101,969.937
- وام‌های خارجی: 349,059.038
- دارایی‌های جاری: 345,786.412
- سایر دریافت‌ها: 4,206,759.517
- افزایش دارایی‌های مالی: 476,690.755
- **Total: 37,415,723.997**

**Expenditure breakdown:**
- هزینه‌ها: 28,538,551.231
- مالیات: 233,102.640
- سود ویژه 5%: 363,308.739
- سود سهام: 112,555.433
- سایر حساب‌های تخصیص سود: 1,060.071
- بازپرداخت تسهیلات داخلی: 1,092,139.076
- بازپرداخت وام‌های خارجی: 392,432.784
- وجوه اداره شده: 11,033.884
- بازپرداخت دیون و سایر پرداخت‌ها: 775,447.511
- هزینه‌های سرمایه‌ای: 6,926,791.727
- **Gross Total: 38,836,142.934**
- Less double-counted: -1,419,418.937
- **Net Total: 37,416,724.000**

---

### 1404 - PENDING ❌
**Source:** Table 11 from budget law 1404
**Status:** Need to extract from PDF

**Known aggregates:**
- Revenue total: 63,773,759 billion rials
- Expenditure total: 63,773,759 billion rials
- Double-counted: 4,823,000 billion rials
- Net: 58,950,759 billion rials (estimated)

**Action needed:** Extract Table 11 from 1404.pdf

---

### 1402 - PENDING ❌
**Source:** Table 11 from budget law 1402
**Status:** Need PDF and data extraction

---

### 1401 - PENDING ❌
**Source:** Table 11 from budget law 1401
**Status:** Need PDF and data extraction

---

### 1400 - PENDING ❌
**Source:** Table 11 from budget law 1400
**Status:** Need PDF and data extraction

---

### 1399 - PENDING ❌
**Source:** Table 11 from budget law 1399
**Status:** Need PDF and data extraction

---

### 1398 - PENDING ❌
**Source:** Table 11 from budget law 1398
**Status:** Need PDF and data extraction

---

### 1397 - PENDING ❌
**Source:** Table 11 from budget law 1397
**Status:** Need PDF and data extraction

---

### 1396 - PENDING ❌
**Source:** Table 11 from budget law 1396
**Status:** Need PDF and data extraction

---

### 1395 - PENDING ❌
**Source:** Table 11 from budget law 1395
**Status:** Need PDF and data extraction

---

## Search Strategy

For each year, search in the budget law PDF for:
1. **"جدول شماره ۱۱"** or **"جدول ۱۱"**
2. **"بودجه شرکت‌های دولتی"**
3. Look for the same structure as 1403

## Database Columns

### Revenues Table
- `state_comp_revenues` - درآمدها
- `state_comp_current_credits` - اعتبارات هزینه‌ای
- `state_comp_capital_credits` - اعتبارات تملک دارایی‌های سرمایه‌ای
- `state_comp_domestic_loans` - تسهیلات بانکی و وام‌های داخلی
- `state_comp_foreign_loans` - وام‌های خارجی
- `state_comp_current_assets` - دارایی‌های جاری
- `state_comp_other_receipts` - سایر دریافت‌ها
- `state_comp_financial_assets` - افزایش دارایی‌های مالی
- `state_comp_revenue_total` - جمع کل

### Expenditures Table
- `state_comp_current_exp` - هزینه‌ها
- `state_comp_taxes` - مالیات
- `state_comp_special_dividend` - سود ویژه 5%
- `state_comp_dividends` - سود سهام
- `state_comp_other_profit` - سایر حساب‌های تخصیص سود
- `state_comp_domestic_repay` - بازپرداخت تسهیلات داخلی
- `state_comp_foreign_repay` - بازپرداخت وام‌های خارجی
- `state_comp_managed_funds` - وجوه اداره شده
- `state_comp_debt_repay` - بازپرداخت دیون
- `state_comp_capital_exp` - هزینه‌های سرمایه‌ای
- `state_comp_exp_total` - جمع کل
- `state_comp_double_counted` - کسر مبالغ دوبار منظور
- `state_comp_net` - خالص
