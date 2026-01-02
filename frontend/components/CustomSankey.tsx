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
  value: number; // Converted value (for thickness calculation)
  originalValue: number; // Original trillion rial value (for tooltips)
  color: string;
  thickness: number;
  sy: number;
  ty: number;
}

export default function CustomSankey({ data, year, language, displayMode, unit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 900 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  const isRTL = language === 'fa';

  // Constants
  const NODE_WIDTH = 25;
  const CENTER_NODE_WIDTH = 50; // Twice as thick
  const NODE_GAP = 2;
  const CURVATURE = 80;

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
      const x = node.x ?? 0.5; // Default to center if undefined
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

    // Find the column with most nodes to calculate worst-case gaps
    const maxNodes = Math.max(...Array.from(columns.values()).map(col => col.length));
    const maxGaps = (maxNodes - 1) * NODE_GAP;
    const globalAvailableHeight = 880 - maxGaps;

    columns.forEach((colNodes, xPos) => {
      const isCenter = xPos === 0.50;
      
      // Calculate actual sum of nodes in this column
      const columnSum = colNodes.reduce((sum, n) => sum + n.value, 0);
      
      // GLOBAL SCALE: Use revenueTotal to maintain Sankey invariant
      // All columns use same scale so children heights sum to parent
      const scale = scaleLinear()
        .domain([0, data.revenueTotal])
        .range([0, globalAvailableHeight]);

      // ALL columns vertically centered in viewport
      let currentStackY = (dimensions.height - 900) / 2 + 10;
      const startY = currentStackY;

      colNodes.forEach((node, idx) => {
        const height = scale(node.value);
        // Center column is thicker and centered around x position
        const nodeWidth = isCenter ? CENTER_NODE_WIDTH : NODE_WIDTH;
        const x0 = isCenter 
          ? (xPos * dimensions.width) - (CENTER_NODE_WIDTH / 2)  // Center around xPos
          : xPos * dimensions.width;
        const x1 = x0 + nodeWidth;

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
      
      const expectedEnd = startY + globalAvailableHeight;
      const actualEnd = currentStackY - NODE_GAP; // Subtract last gap
      const overflow = actualEnd - expectedEnd;
      
      if (Math.abs(overflow) > 1) {
        console.warn(`Column x=${xPos} overflow: ${overflow.toFixed(1)}px (sum=${columnSum.toFixed(2)}, expected=${globalAvailableHeight}px)`);
      }
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
        originalValue: link.value, // Keep original trillion rial value for tooltips
        color: link.color,
        thickness,
        sy,
        ty
      });
    });

    return { nodes: renderedNodes, links: renderedLinks };
  }, [data, dimensions, displayMode, unit, year]);

  // Compute highlighted nodes and links based on hover (full upstream/downstream chain)
  const { highlightedNodes, highlightedLinks } = useMemo(() => {
    const highlighted = new Set<string>();
    const highlightedLinkSet = new Set<number>();
    
    // Determine which node to use for highlighting
    let nodeToHighlight = hoveredNode;
    
    // When hovering a link, add it directly and highlight source+target
    if (hoveredLink !== null) {
      highlightedLinkSet.add(hoveredLink);
      const link = links[hoveredLink];
      highlighted.add(link.source.id);
      highlighted.add(link.target.id);
      nodeToHighlight = link.target.id;
    }
    
    // No hover state
    if (!nodeToHighlight) {
      return { 
        highlightedNodes: new Set<string>(), 
        highlightedLinks: new Set<number>() 
      };
    }
    
    // Add the initially hovered/targeted node
    highlighted.add(nodeToHighlight);
    
    // Pure ID-based traversal - no object mutation
    const findUpstream = (nodeId: string, visited: Set<string> = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Add node to highlighted set
      highlighted.add(nodeId);
      
      // Stop traversal at center node (don't traverse through it)
      if (nodeId === 'center-total') return;
      
      links.forEach((link, i) => {
        if (link.target.id === nodeId) {
          highlightedLinkSet.add(i);
          findUpstream(link.source.id, visited);
        }
      });
    };
    
    const findDownstream = (nodeId: string, visited: Set<string> = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Add node to highlighted set
      highlighted.add(nodeId);
      
      // Stop traversal at center node (don't traverse through it)
      if (nodeId === 'center-total') return;
      
      links.forEach((link, i) => {
        if (link.source.id === nodeId) {
          highlightedLinkSet.add(i);
          findDownstream(link.target.id, visited);
        }
      });
    };
    
    // When hovering a link, traverse from BOTH source and target
    // This ensures upstream/downstream nodes highlight even if one endpoint is center-total
    if (hoveredLink !== null) {
      const link = links[hoveredLink];
      findUpstream(link.source.id);  // Traverse upstream from source
      findDownstream(link.target.id); // Traverse downstream from target
    } else {
      // When hovering a node directly, traverse both ways from it
      findUpstream(nodeToHighlight);
      findDownstream(nodeToHighlight);
    }
    
    return { highlightedNodes: highlighted, highlightedLinks: highlightedLinkSet };
  }, [hoveredNode, hoveredLink, links]);

  // Tooltip helper functions
  const showTooltip = (event: MouseEvent, label: string, value: string) => {
    if (!tooltipRef.current) return;
    const tooltip = tooltipRef.current;
    tooltip.innerHTML = `<div class="font-semibold">${label}</div><div>${value}</div>`;
    tooltip.style.display = 'block';
    updateTooltipPosition(event);
  };

  const updateTooltipPosition = (event: MouseEvent) => {
    if (!tooltipRef.current || !containerRef.current) return;
    const tooltip = tooltipRef.current;
    const container = containerRef.current.getBoundingClientRect();
    const x = event.clientX - container.left;
    const y = event.clientY - container.top;
    
    // Position tooltip offset from cursor
    tooltip.style.left = `${x + 15}px`;
    tooltip.style.top = `${y + 15}px`;
  };

  const hideTooltip = () => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = 'none';
  };

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

  // Phase 4 & 5: Render SVG (initial render only)
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
        .attr('class', `link-${i}`)
        .attr('d', path)
        .attr('stroke', `url(#gradient-${i})`)
        .attr('stroke-width', link.thickness)
        .attr('fill', 'none')
        .attr('opacity', 0.8)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredLink(i);
          setHoveredNode(null);
          showTooltip(event, `${link.source.label} → ${link.target.label}`, formatLabel(link.originalValue));
        })
        .on('mousemove', (event) => {
          updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
          setHoveredLink(null);
          hideTooltip();
        });
    });

    // Draw nodes on top
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    nodes.forEach(node => {
      nodeGroup.append('rect')
        .attr('class', `node-${node.id}`)
        .attr('x', node.x0)
        .attr('y', node.y0)
        .attr('width', node.x1 - node.x0)
        .attr('height', node.y1 - node.y0)
        .attr('fill', node.color)
        .attr('stroke', '#2a2a2a')
        .attr('stroke-width', 0.5)
        .attr('rx', 2)
        .attr('opacity', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredNode(node.id);
          setHoveredLink(null);
          showTooltip(event, node.label, formatLabel(node.value));
        })
        .on('mousemove', (event) => {
          updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
          setHoveredNode(null);
          hideTooltip();
        });

      // Draw labels
      const isCenter = node.id === 'center-total';
      
      if (isCenter && node.label) {
        // Vertical text for center node
        nodeGroup.append('text')
          .attr('class', `label-${node.id}`)
          .attr('x', (node.x0 + node.x1) / 2)
          .attr('y', (node.y0 + node.y1) / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('font-family', isRTL ? 'Vazir, sans-serif' : 'inherit')
          .attr('opacity', 1)
          .attr('transform', `rotate(-90, ${(node.x0 + node.x1) / 2}, ${(node.y0 + node.y1) / 2})`)
          .style('pointer-events', 'none')
          .text(node.label);
      } else if (node.label) {
        // Horizontal text for other nodes - positioned INSIDE the node, clear of edges
        const isLeftSide = node.x0 < dimensions.width / 2;
        
        // Position text well inside the node (past the 25px node width)
        const padding = 30;
        const textX = isLeftSide 
          ? node.x0 + padding      // Left side: 30px from left edge
          : node.x1 - padding;     // Right side: 30px from right edge
        
        // Text anchor flips for RTL
        // LTR: left=start, right=end
        // RTL: left=end (text flows leftward), right=start (text flows rightward)
        const textAnchor = isRTL
          ? (isLeftSide ? 'end' : 'start')
          : (isLeftSide ? 'start' : 'end');
        
        nodeGroup.append('text')
          .attr('class', `label-${node.id}`)
          .attr('x', textX)
          .attr('y', (node.y0 + node.y1) / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', textAnchor)
          .attr('fill', '#ffffff')
          .attr('font-size', '10px')
          .attr('font-family', isRTL ? 'Vazir, sans-serif' : 'inherit')
          .attr('opacity', 1)
          .style('pointer-events', 'none')
          .text(node.label);
      }
    });

  }, [nodes, links, dimensions, formatLabel, CURVATURE]);

  // Update opacity based on hover (separate effect for performance)
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);

    // Update link opacity
    links.forEach((link, i) => {
      const isHighlighted = highlightedLinks.has(i);
      const shouldShow = isHighlighted || (hoveredNode === null && hoveredLink === null);
      
      svg.select(`.link-${i}`).attr('opacity', shouldShow ? 0.8 : 0.2);
    });

    // Update node and label opacity
    nodes.forEach(node => {
      const isHighlighted = highlightedNodes.has(node.id) || (hoveredNode === null && hoveredLink === null);
      
      svg.select(`.node-${node.id}`).attr('opacity', isHighlighted ? 1 : 0.3);
      svg.select(`.label-${node.id}`).attr('opacity', isHighlighted ? 1 : 0.3);
    });

  }, [hoveredNode, hoveredLink, highlightedNodes, highlightedLinks, nodes, links]);

  return (
    <div ref={containerRef} className="w-full relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          width: '100%',
          maxWidth: `${dimensions.width}px`,
          height: 'auto',
          minHeight: `${dimensions.height}px`,
          backgroundColor: '#1a1a1a',
          display: 'block',
          margin: '0 auto'
        }}
        onLoad={() => console.log('SVG loaded, actual height:', svgRef.current?.clientHeight)}
      />
      {/* Custom Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none hidden bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50"
        style={{ fontFamily: isRTL ? 'Vazir, sans-serif' : 'inherit' }}
      />
    </div>
  );
}
