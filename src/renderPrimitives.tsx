import { type ReactNode } from 'react';
import { Node, Zodiac, Mode, Element, mainAngles, arabicParts } from './astroDefs';
import { AspectKind } from './aspectDefs';
import { type DispositorChain, type FinalDispositors, getFinalDispositorsOfChain } from './rulershipGraph.ts'
import {
	zodiacSymbols,
	zodiacShortNames,
	nodeSymbols,
	nodePreferredName,
	nodeShortName,
	elementSymbols,
	modeSymbols,
	nodesWithRedundantSymbols,
	nodesAdmittingArticle,
	aspectKindColors,
	aspectSymbols,
	nodesWithoutSymbol,
} from './astroGraphics';
import { useSettingsStore } from './settingsStore';

// Default sizes - can be overridden via optional params
const DEFAULT_TEXT_SIZE = 12;
const DEFAULT_TITLE_SIZE = 14;
const DEFAULT_SYMBOL_SIZE = 20;

interface TextRenderOptions {
	fontSize?: number;
	fontStyle?: string;
}

interface SymbolRenderOptions {
	size?: number;
}

export const renderSmallcapsString = (
	str: string,
	options: TextRenderOptions = {}
): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	// TODO for a really long time this used font-bold. still unsure.
	return (
		<span className="small-caps" style={{ fontSize }}>
			{str}
		</span>
	);
};

export const renderString = (
	str: string,
	options: TextRenderOptions = {}
): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE, fontStyle = "normal" } = options;
	return (
		<span style={{ fontSize, fontStyle }}>
			{str}
		</span>
	);
};

export const renderTitle = (
	str: string,
	options: TextRenderOptions = {}
): ReactNode => {
	const { fontSize = DEFAULT_TITLE_SIZE } = options;
	return (
		<span className="small-caps font-bold tracking-wide" style={{ fontSize }}>
			{str}
		</span>
	);
};

interface RenderNodeOptions {
	showLabel?: boolean;
	withArticle?: boolean;
	preferText?: boolean; // force text for special nodes like Asc, etc.
	abbreviated?: boolean;
	shortenArabics?: boolean;
	size?: number;
	fontSize?: number;
}

// Helper to determine if "the" should be prepended to a node name
const shouldUseArticle = (node: Node, withArticle: boolean): boolean => {
	if (!withArticle || !nodesAdmittingArticle.includes(node)) {
		return false;
	}
	if (mainAngles.includes(node)) {
		return useSettingsStore.getState().useArticleForMainAngles;
	}
	return true;
};

export const renderNode = (
	node: Node,
	options: RenderNodeOptions = {}
): ReactNode => {
	const {
		showLabel,
		withArticle = false,
		preferText = false,
		forceText = false,
		abbreviated = false,
		shortenArabics = false,
		size = DEFAULT_SYMBOL_SIZE,
		fontSize = DEFAULT_TEXT_SIZE
	} = options;
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showNodeLabels;
	if (resolvedShowLabel || (preferText && nodesWithRedundantSymbols.includes(node)) || nodesWithoutSymbol.includes(node)) {
		const label = abbreviated
			? (nodeShortName[node] || node)
			: (nodePreferredName[node] || node);
		if (shouldUseArticle(node, withArticle)) {
			return <>{renderString("the ", { fontSize })}{renderSmallcapsString(String(label), { fontSize })}</>;
		}
		if (shortenArabics && arabicParts.includes(node)) {
			if (abbreviated) throw new Error("renderNode was called with an arabic part, with both abbreviated and shortenArabics set to true");
			return renderSmallcapsString(String(label.slice(5, label.length)), { fontSize });
		}
		return renderSmallcapsString(String(label), { fontSize });
	}
	return (
		<img
			src={nodeSymbols[node]}
			alt={node}
			width={size}
			height={size}
			className="icon-filter align-middle inline"
		/>
	);
};

interface RenderAspectKindOptions {
	showLabel?: boolean;
	withArticle?: boolean; //"a conjunction / an opposition"
	colorcode?: boolean;
	size?: number;
	fontSize?: number;
}

