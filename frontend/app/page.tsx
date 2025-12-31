'use client';

import { useState, useEffect } from 'react';
import HierarchicalSankey from '@/components/HierarchicalSankey';
import { transformToHierarchicalSankey, BudgetData, SankeyData } from '@/lib/budget-transform';

type Language = 'en' | 'fa';
type Year = '1395' | '1396' | '1397' | '1398' | '1399' | '1400' | '1401' | '1402' | '1403' | '1404';
type DisplayMode = 'absolute' | 'percentage';

const translations = {
  en: {
    title: 'Iran National Budget Flow',
    yearLabel: 'Year:',
    languageLabel: 'Language:',
    displayModeLabel: 'Display Mode:',
    loading: 'Loading...',
    error: 'Error loading data',
  },
  fa: {
    title: 'جریان بودجه ملی ایران',
    yearLabel: 'سال:',
    languageLabel: 'زبان:',
    displayModeLabel: 'نمایش:',
    loading: 'در حال بارگذاری...',
    error: 'خطا در بارگذاری داده‌ها',
  },
};

export default function Home() {
  const [year, setYear] = useState<Year>('1404');
  const [language, setLanguage] = useState<Language>('en');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('absolute');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [sankeyData, setSankeyData] = useState<SankeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/budget?year=${year}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setBudgetData(data);
        const transformed = transformToHierarchicalSankey(data, language);
        setSankeyData(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year, language]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center" dir={language === 'fa' ? 'rtl' : 'ltr'}>{t.title}</h1>
        
        {/* Controls - Fixed LTR layout */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.yearLabel}</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as Year)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['1395', '1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Language Toggle Switch */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.languageLabel}</label>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${language === 'en' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                  English
                </span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    language === 'fa' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={language === 'fa'}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      language === 'fa' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${language === 'fa' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                  فارسی
                </span>
              </div>
            </div>

            {/* Display Mode Toggle Switch */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.displayModeLabel}</label>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${displayMode === 'absolute' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                  {language === 'fa' ? 'مطلق' : 'Absolute'}
                </span>
                <button
                  onClick={() => setDisplayMode(displayMode === 'absolute' ? 'percentage' : 'absolute')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    displayMode === 'percentage' ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={displayMode === 'percentage'}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      displayMode === 'percentage' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${displayMode === 'percentage' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                  {language === 'fa' ? 'درصد' : '%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sankey Diagram - RTL/LTR content wrapper */}
        <div className="bg-gray-800 rounded-lg p-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-xl">{t.loading}</div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-xl text-red-400">{t.error}: {error}</div>
            </div>
          )}
          
          {!loading && !error && sankeyData && budgetData && (
            <HierarchicalSankey
              data={sankeyData}
              year={year}
              language={language}
              displayMode={displayMode}
            />
          )}
        </div>

        {/* Stats Summary */}
        {!loading && !error && budgetData && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                {language === 'fa' ? 'کل درآمد' : 'Total Revenue'}
              </h3>
              <p className="text-3xl font-bold text-green-400">
                {(parseFloat(budgetData.revenue_total) / 1_000_000).toFixed(2)}T
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {language === 'fa' ? 'هزار میلیارد ریال' : 'Trillion Rials'}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                {language === 'fa' ? 'کل هزینه' : 'Total Expenditure'}
              </h3>
              <p className="text-3xl font-bold text-red-400">
                {(parseFloat(budgetData.expenditure_total) / 1_000_000).toFixed(2)}T
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {language === 'fa' ? 'هزار میلیارد ریال' : 'Trillion Rials'}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                {language === 'fa' ? 'تراز بودجه' : 'Balance'}
              </h3>
              <p className={`text-3xl font-bold ${budgetData.status === 'surplus' ? 'text-green-400' : 'text-red-400'}`}>
                {(parseFloat(budgetData.surplus_deficit) / 1_000_000).toFixed(2)}T
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {budgetData.status === 'surplus' 
                  ? (language === 'fa' ? 'مازاد' : 'Surplus')
                  : (language === 'fa' ? 'کسری' : 'Deficit')
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
