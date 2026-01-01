'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { SankeyData } from '@/lib/budget-transform';
import { Unit, convertFromTrillionRials, formatValue as formatValueWithUnit } from '@/lib/conversions';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[900px] flex items-center justify-center">
      <div className="text-xl text-gray-400">Loading visualization...</div>
    </div>
  )
});

interface Props {
  data: SankeyData;
  year: string;
  language: 'en' | 'fa';
  displayMode?: 'absolute' | 'percentage';
  unit?: Unit;
  title?: string;
}

export default function HierarchicalSankey({ 
  data, 
  year, 
  language, 
  displayMode = 'absolute', 
  unit = 'trillion_rial',
  title 
}: Props) {
  const isRTL = language === 'fa';
  
  // Convert totals to selected unit
  const convertedRevenueTotal = useMemo(
    () => convertFromTrillionRials(data.revenueTotal, unit, year),
    [data.revenueTotal, unit, year]
  );
  
  const convertedExpenditureTotal = useMemo(
    () => convertFromTrillionRials(data.expenditureTotal, unit, year),
    [data.expenditureTotal, unit, year]
  );
  
  // Format values based on display mode and unit
  const formatValue = (valueInTrillionRials: number) => {
    if (displayMode === 'percentage') {
      const pct = (valueInTrillionRials / data.revenueTotal) * 100;
      return `${pct.toFixed(1)}%`;
    }
    const converted = convertFromTrillionRials(valueInTrillionRials, unit, year);
    return formatValueWithUnit(converted, unit, language);
  };
  
  const formatLabel = (valueInTrillionRials: number) => {
    if (displayMode === 'percentage') {
      const pct = (valueInTrillionRials / data.revenueTotal) * 100;
      return `${pct.toFixed(1)}%`;
    }
    const converted = convertFromTrillionRials(valueInTrillionRials, unit, year);
    // Shorter format for labels
    let precision: number;
    switch (unit) {
      case 'trillion_rial': precision = 1; break;
      case 'hemmat': precision = 2; break;
      case 'usd': precision = 2; break;
    }
    return converted.toFixed(precision);
  };
  
  const layout = useMemo(() => ({
    title: {
      text: title || `<b>${isRTL ? 'جریان بودجه ملی ایران' : 'Iran National Budget Flow'} - ${year}</b>`,
      x: 0.5,
      y: 0.98,
      xanchor: 'center',
      yanchor: 'top',
      font: { size: 20, color: '#ffffff' }
    },
    font: {
      size: 10,
      family: isRTL ? 'Vazir, Tahoma, Arial, sans-serif' : 'Arial, sans-serif',
      color: '#ffffff'
    },
    plot_bgcolor: '#1a1a1a',
    paper_bgcolor: '#1a1a1a',
    height: 900,
    margin: { l: 10, r: 10, t: 80, b: 50 },
    annotations: [
      // Vertical text for center columns
      {
        text: isRTL ? 
          `<b>کل درآمد<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.revenueTotal)}</b>` : 
          `<b>Total Revenue<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.revenueTotal)}</b>`,
        x: 0.48,
        y: 0.5,
        xref: 'paper',
        yref: 'paper',
        showarrow: false,
        font: { size: 14, color: '#ffffff' },
        textangle: -90,
        xanchor: 'center',
        yanchor: 'middle'
      },
      {
        text: isRTL ? 
          `<b>کل هزینه<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.expenditureTotal)}</b>` : 
          `<b>Total Spending<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.expenditureTotal)}</b>`,
        x: 0.52,
        y: 0.5,
        xref: 'paper',
        yref: 'paper',
        showarrow: false,
        font: { size: 14, color: '#ffffff' },
        textangle: -90,
        xanchor: 'center',
        yanchor: 'middle'
      }
    ]
  }), [year, language, title, isRTL, displayMode, unit, formatLabel]);
  
  // Use positions from the data (set by SankeyBuilder)
  const nodeX = useMemo(() => data.nodes.map(n => n.x), [data]);
  const nodeY = useMemo(() => data.nodes.map(n => n.y), [data]);

  const sankeyData = useMemo(() => {
    // Convert link values based on display mode and unit
    const convertedLinkValues = data.links.map(l => {
      if (displayMode === 'percentage') {
        return (l.value / data.revenueTotal) * 100;
      }
      return convertFromTrillionRials(l.value, unit, year);
    });

    // Hover template based on display mode
    const nodeHoverTemplate = displayMode === 'percentage' ?
      '<b>%{label}</b><br>%{value:.1f}%<extra></extra>' :
      `<b>%{label}</b><br>%{value:.2f} ${formatValueWithUnit(0, unit, language).split(' ').slice(1).join(' ')}<extra></extra>`;
    
    const linkHoverTemplate = displayMode === 'percentage' ?
      '%{source.label} → %{target.label}<br>%{value:.1f}%<extra></extra>' :
      `%{source.label} → %{target.label}<br>%{value:.2f} ${formatValueWithUnit(0, unit, language).split(' ').slice(1).join(' ')}<extra></extra>`;

    return {
      type: 'sankey' as const,
      orientation: 'h',
      arrangement: 'snap',
      node: {
        pad: 30,
        thickness: 25,
        line: { color: '#2a2a2a', width: 0.5 },
        label: data.nodes.map(n => n.label),
        color: data.nodes.map(n => n.color),
        x: nodeX,
        y: nodeY,
        hovertemplate: nodeHoverTemplate
      },
      link: {
        source: data.links.map(l => l.source),
        target: data.links.map(l => l.target),
        value: convertedLinkValues,
        color: data.links.map(l => l.color),
        hovertemplate: linkHoverTemplate,
        arrowlen: 0
      },
      textfont: {
        size: 10,
        color: '#ffffff'
      }
    };
  }, [data, nodeX, nodeY, displayMode, unit, year, language]);
  
  return (
    <div className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <Plot
        data={[sankeyData as any]}
        layout={layout as any}
        config={{ 
          responsive: true,
          displayModeBar: false,
          staticPlot: false
        }}
        className="w-full"
        style={{ width: '100%', height: '900px' }}
        useResizeHandler={true}
        revision={0}
        key={`${year}-${language}-${displayMode}-${unit}`}
      />
    </div>
  );
}
