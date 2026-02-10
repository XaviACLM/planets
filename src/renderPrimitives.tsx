import { ReactNode } from 'react';
import { Node, Zodiac, Mode, Element, mainAngles } from './astroDefs';
import { type DispositorChain, type FinalDispositors, getFinalDispositorsOfChain } from './rulershipGraph.ts'
import { zodiacSymbols, nodeSymbols, nodePreferredName, elementSymbols, modeSymbols, nodesWithRedundantSymbols, nodesAdmittingArticle } from './astroGraphics';
import { useSettingsStore } from './settingsStore';

// Default sizes - can be overridden via optional params
const DEFAULT_TEXT_SIZE = 12;
const DEFAULT_TITLE_SIZE = 14;
const DEFAULT_SYMBOL_SIZE = 20;

interface TextRenderOptions {
	fontSize?: number;
}

interface SymbolRenderOptions {
	size?: number;
}

export const renderSmallcapsString = (
	str: string,
	options: TextRenderOptions = {}
): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	return (
		<span className="small-caps font-bold" style={{ fontSize }}>
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
	forceText?: boolean; // force text for special nodes like Asc, etc.
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
		forceText = false,
		size = DEFAULT_SYMBOL_SIZE,
		fontSize = DEFAULT_TEXT_SIZE
	} = options;
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showNodeLabels;
	if (resolvedShowLabel || (forceText && nodesWithRedundantSymbols.includes(node))) {
		const label = nodePreferredName[node] || node;
		if (shouldUseArticle(node, withArticle)) {
			return <>{renderString("the ", { fontSize })}{renderSmallcapsString(String(label), { fontSize })}</>;
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
	options: SymbolRenderOptions & TextRenderOptions = {}
): ReactNode => {
	const resolvedShowLabel = showLabel ?? useSettingsStore.getState().showSymbolLabels;
	const { size = DEFAULT_SYMBOL_SIZE, fontSize = DEFAULT_TEXT_SIZE } = options;
	if (resolvedShowLabel) {
		return renderSmallcapsString(sign, { fontSize });
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
	return <span className="mx-1" style={{ fontSize }}>{" \u21A9 "}</span>;s
};

export const renderDoubleArrow = (options: TextRenderOptions = {}): ReactNode => {
	const { fontSize = DEFAULT_TEXT_SIZE } = options;
	return <span className="mx-1" style={{ fontSize }}>{" ⇒ "}</span>;s
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

// Convenience wrapper for rendering a selector button with a node icon/label
export const NodeSelectorButton = ({
	node,
	showLabel,
	selected,
	disabled = false,
	highlighted = false,
	onClick,
}: {
	node: Node;
	showLabel: boolean;
	selected: boolean;
	disabled?: boolean;
	highlighted?: boolean;
	onClick: () => void;
}): ReactNode => {
	return (
		<SelectorButton
			selected={selected}
			disabled={disabled}
			highlighted={highlighted}
			onClick={onClick}
			title={node}
		>
			<span className={`flex flex-col items-center ${disabled ? "cursor-not-allowed" : ""}`}>
				{showLabel ? (
					<span className="text-xs font-medium whitespace-nowrap">
						{nodePreferredName[node] || node}
					</span>
				) : (
					<img
						src={nodeSymbols[node]}
						alt={node}
						className="w-5 h-5 object-contain icon-filter"
					/>
				)}
			</span>
		</SelectorButton>
	);
};
