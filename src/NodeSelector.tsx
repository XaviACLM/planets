import React from 'react';
import { Node } from './astroDefs';
import { nodeSymbols, nodeShortName } from './astroGraphics';

const NODE_CATEGORIES = [
  {
    name: 'Major Bodies',
    nodes: [
      Node.SUN,
	  Node.MOON,
	  Node.MERCURY,
	  Node.VENUS,
	  Node.MARS,
      Node.JUPITER,
	  Node.SATURN,
	  Node.URANUS,
	  Node.NEPTUNE,
	  Node.PLUTO
    ]
  },
  {
    name: 'Primary Angles',
    nodes: [
      Node.ASCENDANT,
	  Node.DESCENDANT,
	  Node.MIDHEAVEN,
	  Node.IMUM_COELI
    ]
  },
  {
    name: 'Arabic Parts',
    nodes: [
      Node.PART_OF_FORTUNE
    ]
  },
  {
    name: 'Lunar Nodes',
    nodes: [
      Node.LUNAR_ASCENDING,
	  Node.LUNAR_DESCENDING, 
      Node.LUNAR_APOGEE,
	  Node.LUNAR_PERIGEE
    ]
  },
  {
    name: 'Major Asteroids & Dwarfs',
    nodes: [
      Node.CERES,
	  Node.PALLAS,
	  Node.JUNO,
	  Node.VESTA,
	  Node.CHIRON,
      Node.ERIS,
	  Node.MAKEMAKE,
	  Node.HAUMEA,
	  Node.SEDNA
    ]
  },
  {
    name: 'Hamburg School Objects',
    nodes: [
      Node.CUPIDO,
	  Node.HADES,
	  Node.ZEUS,
	  Node.KRONOS,
	  Node.APOLLON,
      Node.ADMETOS,
	  Node.VULCANUS,
	  Node.POSEIDON,
    ]
  },
  {
    name: 'Minor Bodies',
    nodes: [
      Node.ASTRAEA,
      Node.HYGIEA,
      Node.PHOLUS,
      Node.NESSUS,
      Node.CHARIKLO,
      Node.HYLONOME,
      Node.CYLLARUS,
      Node.GONGGONG,
      Node.QUAOAR,
      Node.ORCUS,
      Node.SALACIA,
      Node.VARDA,
      Node.IXION,
      Node.VARUNA,
      Node.TYPHON,
      Node.CHAOS,
      Node.RADAMANTHUS,
      Node.GKUNHOMDIMA,
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
                    <span className="node-label">{nodeShortName[node] || node}</span>
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

export default NodeSelector;