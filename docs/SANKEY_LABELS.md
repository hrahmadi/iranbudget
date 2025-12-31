# Persian Labels for Budget Sankey Diagram

## Revenue Categories (منابع)

### Government General Budget (بودجه عمومی دولت)

#### Operational Revenues (منابع عمومی)
- **operational_revenue**: درآمدهای عملیاتی
  - **tax_total**: مالیات‌ها
    - **direct_tax**: مالیات مستقیم
    - **indirect_tax**: مالیات غیرمستقیم
  - **oil_gas_total**: درآمدهای نفت و گاز
    - **oil_revenue**: فروش نفت خام
    - **gas_revenue**: فروش گاز
    - **condensate**: میعانات گازی
  - **other_revenue**: سایر درآمدها

#### Other Government Resources
- **asset_sales**: واگذاری دارایی‌های سرمایه‌ای
- **borrowing**: استقراض (اوراق مالی اسلامی)
- **development_fund**: منابع صندوق توسعه ملی
- **special_accounts**: درآمد اختصاصی دستگاه‌ها

**Total Government Budget**: بودجه عمومی دولت

---

### State Companies & Banks (شرکت‌های دولتی، بانک‌ها و مؤسسات انتفاعی)

#### State Companies Revenues (منابع شرکت‌های دولتی)
- **state_comp_revenues**: درآمدها
- **state_comp_current_credits**: اعتبارات هزینه‌ای
- **state_comp_capital_credits**: اعتبارات تملک دارایی‌های سرمایه‌ای
- **state_comp_domestic_loans**: تسهیلات بانکی و سایر وام‌های داخلی
- **state_comp_foreign_loans**: وام‌های خارجی / واگذاری دارایی‌های خارجی
- **state_comp_current_assets**: دارایی‌های جاری
- **state_comp_other_receipts**: سایر دریافت‌ها
- **state_comp_financial_assets**: افزایش دارایی‌های مالی

**Total State Companies Revenue**: جمع کل منابع شرکت‌های دولتی

---

## Expenditure Categories (مصارف)

### Government General Budget (بودجه عمومی دولت)

#### Operating Expenditures
- **current_exp**: هزینه‌های جاری
  - Personnel costs: هزینه‌های پرسنلی
  - Goods & services: خرید کالا و خدمات
  - Subsidies: یارانه‌ها
  
- **capital_exp**: هزینه‌های سرمایه‌ای / تملک دارایی‌های سرمایه‌ای
  - Infrastructure: زیرساخت
  - Construction: ساخت و ساز
  - Equipment: تجهیزات

- **subsidy_spending**: یارانه‌ها
  - Energy subsidies: یارانه انرژی
  - Food subsidies: یارانه مواد غذایی
  - Cash transfers: یارانه نقدی

**Total Government Expenditure**: جمع مصارف بودجه عمومی دولت

---

### State Companies Expenditures (مصارف شرکت‌های دولتی)

- **state_comp_current_exp**: هزینه‌ها (جاری)
- **state_comp_taxes**: مالیات
- **state_comp_special_dividend**: سود ویژه (۵٪)
- **state_comp_dividends**: سود سهام
- **state_comp_other_profit**: سایر حساب‌های تخصیص سود
- **state_comp_domestic_repay**: بازپرداخت تسهیلات بانکی و سایر وام‌های داخلی
- **state_comp_foreign_repay**: بازپرداخت وام‌های خارجی
- **state_comp_managed_funds**: وجوه اداره‌شده
- **state_comp_debt_repay**: بازپرداخت ودیعه، بدهی‌ها و سایر پرداخت‌ها
- **state_comp_capital_exp**: هزینه‌های سرمایه‌ای
- **state_comp_current_assets_increase**: افزایش دارایی‌های جاری (1404 only)

#### Adjustments
- **state_comp_double_counted**: کسر می‌شود: مبالغ دو بار منظور شده (1403)
- **state_comp_depreciation**: کسر می‌شود: ذخیره استهلاک منظور در هزینه جاری (1404)