export const renderAspectKind = (
	aspectKind: AspectKind,
	options: RenderAspectKindOptions = {}
): ReactNode => {
	const {
		showLabel,
		withArticle = false,
		colorcode,
		size = DEFAULT_SYMBOL_SIZE,
		fontSize = DEFAULT_TEXT_SIZE,
	} = options;
	
	if (withArticle) {
		throw new Error("Articles in renderAspectKind are not yet implemented");
	}
	
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showAspectLabels;
	const resolvedColorcode = colorcode ?? useSettingsStore.getState().aspectsColorcoded;
	
	const aspectColorcoded = resolvedColorcode && (aspectKind in aspectKindColors);
	const [r,g,b] = aspectColorcoded ? aspectKindColors[aspectKind]! : [-1,-1,-1];
	
	return resolvedShowLabel ? (
		<label
			className="text-xs whitespace-nowrap font-bold small-caps"
			style={{fontSize, color: aspectColorcoded ? `rgb(${r}, ${g}, ${b})` : "var(--color-text)"}}
		>
			{aspectKind}
		</label>
	) : (
		aspectColorcoded ? (
			<div
				style={{
					WebkitMaskImage: `url(${aspectSymbols[aspectKind]})`,
					maskImage: `url(${aspectSymbols[aspectKind]})`,
					WebkitMaskRepeat: "no-repeat",
					maskRepeat: "no-repeat",
					WebkitMaskSize: "contain",
					maskSize: "contain",
					width: size,
					height: size,
					backgroundColor: `rgb(${r}, ${g}, ${b})`,
				}}
			/>
		) : (
			<img
				className="icon-filter"
				src={aspectSymbols[aspectKind]}
				alt={aspectKind}
				width={size}
				height={size}
			/>
		)
	);
};
	
export const renderCommaSeparatedNodeList = (
	nodes: Node[],
	showLabels?: boolean,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const resolvedShowLabels = showLabels ?? useSettingsStore.getState().showNodeLabels;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	return (
		<>
			{nodes.map((node, i) => (
				<span key={i}>
					{i > 0 && renderString(", ")}
					{renderNode(node, { showLabel: resolvedShowLabels, size, fontSize })}
				</span>
			))}
		</>
	);
}

export const renderSign = (
	sign: Zodiac,
	showLabel?: boolean,
	options: SymbolRenderOptions & TextRenderOptions & { abbreviated?: boolean } = {}
): ReactNode => {
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showSymbolLabels;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE, abbreviated = false } = options;
	if (resolvedShowLabel) {
		const label = abbreviated ? zodiacShortNames[sign] : sign;
		return renderSmallcapsString(label, { fontSize });
	}
	return (
		<img
			src={zodiacSymbols[sign]}
			alt={sign}
			width={size}
			height={size}
			className="icon-filter align-middle inline"
		/>
	);
};

export const renderElement = (
	elem: Element,
	showLabel?: boolean,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showElementLabels;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	if (resolvedShowLabel) {
		return renderSmallcapsString(elem, { fontSize });
	}
	return (
		<img
			src={elementSymbols[elem]}
			alt={elem}
			width={size}
			height={size}
			className="icon-filter align-middle inline"
		/>
	);
};

export const renderMode = (
	mode: Mode,
	showLabel?: boolean,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showModeLabels;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	if (resolvedShowLabel) {
		return renderSmallcapsString(mode, { fontSize });
	}
	return (
		<img
			src={modeSymbols[mode]}
			alt={mode}
			width={size}
			height={size}
			className="icon-filter align-middle inline"
		/>
	);
};

export const renderArrow = (options: TextRenderOptions = {}): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	return <span className="mx-1" style={{ fontSize }}>{" \u2192 "}</span>;
};

export const renderMutualArrow = (options: TextRenderOptions = {}): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	return <span className="mx-1" style={{ fontSize }}>{" \u21C4 "}</span>;
};

export const renderHookedArrow = (options: TextRenderOptions = {}): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	return <span className="mx-1" style={{ fontSize }}>{" \u21A9 "}</span>;
};

