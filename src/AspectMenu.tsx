import { useMemo } from 'react';
import { type Aspect, filterAspectsByNode } from './aspects.ts';
import { Node } from './astroDefs.ts';
import { nodeSymbols, dotSymbol } from './astroGraphics.ts'
import { useSettingsStore } from './settingsStore.ts'
import { renderNode, renderString, renderAspectKind } from './renderPrimitives.tsx'
import { formatAngle } from './util';

function createConfigurationElement(
	key: number,
	aspect: Aspect,
	showAspectLabels: boolean,
	onDelete: (aspect: Aspect) => void, //TODO types
	onHover: (aspect: Aspect) => void,
	children: ReactNode,
) {
	return;
}

function createAspectElement(
	key: number,
	aspect: Aspect,
	showAspectLabels: boolean,
	parentAspect: Aspect | null,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void,
){
	const symbolSize = 20;
	const fixedWidth = showAspectLabels ? "110px" : "90px";
	const fixedHeight = "20px";
	const isSubaspect = parentAspect !== null;

	return <div
		key={key}
		className="flex items-center px-2 cursor-pointer hover:bg-theme-text/10 transition-colors duration-300"
		onMouseEnter={() => {onHover(aspect)}}
		onMouseLeave={() => {onHover(null)}}
	>
		<div
			className={isSubaspect ? 'pl-3' : ''}
			style={{
				width: fixedWidth,
				height: fixedHeight,
			}}
		>
			<div
				className={showAspectLabels ? '' : 'ml-5'}
			>
				{renderAspectKind(aspect.kind)}
			</div>
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
			Δ{formatAngle(aspect.error!)}
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
	useSettingsStore(s => s.showNodeLabels);
	const showAspectLabels = useSettingsStore(s => s.showAspectLabels);
	useSettingsStore(s => s.aspectsColorcoded);

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
				const aspectElement = createAspectElement(100*index, aspect, showAspectLabels, null, onDelete, onHover);
				const subaspectElements = subaspects.map((subaspect, subindex) => {
					return createAspectElement(100*index+subindex+1, subaspect, showAspectLabels, aspect, onDelete, onHover);
				})
				return [aspectElement, ...subaspectElements]
			})}
			{displayedAspects.size === 0 && ( renderString("No aspects.", {fontStyle: "italic"})
			)}
		</div>
	);
}

export default AspectMenu;
