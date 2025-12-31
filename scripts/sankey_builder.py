"""
Sankey Builder - Auto-Index Node Management
Eliminates manual index tracking for Plotly Sankey diagrams
"""

class SankeyBuilder:
    """
    Build Sankey diagrams without manually tracking node indices.
    
    Usage:
        builder = SankeyBuilder()
        builder.add_node('corporate-tax', 'مالیات شرکت‌ها', 8.17, '#1E5F8C', 0.05, 0.10)
        builder.add_link('corporate-tax', 'tax-revenue', 8.17)
        data = builder.build()
    """
    
    def __init__(self):
        self.nodes = []
        self.node_map = {}  # name -> index
        self.links = []
    
    def add_node(self, name, label, value, color, x, y):
        """
        Add a node to the diagram.
        
        Args:
            name (str): Unique identifier (e.g., 'corporate-tax')
            label (str): Display label (e.g., 'مالیات شرکت‌ها')
            value (float): Node value for sizing
            color (str): Hex color code
            x (float): X position (0.0 to 1.0)
            y (float): Y position (0.0 to 1.0)
        
        Returns:
            int: Auto-assigned index
        """
        if name in self.node_map:
            raise ValueError(f"Node '{name}' already exists!")
        
        index = len(self.nodes)
        self.node_map[name] = index
        
        self.nodes.append({
            'name': name,
            'label': label,
            'value': value,
            'color': color,
            'x': x,
            'y': y
        })
        
        return index
    
    def add_link(self, source_name, target_name, value, color=None):
        """
        Add a link between two nodes.
        
        Args:
            source_name (str): Source node name
            target_name (str): Target node name
            value (float): Flow value
            color (str, optional): Link color (defaults to source node color with opacity)
        """
        if source_name not in self.node_map:
            raise ValueError(f"Source node '{source_name}' not found!")
        if target_name not in self.node_map:
            raise ValueError(f"Target node '{target_name}' not found!")
        
        source_idx = self.node_map[source_name]
        target_idx = self.node_map[target_name]
        
        # Default color: inherit from source with transparency
        if color is None:
            source_color = self.nodes[source_idx]['color']
            # Convert hex to rgba with 40% opacity
            color = self._hex_to_rgba(source_color, 0.4)
        
        self.links.append({
            'source': source_idx,
            'target': target_idx,
            'value': value,
            'color': color
        })
    
    def get_index(self, name):
        """Get the index of a node by name."""
        return self.node_map.get(name)
    
    def build(self):
        """
        Generate Plotly-compatible Sankey structure.
        
        Returns:
            dict: Ready for go.Sankey(node=..., link=...)
        """
        return {
            'node': {
                'label': [n['label'] for n in self.nodes],
                'color': [n['color'] for n in self.nodes],
                'x': [n['x'] for n in self.nodes],
                'y': [n['y'] for n in self.nodes],
                'pad': 15,
                'thickness': 60,
                'line': {
                    'color': '#2a2a2a',
                    'width': 0.5
                }
            },
            'link': {
                'source': [l['source'] for l in self.links],
                'target': [l['target'] for l in self.links],
                'value': [l['value'] for l in self.links],
                'color': [l['color'] for l in self.links]
            }
        }
    
    def stats(self):
        """Print builder statistics."""
        print(f"Nodes: {len(self.nodes)}")
        print(f"Links: {len(self.links)}")
        print(f"Node names: {list(self.node_map.keys())}")
    
    @staticmethod
    def _hex_to_rgba(hex_color, opacity):
        """Convert hex color to rgba string."""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return f'rgba({r},{g},{b},{opacity})'


# Example usage
if __name__ == '__main__':
    builder = SankeyBuilder()
    
    # Add nodes
    builder.add_node('source1', 'Source 1', 100, '#2A7BA8', 0.1, 0.3)
    builder.add_node('source2', 'Source 2', 50, '#2A7BA8', 0.1, 0.7)
    builder.add_node('target', 'Target', 150, '#D6006E', 0.9, 0.5)
    
    # Add links
    builder.add_link('source1', 'target', 100)
    builder.add_link('source2', 'target', 50)
    
    # Build
    data = builder.build()
    
    print("Sankey data structure:")
    print(f"Nodes: {data['node']['label']}")
    print(f"Links: {list(zip(data['link']['source'], data['link']['target'], data['link']['value']))}")