export const renderDoubleArrow = (options: TextRenderOptions = {}): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	return <span className="mx-1" style={{ fontSize }}>{" ⇒ "}</span>;
};

// Renders a node with its sign in brackets, e.g. "Sun [Leo]"
// Useful for dispositorship chains
export const renderNodeWithSign = (
	node: Node,
	sign: Zodiac,
	showSign?: boolean,
	showNodeLabel?: boolean,
	showSignLabel?: boolean,
	key: number = 0,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const resolvedShowSign = showSign ?? useSettingsStore.getState().showSignsInDispositorChains;
	const resolvedShowNodeLabel = showNodeLabel ?? useSettingsStore.getState().showNodeLabels;
	const resolvedShowSignLabel = showSignLabel ?? useSettingsStore.getState().showSymbolLabels;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;

	if (!resolvedShowSign) {
		return renderNode(node, { showLabel: resolvedShowNodeLabel, size, fontSize });
	}

	const parenSize = resolvedShowSignLabel ? fontSize : fontSize * 1.5;
	const parenOpacity = resolvedShowSignLabel ? 0.8 : 0.4;

	return (
		<span key={key} className="whitespace-nowrap">
			{renderNode(node, { showLabel: resolvedShowNodeLabel, size, fontSize })}
			<span style={{ fontSize: parenSize, opacity: parenOpacity }}> [</span>
			{renderSign(sign, resolvedShowSignLabel, { size, fontSize })}
			<span style={{ fontSize: parenSize, opacity: parenOpacity }}>]</span>
		</span>
	);
};

export const renderUnwrappableDispositorChainSegment = (
	node: Node,
	sign: Zodiac,
	useDoubleArrow: boolean,
	showSigns?: boolean,
	showNodeLabels?: boolean,
	showSignLabels?: boolean,
	key: number = 0,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	return (
		<span key={key}>
			<></> {/* need an element we can linebreak on (for some reason zwsp doesn't work) */}
			<span className="whitespace-nowrap">
				{useDoubleArrow ? renderDoubleArrow({ fontSize }) : renderArrow({ fontSize })}
				{renderNodeWithSign(node, sign, showSigns, showNodeLabels, showSignLabels, 0, { size, fontSize })}
			</span>
		</span>
	);
}

export const renderFinalDispositors = (
	fd: FinalDispositors,
	standalone: boolean,
	showSigns?: boolean,
	showNodeLabels?: boolean,
	showSignLabels?: boolean,
	key: number = 0,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const withText = standalone;
	const includeLeadingArrow = !standalone;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	var contents;
	if (fd.nodes.length === 1) {
		contents = (<span key={key} className="whitespace-nowrap">
			{includeLeadingArrow && renderArrow({ fontSize })}
			{renderNodeWithSign(fd.nodes[0], fd.signs[0], showSigns, showNodeLabels, showSignLabels, 0, { size, fontSize })}
			{!withText && renderHookedArrow({ fontSize })}
			{withText && renderString(" in domicile.", { fontSize })}
		</span>);
	} else if (fd.nodes.length === 2) {
		contents = (<span key={key} className="whitespace-nowrap">
			{includeLeadingArrow && renderArrow({ fontSize })}
			{renderNodeWithSign(fd.nodes[0], fd.signs[0], showSigns, showNodeLabels, showSignLabels, 0, { size, fontSize })}
			{renderMutualArrow({ fontSize })}
			{renderNodeWithSign(fd.nodes[1], fd.signs[1], showSigns, showNodeLabels, showSignLabels, 1, { size, fontSize })}
			{withText && renderString(" in reception.", { fontSize })}
		</span>);
	} else {
		contents = (<>
			<span key={key} className="whitespace-nowrap">
				{includeLeadingArrow && renderArrow({ fontSize })}
				{renderNodeWithSign(fd.nodes[0], fd.signs[0], showSigns, showNodeLabels, showSignLabels, 0, { size, fontSize })}
			</span>
			{Array.from({length: fd.nodes.length}).map((_, i) => {
				const node = fd.nodes[(i+1)%fd.nodes.length];
				const sign = fd.signs[(i+1)%fd.nodes.length];
				return renderUnwrappableDispositorChainSegment(node, sign, true, showSigns, showNodeLabels, showSignLabels, i, { size, fontSize });
			})}
		</>);
	}
	
	if (standalone) {
		return (
			<div key={key}>
				{contents}
			</div>
		);
	} else {
		return contents;
	}
};

