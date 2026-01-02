'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { select } from 'd3-selection';
import { SankeyData } from '@/lib/budget-transform';
import { Unit, convertFromTrillionRials, formatValue as formatValueWithUnit } from '@/lib/conversions';

type Language = 'en' | 'fa';
type DisplayMode = 'absolute' | 'percentage';

interface Props {
  data: SankeyData;
  year: string;
  language: Language;
  displayMode: DisplayMode;
  unit: Unit;
}

interface D3Node {
  id: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  order: number;
  group: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

interface D3Link {
  source: string;  // Node ID
  target: string;  // Node ID
  value: number;
  color: string;
}

export default function D3HierarchicalSankey({ data, year, language, displayMode, unit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 900 });
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  const isRTL = language === 'fa';

  // Semantic grouping function
  const getNodeGroup = (id: string): string => {
    const groups: Record<string, string> = {
      // Revenue - Tax
      'corporate-tax': 'tax',
      'individual-tax': 'tax',
      'vat': 'tax',
      'import-duties': 'tax',
      'other-tax': 'tax',
      'tax-revenue': 'tax',
      
      // Revenue - Oil & Gas
      'oil-exports': 'oil-gas',
      'gas-exports': 'oil-gas',
      'oil-gas-revenue': 'oil-gas',
      
      // Revenue - State Companies
      'state-operations': 'state-co',
      'state-credits': 'state-co',
      'state-loans-domestic': 'state-co',
      'state-loans-foreign': 'state-co',
      'state-assets': 'state-co',
      'state-other': 'state-co',
      'state-company-revenue': 'state-co',
      
      // Revenue - Other
      'fees-charges': 'other-rev',
      'other-income': 'other-rev',
      'special-revenue': 'other-rev',
      'other-revenue': 'other-rev',
      
      // Center
      'total-revenue': 'center',
      'total-spending': 'center',
      
      // Spending - Personnel
      'personnel': 'personnel',
      'employee-salaries': 'personnel',
      'retiree-pensions': 'personnel',
      'benefits': 'personnel',
      
      // Spending - Development
      'development': 'development',
      'infrastructure': 'development',
      'technology': 'development',
      'regional-dev': 'development',
      
      // Spending - Debt
      'debt-service': 'debt',
      'bond-repayments': 'debt',
      'debt-payments': 'debt',
      
      // Spending - Support
      'support': 'support',
      'cash-subsidies': 'support',
      'energy-subsidies': 'support',
      'food-essentials': 'support',
    };
    
    return groups[id] || 'other';
  };

  // Format value based on display mode and unit
  const formatLabel = (value: number) => {
    if (displayMode === 'percentage') {
      return `${(value / data.revenueTotal * 100).toFixed(1)}%`;
    }
    const converted = convertFromTrillionRials(value, unit, year);
    return formatValueWithUnit(converted, unit, language);
  };

  // Transform data for D3
  const sankeyData = useMemo(() => {
    const nodes: D3Node[] = data.nodes.map((n, i) => ({
      id: n.id,
      label: n.label,
      value: n.value,
      color: n.color,
      x: n.x ?? 0.5,
      y: n.y ?? 0.5,
      order: i,
      group: getNodeGroup(n.id)
    }));

    // Convert link indices to node IDs
    const links: D3Link[] = data.links.map(l => ({
      source: data.nodes[l.source].id,
      target: data.nodes[l.target].id,
      value: displayMode === 'percentage' 
        ? (l.value / data.revenueTotal) * 100
        : convertFromTrillionRials(l.value, unit, year),
      color: l.color
    }));

    return { nodes, links };
  }, [data, displayMode, unit, year, getNodeGroup]);

  // D3 layout
  const { nodes, links } = useMemo(() => {
    const sankeyGenerator = sankey<D3Node, D3Link>()
      .nodeId((d: any) => d.id)
      .nodeWidth(25)
      .nodePadding(30)
      .extent([[50, 10], [dimensions.width - 50, dimensions.height - 10]])
      .nodeSort((a, b) => a.order - b.order)
      .linkSort(null);

    const graph = sankeyGenerator({
      nodes: sankeyData.nodes.map(n => ({ ...n })),
      links: sankeyData.links.map(l => ({ ...l }))
    });

    // Force our manual positions - override D3's auto-layout
    graph.nodes.forEach((node: any, i: number) => {
      const originalNode = sankeyData.nodes[i];
      const nodeHeight = node.y1 - node.y0;
      
      // Use our manual x and y positions
      node.x0 = originalNode.x * dimensions.width;
      node.x1 = node.x0 + 25; // nodeWidth
      node.y0 = originalNode.y * dimensions.height;
      node.y1 = node.y0 + nodeHeight;
    });

    return graph;
  }, [sankeyData, dimensions]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setDimensions({ width, height: 900 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Render SVG
  useEffect(() => {
    if (!svgRef.current || !nodes || !links) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Create gradients
    const defs = svg.append('defs');
    links.forEach((link, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as any).x1)
        .attr('x2', (link.target as any).x0);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (link.source as any).color)
        .attr('stop-opacity', 0.5);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (link.target as any).color)
        .attr('stop-opacity', 0.5);
    });

    // Draw links
    const linkGroup = svg.append('g').attr('class', 'links');
    linkGroup.selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('stroke', 'none')
      .attr('opacity', (d, i) => hoveredLink === null || hoveredLink === i ? 1 : 0.2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        setHoveredLink(links.indexOf(d));
      })
      .on('mouseleave', function() {
        setHoveredLink(null);
      })
      .append('title')
      .text((d: any) => {
        const sourceLabel = d.source.label;
        const targetLabel = d.target.label;
        return `${sourceLabel} → ${targetLabel}
${formatLabel(d.value)}`;
      });

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    nodeGroup.selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) => d.color)
      .attr('stroke', '#2a2a2a')
      .attr('stroke-width', 0.5)
      .attr('rx', 2)
      .append('title')
      .text((d: any) => `${d.label}
${formatLabel(d.value)}`);

    // Draw labels
    nodeGroup.selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d: any) => d.x0 < dimensions.width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', (d: any) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x0 < dimensions.width / 2 ? 'start' : 'end')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .text((d: any) => d.label);

  }, [nodes, links, dimensions, hoveredLink, formatLabel]);

  return (
    <div ref={containerRef} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: '100%', height: 'auto', backgroundColor: '#1a1a1a' }}
      />
    </div>
  );
}
