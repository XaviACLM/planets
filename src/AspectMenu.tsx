import { type Aspect, aspectKindAngles } from './aspects.ts';
import { nodeSymbols, aspectSymbols, dotSymbol, aspectKindColors } from './astroGraphics.ts'

import "./AspectMenu.css";

function AspectMenu({ aspects, showAspectLabels, aspectsColorcoded, onDelete, onHover }: {
	aspects: Aspect[],
	showAspectLabels: boolean,
	aspectsColorcoded: boolean,
	onDelete: (aspect: Aspect) => void,
	onHover: (aspect: Aspect | null) => void
}) {
	
	const symbolSize = 20;
	
	return (
		<div className="aspect-menu">

			{aspects != null && aspects.map((aspect, index) => {
				const [r,g,b] = aspect.kind in aspectKindColors ? aspectKindColors[aspect.kind] : [255,255,255];
				return <div
					key={index}
					className="aspect-item"
					onMouseEnter={() => {onHover(aspect)}}
					onMouseLeave={() => {onHover(null)}}
				>
					{ !showAspectLabels && !aspectsColorcoded &&
						<img
							src={aspectSymbols[aspect.kind]}
							alt={aspect.kind}
							width={symbolSize}
							height={symbolSize}
							className="aspect-icon"
							style={{filter:"invert(1)"}}
						/>
					}
					{ !showAspectLabels && aspectsColorcoded &&
						<div
							className="aspect-icon"
							style={{
								WebkitMaskImage: `url(${aspectSymbols[aspect.kind]})`,
								maskImage: `url(${aspectSymbols[aspect.kind]})`,
								WebkitMaskRepeat: "no-repeat",
								maskRepeat: "no-repeat",
								WebkitMaskSize: "contain",
								maskSize: "contain",
								width: symbolSize,
								height: symbolSize,
								backgroundColor: `rgb(${r}, ${g}, ${b})`, // color you want
							}}
						/>
					}
					{ showAspectLabels && 
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
			})}
		</div>
	);
}

export default AspectMenu
