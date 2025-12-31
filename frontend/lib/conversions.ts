/**
 * Unit Conversion Utilities for Iran Budget
 * 
 * CRITICAL: All conversions must be mathematically precise to avoid accumulation errors
 */

// Exchange rates: USD price on Dey 15th of the PREVIOUS year
// (when budget was being finalized in Majlis)
export const USD_EXCHANGE_RATES: Record<string, number> = {
  '1395': 37020,  // Dey 15, 1394
  '1396': 39200,  // Dey 15, 1395
  '1397': 47900,  // Dey 15, 1396
  '1398': 106000, // Dey 15, 1397
  '1399': 137300, // Dey 15, 1398
  '1400': 247200, // Dey 15, 1399
  '1401': 269800, // Dey 15, 1400
  '1402': 306930, // Dey 15, 1401
  '1403': 509740, // Dey 15, 1402
  '1404': 795450, // Dey 15, 1403
};

export type Unit = 'trillion_rial' | 'hemmat' | 'usd';

export interface UnitInfo {
  symbol: string;
  symbolFa: string;
  name: string;
  nameFa: string;
}

export const UNIT_INFO: Record<Unit, UnitInfo> = {
  trillion_rial: {
    symbol: 'T Rials',
    symbolFa: 'هزار میلیارد ریال',
    name: 'Trillion Rials',
    nameFa: 'هزار میلیارد ریال',
  },
  hemmat: {
    symbol: 'Hemmat',
    symbolFa: 'همت',
    name: 'Hemmat',
    nameFa: 'همت',
  },
  usd: {
    symbol: 'B USD',
    symbolFa: 'میلیارد دلار',
    name: 'Billion USD',
    nameFa: 'میلیارد دلار',
  },
};

/**
 * Convert from Trillion Rials to specified unit
 * 
 * CONVERSIONS:
 * - Trillion Rials: Base unit (no conversion)
 * - Hemmat: 1 همت = 1000 میلیارد تومان = 10,000 میلیارد ریال = 10 Trillion Rials
 * - USD: Trillion Rials ÷ Exchange Rate ÷ 1000 (to get billions)
 * 
 * @param valueInTrillionRials - Value in trillion rials (base unit from database)
 * @param targetUnit - Target unit to convert to
 * @param year - Budget year (for USD conversion rate)
 * @returns Converted value
 */
export function convertFromTrillionRials(
  valueInTrillionRials: number,
  targetUnit: Unit,
  year: string
): number {
  switch (targetUnit) {
    case 'trillion_rial':
      return valueInTrillionRials;
    
    case 'hemmat':
      // 1 Hemmat = 10 Trillion Rials
      return valueInTrillionRials / 10;
    
    case 'usd':
      const exchangeRate = USD_EXCHANGE_RATES[year];
      if (!exchangeRate) {
        throw new Error(`No exchange rate found for year ${year}`);
      }
      // Convert: Trillion Rials → Rials → USD → Billion USD
      // 1 Trillion Rials = 1,000,000,000,000 Rials
      // Rials ÷ Exchange Rate = USD
      // USD ÷ 1,000,000,000 = Billion USD
      return (valueInTrillionRials * 1000000000000) / exchangeRate / 1000000000;
    
    default:
      throw new Error(`Unknown unit: ${targetUnit}`);
  }
}

/**
 * Format a value with appropriate precision for the unit
 */
export function formatValue(
  value: number,
  unit: Unit,
  language: 'en' | 'fa' = 'en'
): string {
  const info = UNIT_INFO[unit];
  const symbol = language === 'fa' ? info.symbolFa : info.symbol;
  
  let precision: number;
  switch (unit) {
    case 'trillion_rial':
      precision = 1; // e.g., "112.8 T Rials"
      break;
    case 'hemmat':
      precision = 2; // e.g., "11.28 Hemmat"
      break;
    case 'usd':
      precision = 2; // e.g., "141.78 B USD"
      break;
  }
  
  return `${value.toFixed(precision)} ${symbol}`;
}

/**
 * Get unit name for display
 */
export function getUnitName(unit: Unit, language: 'en' | 'fa' = 'en'): string {
  const info = UNIT_INFO[unit];
  return language === 'fa' ? info.nameFa : info.name;
}

/**
 * Verify conversion accuracy by checking if totals match after conversion
 * This is for testing/debugging only
 */
export function verifyConversionAccuracy(
  revenueInTrillionRials: number,
  expenditureInTrillionRials: number,
  unit: Unit,
  year: string
): { revenue: number; expenditure: number; difference: number } {
  const convertedRevenue = convertFromTrillionRials(revenueInTrillionRials, unit, year);
  const convertedExpenditure = convertFromTrillionRials(expenditureInTrillionRials, unit, year);
  const difference = Math.abs(convertedRevenue - convertedExpenditure);
  
  return {
    revenue: convertedRevenue,
    expenditure: convertedExpenditure,
    difference,
  };
}
