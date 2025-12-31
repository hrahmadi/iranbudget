# Iran Budget Analysis Project - Status Report
**Date:** 2025-12-29  
**Budget Year:** 1399 (2020-2021)

---

## ✅ COMPLETED

### 1. **Environment Setup**
- ✅ Created Python virtual environment
- ✅ Installed required packages: `pdfplumber`, `pandas`, `openpyxl`
- ✅ Created extraction scripts

### 2. **Data Extracted from 1399 Budget Text**

| Metric | Value (Rials) | Description |
|--------|---------------|-------------|
| **Total Budget** | 20,266,534,371,000,000 | بودجه کل کشور |
| **Government Budget** | 6,498,093,921,000,000 | بودجه عمومی دولت |
| - General Resources | 5,710,136,460,000,000 | منابع عمومی |
| - Special Revenue | 787,957,461,000,000 | درآمد اختصاصی |
| **State Companies** | 14,363,264,575,000,000 | شرکت‌های دولتی و بانک‌ها |
| **Oil Revenue (Ceiling)** | 454,986,000,000,000 | سقف درآمد نفت و گاز |

### 3. **Oil Revenue Distribution**
- National Development Fund: 20%
- NIOC Share: 14.5%
- Gas Company Share: 14.5%

---

## ❌ NOT YET EXTRACTED

The following metrics are referenced in the document but not yet extracted:

1. **Tax Revenue (Total & Breakdown)**
   - Corporate Tax
   - Individual Tax  
   - Payroll Tax
   - Social Security (تامین اجتماعی)

2. **Expenditures**
   - Current Expenditure (هزینه جاری)
   - Capital Expenditure (هزینه عمرانی)

3. **Budget Balance**
   - Deficit/Surplus (کسری/مازاد)

**Why not extracted:**  
These details are in **جدول شماره (5)** (Table 5) - the main revenue/expenditure table. The PDF has tables as images or non-extractable format.

---

## 🚧 CHALLENGES ENCOUNTERED

1. **RTF Format Issues:**
   - Text file has all content on ONE single line
   - Tables lost their structure during RTF conversion
   - Makes parsing very difficult

2. **PDF Table Extraction Failed:**
   - `pdfplumber` only detected 1 small table (not the main budget table)
   - Budget tables likely embedded as images or non-standard format
   - Common issue with Persian government PDFs

3. **Persian Text Encoding:**
   - RTF uses hex encoding for Persian characters
   - Required special decoding logic

---

## 🎯 RECOMMENDED NEXT STEPS

### **Option A: Web Search for Structured Data** ⭐ RECOMMENDED
Search online for Excel or CSV versions of Iranian budget data:
- Ministry of Economic Affairs and Finance website
- Statistical Center of Iran
- Parliament (Majlis) budget documents
- Economic research institutes

### **Option B: Manual Data Entry**
Since you read Persian, you could:
1. Look at the PDF tables directly
2. Extract key numbers manually
3. Enter them into the JSON structure we created
4. We'll then process all 7 years

### **Option C: OCR + Advanced PDF Processing**
- Use OCR tools (Tesseract with Persian)
- Try `tabula-py` or `camelot` for table extraction
- More time-intensive, uncertain results

### **Option D: Use the Text You Have**
- If you have the budget text in a better format (Word, structured text)
- We can parse it more effectively
- Need tables to be preserved

---

## 📁 FILES CREATED

```
IranBudget/
├── requirements.txt                 # Python dependencies
├── explore_budget.py               # RTF decoder script
├── extract_budget_data.py          # Metric extraction script
├── extract_pdf_tables.py           # PDF table extraction
├── find_tables.py                  # Table finder
├── budget_1399_extracted.json      # Partial data (CURRENT STATUS)
├── 1399_budget_decoded.txt         # Decoded RTF text
├── tables_extracted.json           # PDF tables (minimal)
├── venv/                          # Python virtual environment
└── PROJECT_STATUS.md              # This file
```

---

## 💡 IMMEDIATE ACTION NEEDED

**Please choose one of the options above:**

1. **Can you search online for Excel/CSV versions** of the budget?  
   Example search: "بودجه ۱۳۹۹ اکسل" or "Iran budget 1399 excel"

2. **Can you provide the specific budget numbers** from your PDF by looking at the tables?  
   We need: Total Revenue, Tax Revenue, Oil Revenue, Current Exp, Capital Exp

3. **Do you have access to better formatted text files** (Word documents, structured PDFs)?

4. **Should we try more advanced OCR/table extraction** methods?

---

## 🗄️ DATABASE STRUCTURE (PLANNED)

Once we have complete data for all 7 years, we'll create:

```sql
CREATE TABLE budget_summary (
    year INTEGER PRIMARY KEY,
    total_budget BIGINT,
    oil_revenue BIGINT,
    tax_revenue BIGINT,
    other_revenue BIGINT,
    current_expenditure BIGINT,
    capital_expenditure BIGINT,
    deficit_surplus BIGINT
);

CREATE TABLE tax_breakdown (
    year INTEGER,
    corporate_tax BIGINT,
    individual_tax BIGINT,
    payroll_tax BIGINT,
    social_security BIGINT,
    vat BIGINT,
    other_tax BIGINT
);
```

Then build dashboards showing:
- Year-over-year trends
- Revenue composition
- Expenditure patterns
- Budget balance
- Oil dependency ratio
- Tax performance

---

**What would you like to do next?**

