'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import CustomSankey from '@/components/CustomSankey';
import { transformToHierarchicalSankey, BudgetData, SankeyData } from '@/lib/budget-transform';
import { Unit, UNIT_INFO, convertFromTrillionRials, formatValue as formatValueWithUnit } from '@/lib/conversions';

type Language = 'en' | 'fa';
type Year = '1395' | '1396' | '1397' | '1398' | '1399' | '1400' | '1401' | '1402' | '1403' | '1404';
type DisplayMode = 'absolute' | 'percentage';

const translations = {
  en: {
    title: 'Iran National Budget Flow',
    yearLabel: 'Year:',
    languageLabel: 'Language:',
    displayModeLabel: 'Display Mode:',
    unitLabel: 'Unit:',
    loading: 'Loading...',
    error: 'Error loading data',
  },
  fa: {
    title: 'جریان بودجه ملی ایران',
    yearLabel: 'سال:',
    languageLabel: 'زبان:',
    displayModeLabel: 'نمایش:',
    unitLabel: 'واحد:',
    loading: 'در حال بارگذاری...',
    error: 'خطا در بارگذاری داده‌ها',
  },
};

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize state from URL params or defaults
  const [year, setYear] = useState<Year>((searchParams.get('year') as Year) || '1404');
  const [language, setLanguage] = useState<Language>((searchParams.get('lang') as Language) || 'en');
  const [displayMode, setDisplayMode] = useState<DisplayMode>((searchParams.get('mode') as DisplayMode) || 'absolute');
  const [unit, setUnit] = useState<Unit>((searchParams.get('unit') as Unit) || 'trillion_rial');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [sankeyData, setSankeyData] = useState<SankeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('year', year);
    params.set('lang', language);
    params.set('mode', displayMode);
    params.set('unit', unit);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [year, language, displayMode, unit, router]);

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
        <h1 
          className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent" 
          style={{ 
            fontFamily: language === 'fa' ? 'Shabnam, Vazir, sans-serif' : 'inherit',
            fontWeight: language === 'fa' ? '800' : 'bold',
            letterSpacing: language === 'fa' ? '0.02em' : 'normal'
          }}
          dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
          {t.title}
        </h1>
        
        {/* Controls - Fixed LTR layout */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8" style={{ fontFamily: language === 'fa' ? 'Vazir, sans-serif' : 'inherit' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.yearLabel}</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as Year)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: language === 'fa' ? 'Vazir, sans-serif' : 'inherit' }}
              >
                {['1395', '1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.unitLabel}</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: language === 'fa' ? 'Vazir, sans-serif' : 'inherit' }}
              >
                <option value="trillion_rial">
                  {language === 'fa' ? UNIT_INFO.trillion_rial.nameFa : UNIT_INFO.trillion_rial.name}
                </option>
                <option value="hemmat">
                  {language === 'fa' ? UNIT_INFO.hemmat.nameFa : UNIT_INFO.hemmat.name}
                </option>
                <option value="usd">
                  {language === 'fa' ? UNIT_INFO.usd.nameFa : UNIT_INFO.usd.name}
                </option>
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
                <span className={`text-sm ${language === 'fa' ? 'text-white font-semibold' : 'text-gray-400'}`} style={{ fontFamily: 'Vazir, sans-serif' }}>
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
            <TransformWrapper
              initialScale={1}
              minScale={0.3}
              maxScale={3}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
              doubleClick={{ mode: 'reset' }}
              panning={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Zoom Controls */}
                  <div className="flex gap-2 mb-4 justify-center">
                    <button
                      onClick={() => zoomIn()}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium"
                      aria-label="Zoom out"
                    >
                      −
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium"
                      aria-label="Reset zoom"
                    >
                      {language === 'fa' ? 'بازنشانی' : 'Reset'}
                    </button>
                  </div>

                  <TransformComponent
                    wrapperClass="!w-full !h-auto"
                    contentClass="!w-full !h-auto"
                  >
                    <CustomSankey
                      data={sankeyData}
                      year={year}
                      language={language}
                      displayMode={displayMode}
                      unit={unit}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm" style={{ fontFamily: language === 'fa' ? 'Vazir, sans-serif' : 'inherit' }}>
          <p>
            {language === 'fa' 
              ? 'جریان بودجه ملی ایران | داده‌ها از قوانین بودجه سالانه'
              : 'Iran National Budget Flow | Data from Annual Budget Laws'
            }
          </p>
        </footer>
      </div>
    </div>
  );
}