export const renderDispositorChain = (
	chain: DispositorChain,
	includeFinalDispositors: boolean,
	showSigns?: boolean,
	showNodeLabels?: boolean,
	showSignLabels?: boolean,
	key: number = 0,
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	const stopAtIndex = chain.cycleStartIndex + (includeFinalDispositors ? 0 : 1);
	return (
		<div key={key}>
			{chain.nodes.slice(0, stopAtIndex).map((node, i) => (
				i === 0 ? (
					<span key={i}>
						{renderNodeWithSign(node, chain.signs[i], showSigns, showNodeLabels, showSignLabels, i, { size, fontSize })}
					</span>
				) : (
					renderUnwrappableDispositorChainSegment(node, chain.signs[i], false, showSigns, showNodeLabels, showSignLabels, i, { size, fontSize })
				)
			))}
			{includeFinalDispositors && renderFinalDispositors(
				getFinalDispositorsOfChain(chain),
				false,
				showSigns,
				showNodeLabels,
				showSignLabels,
				0,
				{ size, fontSize }
			)}
		</div>
	);
};

// Selector button primitive - for use in panels with selectable options
// Matches the style from CategorySelector.tsx
interface SelectorButtonProps {
	selected: boolean;
	disabled?: boolean;
	highlighted?: boolean;
	onClick: () => void;
	title?: string;
	children: ReactNode;
}

export const SelectorButton = ({
	selected,
	disabled = false,
	highlighted = false,
	onClick,
	title,
	children,
}: SelectorButtonProps): ReactNode => {
	const baseClasses = "bg-transparent border-1 px-1.5 py-1 text-theme-text cursor-pointer transition-all duration-200 flex items-center justify-center small-caps focus:outline-none";
	const hoverClasses = disabled ? "" : "hover:border-theme-border-light hover:bg-theme-text/5";
	const borderClass = selected ? "border-theme-text" : "border-theme-border";
	const disabledClasses = disabled ? "opacity-40" : "";
	const highlightedClasses = highlighted ? "border-3 border-double" : "";

	return (
		<button
			className={`${baseClasses} ${hoverClasses} ${borderClass} ${disabledClasses} ${highlightedClasses}`}
			onClick={disabled ? undefined : onClick}
			title={title}
		>
			{children}
		</button>
	);
};

export const NodeSelectorButton = ({
	item,
	selected,
	disabled = false,
	highlighted = false,
	onClick,
	options = {},
}: {
	item: Node;
	selected: boolean;
	disabled?: boolean;
	highlighted?: boolean;
	onClick: () => void;
	options?: RenderNodeOptions;
}): ReactNode => {
	return (
		<SelectorButton
			selected={selected}
			disabled={disabled}
			highlighted={highlighted}
			onClick={onClick}
			title={item}
		>
			<span className={`flex flex-col items-center ${disabled ? "cursor-not-allowed" : ""}`}>
				{renderNode(item, options)}
			</span>
		</SelectorButton>
	);
};

export const AspectKindSelectorButton = ({
	item,
	selected,
	disabled = false,
	highlighted = false,
	onClick,
	options = {},
}: {
	item: AspectKind;
	selected: boolean;
	disabled?: boolean;
	highlighted?: boolean;
	onClick: () => void;
	options?: RenderAspectKindOptions;
}): ReactNode => {
	return (
		<SelectorButton
			selected={selected}
			disabled={disabled}
			highlighted={highlighted}
			onClick={onClick}
			title={item}
		>
			<span className={`flex flex-col items-center ${disabled ? "cursor-not-allowed" : ""}`}>
				{renderAspectKind(item, options)}
			</span>
		</SelectorButton>
	);
};
