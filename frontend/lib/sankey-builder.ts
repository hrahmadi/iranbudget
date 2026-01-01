/**
 * Sankey Builder - Auto-Index Node Management for TypeScript
 * Eliminates manual index tracking for Plotly Sankey diagrams
 */

export interface NodeDefinition {
  name: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
}

export interface LinkDefinition {
  source: number;
  target: number;
  value: number;
  color: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  revenueTotal: number;
  expenditureTotal: number;
}

export interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
  x?: number;
  y?: number;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color: string;
}

export class SankeyBuilder {
  private nodes: NodeDefinition[] = [];
  private nodeMap: Map<string, number> = new Map();
  private links: LinkDefinition[] = [];

  /**
   * Add a node to the diagram.
   * 
   * @param name - Unique identifier (e.g., 'corporate-tax')
   * @param label - Display label (e.g., 'مالیات شرکت‌ها')
   * @param value - Node value for sizing
   * @param color - Hex color code
   * @param x - X position (0.0 to 1.0)
   * @param y - Y position (0.0 to 1.0)
   * @returns Auto-assigned index
   */
  addNode(name: string, label: string, value: number, color: string, x: number, y: number): number {
    if (this.nodeMap.has(name)) {
      throw new Error(`Node '${name}' already exists!`);
    }

    const index = this.nodes.length;
    this.nodeMap.set(name, index);

    this.nodes.push({
      name,
      label,
      value,
      color,
      x,
      y
    });

    return index;
  }

  /**
   * Add a link between two nodes.
   * 
   * @param sourceName - Source node name
   * @param targetName - Target node name
   * @param value - Flow value
   * @param color - Link color (defaults to source node color with opacity)
   */
  addLink(sourceName: string, targetName: string, value: number, color?: string): void {
    const sourceIdx = this.nodeMap.get(sourceName);
    const targetIdx = this.nodeMap.get(targetName);

    if (sourceIdx === undefined) {
      throw new Error(`Source node '${sourceName}' not found!`);
    }
    if (targetIdx === undefined) {
      throw new Error(`Target node '${targetName}' not found!`);
    }

    // Default color: inherit from source with transparency
    if (!color) {
      const sourceColor = this.nodes[sourceIdx].color;
      color = this.hexToRgba(sourceColor, 0.4);
    }

    // Only add link if value is meaningful
    if (value > 0.001) {
      this.links.push({
        source: sourceIdx,
        target: targetIdx,
        value,
        color
      });
    }
  }

  /**
   * Get the index of a node by name.
   */
  getIndex(name: string): number | undefined {
    return this.nodeMap.get(name);
  }

  /**
   * Generate SankeyData structure for React component.
   */
  build(revenueTotal: number, expenditureTotal: number): SankeyData {
    return {
      nodes: this.nodes.map(n => ({
        id: n.name,
        label: n.label,
        value: n.value,
        color: n.color,
        x: n.x,
        y: n.y
      })),
      links: this.links,
      revenueTotal,
      expenditureTotal
    };
  }

  /**
   * Get builder statistics.
   */
  stats(): { nodeCount: number; linkCount: number; nodeNames: string[] } {
    return {
      nodeCount: this.nodes.length,
      linkCount: this.links.length,
      nodeNames: Array.from(this.nodeMap.keys())
    };
  }

  /**
   * Convert hex color to rgba string.
   */
  private hexToRgba(hex: string, opacity: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
}
