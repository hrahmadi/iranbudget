# Control Panel Enhancement Tasklist

## Task 1: Language Toggle Switch ✓
**Goal:** Replace dropdown with switch, prevent control bar shift on language change

**Steps:**
1. Replace language dropdown with toggle switch component
2. Keep control bar layout fixed (prevent RTL/LTR shift)
3. Update translations for switch labels
4. Test switching between languages

**Files to modify:**
- `/frontend/app/page.tsx` - Replace dropdown with switch
- Verify no layout shift when language changes

---

## Task 2: Display Mode Toggle (Percentage vs Absolute) ✓
**Goal:** Add control to show values as percentages or absolute numbers

**Steps:**
1. Add new state: `displayMode` ('absolute' | 'percentage')
2. Add toggle switch to control panel
3. Update `transformToHierarchicalSankey` to accept displayMode parameter
4. Modify value calculations and labels based on mode
5. Update hover templates to show correct format

**Files to modify:**
- `/frontend/app/page.tsx` - Add displayMode state and control
- `/frontend/lib/budget-transform.ts` - Add percentage calculation logic
- `/frontend/components/HierarchicalSankey.tsx` - Update hover templates

---

## Task 3: Unit Conversion (Trillion Rials / Hemmat / Dollars) ⚠️
**Goal:** Add unit selector with accurate conversions

**CRITICAL:** This is delicate - math errors likely!

**Steps:**
1. Create exchange rate data structure (year → USD rate)
2. Add unit state: `unit` ('trillion_rial' | 'hemmat' | 'usd')
3. Add unit selector to control panel
4. Create conversion utilities with careful rounding
5. Update all labels and tooltips with correct unit symbols
6. Add unit conversion tests to verify accuracy

**Conversion formulas:**
- Hemmat = Trillion Rials (same value, different name)
  - 1 همت = 1000 میلیارد تومان = 10000 میلیارد ریال = 10 Trillion Rials
- USD = Trillion Rials ÷ Exchange Rate ÷ 10

**Exchange rates needed from user**

**Files to modify:**
- `/frontend/lib/conversions.ts` - NEW FILE for conversion logic
- `/frontend/app/page.tsx` - Add unit state and control
- `/frontend/lib/budget-transform.ts` - Apply conversions
- `/frontend/components/HierarchicalSankey.tsx` - Update labels

**Testing checklist:**
- [ ] Verify Hemmat conversion (should be Trillion Rials / 10)
- [ ] Verify USD conversion with known rates
- [ ] Check rounding doesn't accumulate errors
- [ ] Ensure revenue = expenditure after conversion

---

## Implementation Order

1. **First:** Language switch (simple, sets foundation)
2. **Second:** Percentage mode (medium complexity)
3. **Third:** Unit conversion (complex, needs exchange rates from user)

---

## Notes

- **Commit after each task**
- **Test thoroughly before moving to next task**
- **Get exchange rates from user before starting Task 3**
