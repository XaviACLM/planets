import { type Aspect, aspectKindAngles } from './aspects.ts';
import { nodeSymbols, aspectSymbols, dotSymbol, aspectKindColors } from './astroGraphics.ts'

import "./AspectMenu.css";

function createAspectElement(
	key: number,
	aspect: Aspect,
	showAspectLabels: boolean,
	aspectsColorcoded: boolean,
	parentAspect: Aspect | null,
	onDelete: (aspect: Aspect) => void,
	onHover: (aspect: Aspect | null) => void
){
	const symbolSize = 20;
	const fixedWidth = "90px";
	const fixedHeight = "20px";
	const isSubaspect = parentAspect !== null;
	
	const [r,g,b] = aspect.kind in aspectKindColors ? aspectKindColors[aspect.kind] : [255,255,255];
	return <div
		key={key}
		className="aspect-item"
		onMouseEnter={() => {onHover(aspect)}}
		onMouseLeave={() => {onHover(null)}}
	>
		<div
			className={`aspect-container ${isSubaspect ? 'subaspect' : ''}`}	
			style={{
				width: fixedWidth,
				height: fixedHeight,
			}}
		>
			{ !showAspectLabels && !aspectsColorcoded &&
				<img
					className="aspect-icon"
					src={aspectSymbols[aspect.kind]}
					alt={aspect.kind}
					width={symbolSize}
					height={symbolSize}
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
						backgroundColor: `rgb(${r}, ${g}, ${b})`,
					}}
				/>
			}
			{ showAspectLabels && 
				<label
					className="aspect-label"
					style = {{color:aspectsColorcoded ? `rgb(${r}, ${g}, ${b})` : "white"}}
				>
					{aspect.kind}
				</label>
			}
		</div>
		
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
			onClick={() => onDelete(aspect, parentAspect)}
		>
			✕
		</button>
	</div>;
}

function AspectMenu({ aspects, showAspectLabels, aspectsColorcoded, onDelete, onHover }: {
	aspects: Map<Aspect,Aspect[]>,
	showAspectLabels: boolean,
	aspectsColorcoded: boolean,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void
}) {
	
	return (
		<div className="aspect-menu">
			{aspects != null && Array.from(aspects.entries()).map(([aspect, subaspects], index) => {
				const aspectElement = createAspectElement(100*index, aspect, showAspectLabels, aspectsColorcoded, null, onDelete, onHover);
				const subaspectElements = subaspects.map((subaspect, subindex) => {
					return createAspectElement(100*index+subindex+1, subaspect, showAspectLabels, aspectsColorcoded, aspect, onDelete, onHover);
				})
				return [aspectElement, ...subaspectElements]
			})}
		</div>
	);
}

export default AspectMenu
