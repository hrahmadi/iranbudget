'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
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

interface RenderedNode {
  id: string;
  label: string;
  value: number;
  color: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  outOffset: number;
  inOffset: number;
}

interface RenderedLink {
  source: RenderedNode;
  target: RenderedNode;
  value: number;
  color: string;
  thickness: number;
  sy: number;
  ty: number;
}

export default function CustomSankey({ data, year, language, displayMode, unit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 900 });
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  const isRTL = language === 'fa';

  // Constants
  const NODE_WIDTH = 25;
  const NODE_GAP = 5;
  const CURVATURE = 120;

  // Format value
  const formatLabel = (value: number) => {
    if (displayMode === 'percentage') {
      return `${(value / data.revenueTotal * 100).toFixed(1)}%`;
    }
    const converted = convertFromTrillionRials(value, unit, year);
    return formatValueWithUnit(converted, unit, language);
  };

  // Convert link values based on display mode
  const convertValue = (value: number) => {
    if (displayMode === 'percentage') {
      return (value / data.revenueTotal) * 100;
    }
    return convertFromTrillionRials(value, unit, year);
  };

  // Phase 1-3: Compute layout
  const { nodes, links } = useMemo(() => {
    // Group nodes by x position (columns)
    const columns = new Map<number, typeof data.nodes>();
    data.nodes.forEach(node => {
      const x = node.x;
      if (!columns.has(x)) columns.set(x, []);
      columns.get(x)!.push(node);
    });

    // Sort nodes within each column by y position
    columns.forEach(nodes => {
      nodes.sort((a, b) => (a.y || 0) - (b.y || 0));
    });

    // Phase 1 & 2: Calculate node heights and positions per column
    const renderedNodes: RenderedNode[] = [];
    const nodeMap = new Map<string, RenderedNode>();

    columns.forEach((colNodes, xPos) => {
      const columnValue = colNodes.reduce((sum, n) => sum + n.value, 0);
      const columnHeight = dimensions.height - 20;
      const scale = scaleLinear()
        .domain([0, columnValue])
        .range([0, columnHeight]);

      let currentStackY = 10;

      colNodes.forEach(node => {
        const height = scale(node.value);
        const x0 = xPos * dimensions.width;
        const x1 = x0 + NODE_WIDTH;

        const rendered: RenderedNode = {
          id: node.id,
          label: node.label,
          value: node.value,
          color: node.color,
          x0,
          x1,
          y0: currentStackY,
          y1: currentStackY + height,
          outOffset: 0,
          inOffset: 0
        };

        renderedNodes.push(rendered);
        nodeMap.set(node.id, rendered);
        currentStackY += height + NODE_GAP;
      });
    });

    // Phase 3: Precompute link attachment points
    const renderedLinks: RenderedLink[] = [];
    const linkScale = scaleLinear()
      .domain([0, data.revenueTotal])
      .range([0, dimensions.height - 20]);

    data.links.forEach(link => {
      const source = nodeMap.get(data.nodes[link.source].id);
      const target = nodeMap.get(data.nodes[link.target].id);
      
      if (!source || !target) return;

      const value = convertValue(link.value);
      const thickness = linkScale(link.value);

      // Calculate attachment points with stacking
      const sy = source.y0 + source.outOffset + thickness / 2;
      const ty = target.y0 + target.inOffset + thickness / 2;

      source.outOffset += thickness;
      target.inOffset += thickness;

      renderedLinks.push({
        source,
        target,
        value,
        color: link.color,
        thickness,
        sy,
        ty
      });
    });

    return { nodes: renderedNodes, links: renderedLinks };
  }, [data, dimensions, displayMode, unit, year]);

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

  // Phase 4 & 5: Render SVG
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
        .attr('x1', link.source.x1)
        .attr('x2', link.target.x0);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', link.source.color)
        .attr('stop-opacity', 0.5);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', link.target.color)
        .attr('stop-opacity', 0.5);
    });

    // Draw links first (below nodes)
    const linkGroup = svg.append('g').attr('class', 'links');
    
    links.forEach((link, i) => {
      const sx = link.source.x1;
      const tx = link.target.x0;
      const path = `
        M ${sx} ${link.sy}
        C ${sx + CURVATURE} ${link.sy},
          ${tx - CURVATURE} ${link.ty},
          ${tx} ${link.ty}
      `;

      linkGroup.append('path')
        .attr('d', path)
        .attr('stroke', `url(#gradient-${i})`)
        .attr('stroke-width', link.thickness)
        .attr('fill', 'none')
        .attr('opacity', hoveredLink === null || hoveredLink === i ? 0.8 : 0.2)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredLink(i))
        .on('mouseleave', () => setHoveredLink(null))
        .append('title')
        .text(`${link.source.label} → ${link.target.label}\n${formatLabel(link.value)}`);
    });

    // Draw nodes on top
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    nodes.forEach(node => {
      nodeGroup.append('rect')
        .attr('x', node.x0)
        .attr('y', node.y0)
        .attr('width', node.x1 - node.x0)
        .attr('height', node.y1 - node.y0)
        .attr('fill', node.color)
        .attr('stroke', '#2a2a2a')
        .attr('stroke-width', 0.5)
        .attr('rx', 2)
        .append('title')
        .text(`${node.label}\n${formatLabel(node.value)}`);

      // Draw labels
      nodeGroup.append('text')
        .attr('x', node.x0 < dimensions.width / 2 ? node.x1 + 6 : node.x0 - 6)
        .attr('y', (node.y0 + node.y1) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', node.x0 < dimensions.width / 2 ? 'start' : 'end')
        .attr('fill', '#ffffff')
        .attr('font-size', '10px')
        .text(node.label);
    });

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
