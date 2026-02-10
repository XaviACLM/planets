import { useMemo } from 'react';
import { type Aspect, filterAspectsByNode } from './aspects.ts';
import { Node } from './astroDefs.ts';
import { nodeSymbols, aspectSymbols, dotSymbol, aspectKindColors } from './astroGraphics.ts'
import { useSettingsStore } from './settingsStore.ts'
import { Theme } from './settingsDefs.ts'
import { renderNode, renderString } from './renderPrimitives.tsx'

function createAspectElement(
	key: number,
	aspect: Aspect,
	showAspectLabels: boolean,
	aspectsColorcoded: boolean,
	parentAspect: Aspect | null,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void,
	fallbackColor: [number, number, number]
){
	const symbolSize = 20;
	const fixedWidth = "90px";
	const fixedHeight = "20px";
	const isSubaspect = parentAspect !== null;

	const [r,g,b] = aspect.kind in aspectKindColors ? aspectKindColors[aspect.kind]! : fallbackColor;
	return <div
		key={key}
		className="flex items-center px-2 cursor-pointer hover:bg-gray-500/20 transition-colors duration-300"
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
					className="ml-5 icon-filter"
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
					className="w-4 h-4 mr-1 icon-filter"
				/>
			))}
			{Array.from({length: 6-aspect.nodes.length}).map((_, i) => (
				<img
					key={i+6}
					src={dotSymbol}
					alt={"bals"}
					width={symbolSize}
					height={symbolSize}
					className="w-4 h-4 mr-1 icon-filter"
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
			className="border-none bg-transparent cursor-pointer text-theme-text p-0 text-base"
			onClick={() => onDelete(aspect, parentAspect)}
		>
			✕
		</button>
	</div>;
}

function AspectMenu({ aspects, onDelete, onHover, highlightedNode, clearHighlight }: {
	aspects: Map<Aspect,Aspect[]>,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void,
	highlightedNode: Node | null,
	clearHighlight: () => void
}) {
	const showAspectLabels = useSettingsStore(s => s.showAspectLabels);
	const aspectsColorcoded = useSettingsStore(s => s.aspectsColorcoded);
	const theme = useSettingsStore(s => s.theme);
	const fallbackColor: [number, number, number] = theme === Theme.DARK ? [255, 255, 255] : [61, 41, 20];

	// Filter aspects if a node is highlighted
	const displayedAspects = useMemo(() => {
		if (highlightedNode === null) {
			return aspects;
		}
		return filterAspectsByNode(aspects, highlightedNode);
	}, [aspects, highlightedNode]);

	return (
		<div className="p-2 overflow-y-auto bg-theme-bg text-theme-text scrollbar-none">
			{/* Header message when filtering */}
			{highlightedNode !== null && (
				<div className="pb-1 text-sm">
					{renderString("Showing aspects for ")}
					{renderNode(highlightedNode, { forceText: true, withArticle: true })}
					{renderString(". ")}
					<button
						className="bg-transparent border-none text-theme-text underline cursor-pointer p-0 m-0 font-[inherit] inline hover:opacity-70"
						onClick={clearHighlight}
					>
						{renderString("Show all aspects.")}
					</button>
				</div>
			)}
			{displayedAspects != null && Array.from(displayedAspects.entries()).map(([aspect, subaspects], index) => {
				const aspectElement = createAspectElement(100*index, aspect, showAspectLabels, aspectsColorcoded, null, onDelete, onHover, fallbackColor);
				const subaspectElements = subaspects.map((subaspect, subindex) => {
					return createAspectElement(100*index+subindex+1, subaspect, showAspectLabels, aspectsColorcoded, aspect, onDelete, onHover, fallbackColor);
				})
				return [aspectElement, ...subaspectElements]
			})}
			{displayedAspects.size === 0 && ( renderString("No aspects.", {fontStyle: "italic"})
			)}
		</div>
	);
}

export default AspectMenu;
