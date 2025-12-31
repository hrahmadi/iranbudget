'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { SankeyData } from '@/lib/budget-transform';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
  data: SankeyData;
  year: string;
  language: 'en' | 'fa';
  displayMode?: 'absolute' | 'percentage';
  title?: string;
}

export default function HierarchicalSankey({ data, year, language, displayMode = 'absolute', title }: Props) {
  const isRTL = language === 'fa';
  
  // Format values based on display mode
  const formatValue = (value: number, total: number) => {
    if (displayMode === 'percentage') {
      const pct = (value / total) * 100;
      return `${pct.toFixed(1)}%`;
    }
    return `${value.toFixed(2)}T`;
  };
  
  const formatLabel = (value: number, total: number) => {
    if (displayMode === 'percentage') {
      const pct = (value / total) * 100;
      return `${pct.toFixed(1)}%`;
    }
    return `${value.toFixed(1)}T`;
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
    height: 1000,
    margin: { l: 10, r: 10, t: 100, b: 50 },
    annotations: [
      // Vertical text for center columns
      {
        text: isRTL ? 
          `<b>کل درآمد<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.revenueTotal, data.revenueTotal)}</b>` : 
          `<b>Total Revenue<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.revenueTotal, data.revenueTotal)}</b>`,
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
          `<b>کل هزینه<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.expenditureTotal, data.expenditureTotal)}</b>` : 
          `<b>Total Spending<br>${displayMode === 'percentage' ? '100%' : formatLabel(data.expenditureTotal, data.expenditureTotal)}</b>`,
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
  }), [year, language, title, isRTL]);
  
  // Use positions from the data (set by SankeyBuilder)
  const nodeX = useMemo(() => data.nodes.map(n => n.x), [data]);
  const nodeY = useMemo(() => data.nodes.map(n => n.y), [data]);

  const sankeyData = useMemo(() => {
    // Determine which total to use for percentage calculation
    const getTotal = (linkIndex: number) => {
      const link = data.links[linkIndex];
      // Links on revenue side use revenue total, spending side use expenditure total
      // This is a simplification - ideally we'd track which side each node is on
      return data.revenueTotal;
    };

    return {
      type: 'sankey',
      arrangement: 'freeform',
      node: {
        pad: 15,
        thickness: 60,
        line: { color: '#2a2a2a', width: 0.5 },
        label: data.nodes.map(n => n.label),
        color: data.nodes.map(n => n.color),
        x: nodeX,
        y: nodeY,
        hovertemplate: displayMode === 'percentage' ?
          '<b>%{label}</b><br>%{value:.1f}%<extra></extra>' :
          '<b>%{label}</b><br>%{value:.2f}T rials<extra></extra>'
      },
      link: {
        source: data.links.map(l => l.source),
        target: data.links.map(l => l.target),
        value: displayMode === 'percentage' ?
          data.links.map(l => (l.value / data.revenueTotal) * 100) :
          data.links.map(l => l.value),
        color: data.links.map(l => l.color),
        hovertemplate: displayMode === 'percentage' ?
          '%{source.label} → %{target.label}<br>%{value:.1f}%<extra></extra>' :
          '%{source.label} → %{target.label}<br>%{value:.2f}T rials<extra></extra>'
      }
    };
  }, [data, nodeX, nodeY, displayMode]);
  
  return (
    <div className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <Plot
        data={[sankeyData as any]}
        layout={layout as any}
        config={{ responsive: true }}
        className="w-full"
        style={{ width: '100%', height: '1000px' }}
      />
    </div>
  );
}
