'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { SankeyData } from '@/lib/budget-transform';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
  data: SankeyData;
  year: string;
  language: 'en' | 'fa';
  title?: string;
}

export default function HierarchicalSankey({ data, year, language, title }: Props) {
  const isRTL = language === 'fa';
  
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
        text: isRTL ? `<b>کل درآمد<br>${data.revenueTotal.toFixed(1)}T</b>` : `<b>Total Revenue<br>${data.revenueTotal.toFixed(1)}T</b>`,
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
        text: isRTL ? `<b>کل هزینه<br>${data.expenditureTotal.toFixed(1)}T</b>` : `<b>Total Spending<br>${data.expenditureTotal.toFixed(1)}T</b>`,
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

  const sankeyData = useMemo(() => ({
    type: 'sankey',
    arrangement: 'freeform',  // Need freeform for manual positioning
    node: {
      pad: 15,
      thickness: 60,
      line: { color: '#2a2a2a', width: 0.5 },
      label: data.nodes.map(n => n.label),
      color: data.nodes.map(n => n.color),
      x: nodeX,
      y: nodeY,
      hovertemplate: '<b>%{label}</b><br>%{value:.2f}T rials<extra></extra>'
    },
    link: {
      source: data.links.map(l => l.source),
      target: data.links.map(l => l.target),
      value: data.links.map(l => l.value),
      color: data.links.map(l => l.color),
      hovertemplate: '%{source.label} → %{target.label}<br>%{value:.2f}T rials<extra></extra>'
    }
  }), [data, nodeX, nodeY]);
  
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
