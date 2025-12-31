# Project Progress - Iran Budget Visualization

**Last Updated:** 2025-12-30

## Current Status: ✅ Phase 1 Complete - Ready for Phase 2

---

## Phase 1: Setup & Foundation ✅ COMPLETE

### 1. Git Setup ✅
- [x] Git repository initialized
- [x] `.gitignore` created
- [x] Project structure organized
- [x] README.md exists

### 2. React/Next.js App Setup ✅
- [x] Next.js 16 app created in `frontend/` directory
- [x] TypeScript configured
- [x] Tailwind CSS installed
- [x] Plotly.js for Sankey diagrams installed
- [x] Dependencies: `react-plotly.js`, `plotly.js-dist-min`

### 3. Core Features Implemented ✅
- [x] **Sankey diagram rendering** - Interactive flow visualization
- [x] **Year selector** - Switch between 1395-1404
- [x] **Language toggle** - English/Persian (en/fa)
- [x] **Currency conversion** - Billion Rials / Million USD
- [x] **Summary stats** - Revenue, Expenditure, Balance cards
- [x] **RTL support** - Proper Persian text direction

### 4. Data Integration ✅
- [x] Budget data JSON created at `frontend/data/budget.json`
- [x] All 10 years (1395-1404) included
- [x] Revenue breakdown (tax, oil/gas, other)
- [x] Expenditure breakdown (current, capital, financial, subsidies)
- [x] Balance (surplus/deficit) calculation

---

## Phase 2: Enhancements & Refinements 🚧 IN PROGRESS

### Priority Tasks

#### A. Persian Font Support 🔴 HIGH PRIORITY
- [ ] Add Vazir font or similar Persian font
- [ ] Update global CSS with proper font loading
- [ ] Test Persian text rendering quality
- [ ] Fix any RTL layout issues

#### B. Better Translations 🟡 MEDIUM PRIORITY
- [ ] Review Persian translations for accuracy
- [ ] Add more UI labels (buttons, tooltips)
- [ ] Localize number formatting
- [ ] Add Gregorian year display alongside Persian

#### C. Exchange Rate Improvements 🟡 MEDIUM PRIORITY
- [ ] Research historical USD/IRR rates for each year
- [ ] Implement year-specific exchange rates
- [ ] Add exchange rate source/note in UI
- [ ] Consider EUR as third currency option

#### D. Data Validation 🟡 MEDIUM PRIORITY
- [ ] Verify all 10 years have complete data
- [ ] Check calculations (totals match breakdowns)
- [ ] Add data source attribution
- [ ] Document any data quality issues

#### E. UX Enhancements 🟢 LOW PRIORITY
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Improve mobile responsiveness
- [ ] Add export to PNG/PDF feature
- [ ] Add share button
- [ ] Add year-over-year comparison mode

---

## Technical Stack

```
Frontend: Next.js 16 + React 19 + TypeScript
Styling: Tailwind CSS 4
Charts: Plotly.js + react-plotly.js
Data: Static JSON (10 years pre-loaded)
Deployment: Ready for Vercel/Netlify
```

---

## File Structure

```
IranBudget/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Main Sankey component ✅
│   │   ├── layout.tsx          # App layout
│   │   └── globals.css         # Global styles
│   ├── data/
│   │   └── budget.json         # All 10 years data ✅
│   ├── package.json            # Dependencies
│   └── tsconfig.json           # TypeScript config
├── scripts/                     # Python data processing
├── docs/                        # Documentation
├── output/                      # Generated diagrams
├── data/                        # Source data files
└── PROGRESS.md                 # This file
```

---

## Known Issues

1. **Font rendering**: Persian text uses system font, needs proper web font
2. **Exchange rate**: Currently using fixed 42,000 IRR/USD - should be year-specific
3. **Mobile**: Layout needs testing on smaller screens
4. **Performance**: Large Plotly bundle size (could optimize)

---

## Next Session Goals

1. Add Persian font (Vazir or IRANSans)
2. Implement historical exchange rates
3. Test on mobile devices
4. Deploy to Vercel for testing

---

## How to Run

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## Deployment Checklist (When Ready)

- [ ] Build passes: `npm run build`
- [ ] No console errors
- [ ] All years tested
- [ ] Both languages tested
- [ ] Both currencies tested
- [ ] Mobile tested
- [ ] Environment variables configured
- [ ] Deploy to Vercel/Netlify
- [ ] Custom domain (optional)

---

**Status:** Foundation complete, ready for enhancements! 🚀
