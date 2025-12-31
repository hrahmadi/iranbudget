# 📋 How to Fill the 1404 Manual Entry Template

## 🎯 Quick Start

1. **Open these files side by side:**
   - `1404gifs/table5.gif` (revenues)
   - `1404gifs/table7-b.gif` (expenditures)  
   - `1404gifs/table14.gif` (subsidies)
   - `1404_MANUAL_ENTRY_TEMPLATE.txt` (this is where you type)

2. **Look for the رديف (row ID) numbers on the RIGHT side of table5.gif**

3. **Copy the numbers from the "جمع" (Total) column**
   - Usually the rightmost numeric column
   - Remove commas (1,234,567 → 1234567)

---

## 📊 TABLE 5 STRUCTURE (What to Look For)

```
Column Layout in table5.gif:
┌─────────────────────────────────┬──────┬─────────┬──────┬───────┐
│         عنوان (Description)      │ ملی  │ استانی  │ جمع  │ رديف  │
│                                 │      │         │      │ (ID)  │
├─────────────────────────────────┼──────┼─────────┼──────┼───────┤
│ درآمد مالیاتی (Tax Revenue)     │  ... │   ...   │ XXXX │110000 │
│   مالیات شرکت‌ها (Corporate)    │  ... │   ...   │ YYYY │110100 │
│   مالیات بر درآمد (Income)       │  ... │   ...   │ ZZZZ │110200 │
└─────────────────────────────────┴──────┴─────────┴──────┴───────┘
```

**Copy the XXXX, YYYY, ZZZZ values** into the template!

---

## 🔍 KEY LINE ITEMS TO FIND

### Priority 1: MUST HAVE (for analysis)

| What to Find | Persian Name | Typical رديف | Where |
|--------------|--------------|--------------|-------|
| **Total Tax Revenue** | درآمد مالیاتی | 110000 | table5.gif |
| **Corporate Tax** | مالیات شرکت‌ها | 110100 | table5.gif |
| **Income Tax** | مالیات بر درآمد | 110200 | table5.gif |
| **Oil & Gas Revenue** | منابع نفت و گاز | 120000~ | table5.gif |
| **Total Revenues** | جمع درآمدها | - | table2.gif or table5.gif |
| **Total Expenditures** | جمع هزینه‌ها | - | table2.gif or table7-b.gif |
| **Current Expenditure** | هزینه‌ای | - | table7-b.gif |
| **Capital Expenditure** | تملک دارایی سرمایه‌ای | - | table7-b.gif |

### Priority 2: NICE TO HAVE (for completeness)

| What to Find | Persian Name | Where |
|--------------|--------------|-------|
| Wealth Tax | مالیات بر ثروت | table5.gif |
| VAT/Sales Tax | مالیات بر کالا و خدمات | table5.gif |
| Import Duties | حقوق گمرکی | table5.gif |
| Subsidy Payments | هدفمندسازی یارانه‌ها | table14.gif |

---

## 💡 TIPS

1. **Start with the BIG numbers** (total revenues, total expenditures)
   - These are usually in table1.gif or table2.gif
   - They're at the TOP or BOTTOM of tables

2. **Don't worry about perfect accuracy on every line**
   - Focus on the KEY metrics (Priority 1 items)
   - We can always refine later

3. **If you can't find a number, put 0**
   - Better to have some data than none
   - Mark it in the NOTES section

4. **Numbers are in BILLION RIALS**
   - If you see: 70,874,020
   - Enter: 70874020
   - (That's ~70.9 trillion rials, or 70,874 billion)

---

## ✅ VALIDATION

After filling in, check these make sense:
- Total Revenues ≈ 50,000,000,000 to 80,000,000,000 (billion rials)
- Total Expenditures similar range
- Tax Revenue should be 30-50% of total revenues
- Oil Revenue should be 10-25% of total revenues

---

## 🚀 WHEN DONE

Save the file and let me know! I'll:
1. Convert it to proper CSV format
2. Run analysis scripts
3. Generate `budget_1404_final.json`
4. Add it to the 6-year comparison

**Estimated time: 30-60 minutes** depending on how detailed you want to be!

