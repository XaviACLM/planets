// NodeSelector.tsx
import React from 'react';
import { Node } from './astroDefs';
import { nodeSymbols } from './astroGraphics';

// Define categories for organization
const NODE_CATEGORIES = [
  {
    name: 'Main Bodies',
    nodes: [
      Node.SUN, Node.MOON, Node.MERCURY, Node.VENUS, Node.MARS,
      Node.JUPITER, Node.SATURN, Node.URANUS, Node.NEPTUNE, Node.PLUTO
    ]
  },
  {
    name: 'Primary Angles',
    nodes: [
      Node.ASCENDANT, Node.DESCENDANT, Node.MIDHEAVEN, Node.IMUM_COELI
    ]
  },
  {
    name: 'Arabic Parts',
    nodes: [
      Node.PART_OF_FORTUNE
    ]
  },
  {
    name: 'Lunar',
    nodes: [
      Node.LUNAR_ASCENDING, Node.LUNAR_DESCENDING, 
      Node.LUNAR_APOGEE, Node.LUNAR_PERIGEE
    ]
  },
  {
    name: 'Minor Bodies',
    nodes: [
      Node.CERES, Node.PALLAS, Node.JUNO, Node.VESTA, Node.CHIRON,
      Node.ERIS, Node.MAKEMAKE, Node.HAUMEA, Node.SEDNA
    ]
  }
];

interface NodeSelectorProps {
  selectedNodes: Set<Node>;
  onNodeToggle: (node: Node) => void;
  showLabels: boolean;
}

import "./NodeSelector.css";

const NodeSelector: React.FC<NodeSelectorProps> = ({
  selectedNodes,
  onNodeToggle,
  showLabels
}) => {
  return (
    <div className="node-selector">
      {NODE_CATEGORIES.map(category => (
        <div key={category.name} className="node-category">
          <label className="category-title">{category.name}</label>
          <div className="node-list">
            {category.nodes.map(node => {
              const isSelected = selectedNodes.has(node);
              const symbol = nodeSymbols.get(node);
              return (
                <button
                  key={node}
                  className={`node-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onNodeToggle(node)}
                  title={node}
                >
                  {showLabels ? (
                    <span className="node-label">{getShortName(node)}</span>
                  ) : (
                    symbol && <img src={symbol} alt={node} className="node-symbol" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to get shorter names for display
function getShortName(node: Node): string {
  const shortNames: Partial<Record<Node, string>> = {
    [Node.IMUM_COELI]: 'IC',
    [Node.PART_OF_FORTUNE]: 'Fortune',
    [Node.LUNAR_ASCENDING]: 'L.Asc',
    [Node.LUNAR_DESCENDING]: 'L.Des',
    [Node.LUNAR_APOGEE]: 'Lilith',
    [Node.LUNAR_PERIGEE]: 'Selene',
    [Node.ASCENDANT]: 'ASC',
    [Node.DESCENDANT]: 'DSC',
    [Node.MIDHEAVEN]: 'MC'
  };
  
  return shortNames[node] || node;
}

export default NodeSelector;