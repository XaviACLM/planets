import { type Aspect, aspectKindAngles } from './aspects.ts';
import { nodeSymbols, aspectSymbols, dotSymbol } from './astroGraphics.ts'

import "./AspectMenu.css";

function AspectMenu({ aspects, showLabels, onDelete, onHover }: {
	aspects: Aspect[],
	showLabels: boolean,
	onDelete: (aspect: Aspect) => void,
	onHover: (aspect: Aspect | null) => void
}) {
	
	const symbolSize = 20;
	
	return (
		<div className="aspect-menu">

			{aspects != null &&
				aspects.map((aspect, index) => {
					return <div
						key={index}
						className="aspect-item"
						//todo
						onMouseEnter={() => {onHover(aspect)}}
						onMouseLeave={() => {onHover(null)}}
					>
						{ !showLabels &&
							<img
								src={aspectSymbols[aspect.kind]}
								alt={aspect.kind}
								width={symbolSize}
								height={symbolSize}
								className="aspect-icon"
								style={{filter:"invert(1)"}}
							/>
						}
						{ showLabels && 
							<label className="aspect-label">
								{aspect.kind}
							</label>
						}
						
						{/* node icons */}
						<div className="node-icons">
							{aspect.nodes.map((node, i) => (
								<img
									key={i}
									src={nodeSymbols[node]}
									alt={node}
									width={symbolSize}
									height={symbolSize}
									className="node-icon"
									style={{filter:"invert(1)"}}
								/>
							))}
							{Array.from({length: 6-aspect.nodes.length}).map((_, i) => (
								<img
									key={i+6}
									src={dotSymbol}
									alt={"bals"}
									width={symbolSize}
									height={symbolSize}
									className="node-icon"
									style={{filter:"invert(1)"}}
								/>
							))}
						</div>
						
						{/* error, quantile */}
						<div className="aspect-values">
							{ /*{aspect.error.toFixed(2)}Δ - {aspect.percentile.toFixed(2)}%*/}
							 Δ{(aspect.error*180/Math.PI).toFixed(2)}º
						</div>
			  
						{/* delete button */}
						<button
							className="delete-button"
							onClick={() => onDelete(aspect)}
						>
							✕
						</button>
					</div>;
				}
			)}
		</div>
	);
}

export default AspectMenu