**Total State Companies Expenditure**: جمع کل مصارف شرکت‌های دولتی

---

## Summary Totals (جمع کل)

### Revenue Side
- **Government General Budget**: بودجه عمومی دولت
  - **منابع عمومی**: Operational revenues
  - **درآمد اختصاصی**: Special accounts
  
- **State Companies**: شرکت‌های دولتی و بانک‌ها

- **Total National Budget**: بودجه کل کشور

### Expenditure Side
- **Government General Budget**: بودجه عمومی دولت
  - **هزینه‌های جاری**: Current expenditures
  - **هزینه‌های سرمایه‌ای**: Capital expenditures
  
- **State Companies**: شرکت‌های دولتی و بانک‌ها

- **Total National Budget**: بودجه کل کشور

---

## Node Labels for Sankey (Suggested Hierarchy)

```
REVENUES (منابع)
├── Government Budget (بودجه دولت)
│   ├── Taxes (مالیات‌ها)
│   │   ├── Direct Tax (مالیات مستقیم)
│   │   └── Indirect Tax (مالیات غیرمستقیم)
│   ├── Oil & Gas (نفت و گاز)
│   ├── Other Revenue (سایر درآمدها)
│   ├── Asset Sales (واگذاری دارایی)
│   ├── Borrowing (استقراض)
│   └── Special Accounts (درآمد اختصاصی)
│
└── State Companies (شرکت‌های دولتی)
    ├── Revenues (درآمدها)
    ├── Credits (اعتبارات)
    ├── Loans (تسهیلات و وام)
    └── Other Receipts (سایر دریافت‌ها)

EXPENDITURES (مصارف)
├── Government Budget (بودجه دولت)
│   ├── Current Exp (هزینه‌های جاری)
│   ├── Capital Exp (هزینه‌های سرمایه‌ای)
│   └── Subsidies (یارانه‌ها)
│
└── State Companies (شرکت‌های دولتی)
    ├── Current Exp (هزینه‌های جاری)
    ├── Capital Exp (هزینه‌های سرمایه‌ای)
    ├── Debt Repayment (بازپرداخت بدهی)
    └── Taxes & Dividends (مالیات و سود سهام)
```

---

## Color Scheme Suggestions

### Revenue Colors (Green tones)
- **Taxes**: #2E7D32 (Dark Green)
- **Oil & Gas**: #FFB300 (Amber)
- **Asset Sales**: #0277BD (Blue)
- **Borrowing**: #D32F2F (Red - debt)
- **State Companies Revenue**: #558B2F (Light Green)

### Expenditure Colors (Blue/Purple tones)
- **Current Expenditure**: #1565C0 (Blue)
- **Capital Expenditure**: #5E35B1 (Purple)
- **Subsidies**: #F57C00 (Orange)
- **State Companies Exp**: #0277BD (Dark Blue)

---

## Tooltip Text Templates

### Revenue Tooltip
```
{category_persian}
مبلغ: {amount:,} میلیارد ریال
سهم از کل: {percentage}%
```

### Expenditure Tooltip
```
{category_persian}
مبلغ: {amount:,} میلیارد ریال
سهم از کل: {percentage}%
```

---

## Year Labels
- 1395: سال ۱۳۹۵ (2016-2017)
- 1396: سال ۱۳۹۶ (2017-2018)
- 1397: سال ۱۳۹۷ (2018-2019)
- 1398: سال ۱۳۹۸ (2019-2020)
- 1399: سال ۱۳۹۹ (2020-2021)
- 1400: سال ۱۴۰۰ (2021-2022)
- 1401: سال ۱۴۰۱ (2022-2023)
- 1402: سال ۱۴۰۲ (2023-2024)
- 1403: سال ۱۴۰۳ (2024-2025)
- 1404: سال ۱۴۰۴ (2025-2026)
