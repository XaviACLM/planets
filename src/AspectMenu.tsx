import { type Aspect } from './aspects.ts';
import { nodeSymbols, aspectSymbols, dotSymbol, aspectKindColors } from './astroGraphics.ts'

function createAspectElement(
	key: number,
	aspect: Aspect,
	showAspectLabels: boolean,
	aspectsColorcoded: boolean,
	parentAspect: Aspect | null,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void
){
	const symbolSize = 20;
	const fixedWidth = "90px";
	const fixedHeight = "20px";
	const isSubaspect = parentAspect !== null;

	const [r,g,b] = aspect.kind in aspectKindColors ? aspectKindColors[aspect.kind]! : [255,255,255];
	return <div
		key={key}
		className="flex items-center px-2 cursor-pointer hover:bg-zinc-900 transition-colors duration-300"
		onMouseEnter={() => {onHover(aspect)}}
		onMouseLeave={() => {onHover(null)}}
	>
		<div
			className={isSubaspect ? 'pl-2.5' : ''}
			style={{
				width: fixedWidth,
				height: fixedHeight,
			}}
		>
			{ !showAspectLabels && !aspectsColorcoded &&
				<img
					className="ml-5 invert"
					src={aspectSymbols[aspect.kind]}
					alt={aspect.kind}
					width={symbolSize}
					height={symbolSize}
				/>
			}
			{ !showAspectLabels && aspectsColorcoded &&
				<div
					className="ml-5"
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
					className="text-xs whitespace-nowrap font-bold small-caps"
					style={{color: aspectsColorcoded ? `rgb(${r}, ${g}, ${b})` : "white"}}
				>
					{aspect.kind}
				</label>
			}
		</div>

		{/* node icons */}
		<div className="flex mr-4">
			{aspect.nodes.map((node, i) => (
				<img
					key={i}
					src={nodeSymbols[node]}
					alt={node}
					width={symbolSize}
					height={symbolSize}
					className="w-4 h-4 mr-1 invert"
				/>
			))}
			{Array.from({length: 6-aspect.nodes.length}).map((_, i) => (
				<img
					key={i+6}
					src={dotSymbol}
					alt={"bals"}
					width={symbolSize}
					height={symbolSize}
					className="w-4 h-4 mr-1 invert"
				/>
			))}
		</div>

		{/* error, quantile */}
		<div className="grow text-right text-[0.7em] mr-4">
			{ /*{aspect.error.toFixed(2)}Δ - {aspect.percentile.toFixed(2)}%*/}
			 Δ{(aspect.error!*180/Math.PI).toFixed(2)}º
		</div>

		{/* delete button */}
		<button
			className="border-none bg-transparent cursor-pointer text-white p-0 text-base"
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
		<div className="p-2 overflow-y-auto bg-black text-white scrollbar-none">
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

export default AspectMenu;
