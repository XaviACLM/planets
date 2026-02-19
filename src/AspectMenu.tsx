import { useState, useMemo } from 'react';
import { type Aspect, filterAspectsByNode } from './aspects.ts';
import { configurationAspectsKinds } from './aspectDefs.ts';
import { Node } from './astroDefs.ts';
import { nodeSymbols, nodeShortName, nodePreferredName, aspectKindColors, nodesWithoutSymbol } from './astroGraphics.ts'
import NodePositions from './nodePositions.ts'
import { useSettingsStore } from './settingsStore.ts'
import { renderNode, renderString, renderAspectKind } from './renderPrimitives.tsx'
import { formatAngle, normalizeAngleRad } from './util';

// Layout constants
const BINARY_ROW_H = 28;
const CONFIG_MINI_DIAGRAM_HEIGHT = 80;
const CONFIG_RECT_PADDING = 0;
const SUBASPECT_H = 24;
const ERROR_FONT_SIZE = 13;

// Compute the angle offset so ASC is on the left (pi radians)
function getOffset(nodePositions: NodePositions): number {
	return nodePositions.hasSurfacePosition()
		? Math.PI - nodePositions.get(Node.ASCENDANT)
		: -Math.PI / 12;
}

// Compute SVG path data for an aspect shape inside a circle
function aspectPathData(aspect: Aspect, nodeAngles: Map<Node, number>, circleR: number, cx: number, cy: number): string {
	const as: number[] = aspect.nodes
		.map(node => nodeAngles.get(node)!)
		.map(a => normalizeAngleRad(a));
	const xs = as.map(a => cx + circleR * Math.cos(a));
	const ys = as.map(a => cy - circleR * Math.sin(a));

	if (aspect.nodes.length === 2) {
		return `M ${xs[0]} ${ys[0]} L ${xs[1]} ${ys[1]}`;
	} else if (aspect.nodes.length === 3) {
		return `M ${xs[0]} ${ys[0]} L ${xs[1]} ${ys[1]} L ${xs[2]} ${ys[2]} Z`;
	} else if (aspect.nodes.length === 4) {
		return `M ${xs[0]} ${ys[0]} L ${xs[1]} ${ys[1]} L ${xs[2]} ${ys[2]} L ${xs[3]} ${ys[3]} Z`;
	} else if (aspect.nodes.length === 6) {
		return `M ${xs[0]} ${ys[0]} L ${xs[3]} ${ys[3]} M ${xs[1]} ${ys[1]} L ${xs[4]} ${ys[4]} M ${xs[2]} ${ys[2]} L ${xs[5]} ${ys[5]}`;
	}
	// fallback: draw lines between consecutive nodes
	return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ') + ' Z';
}

function DeleteButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			className="border-none bg-transparent cursor-pointer text-theme-text p-0 text-xs leading-none opacity-60 hover:opacity-100"
			onClick={(e) => { e.stopPropagation(); onClick(); }}
		>
			✕
		</button>
	);
}

function ErrorDisplay({ error }: { error: number | null }) {
	if (error === null) return null;
	return (
		<span className="opacity-60 whitespace-nowrap w-10 flex justify-center" style={{ fontSize: ERROR_FONT_SIZE }}>
			{"Δ"}{formatAngle(error)}
		</span>
	);
}

function BinaryAspectRow({
	aspect,
	onDelete,
	onHover,
	showNodeLabels,
	showAspectLabels,
}: {
	aspect: Aspect,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void,
	showNodeLabels: boolean,
	showAspectLabels: boolean,
}) {
	
	const nodeGap = showNodeLabels ? 8 : 12;

	const aspectKind = (
		<div className="flex-none flex items-center">
			{renderAspectKind(aspect.kind, { size: 16, fontSize: 11 })}
		</div>
	);

	const nodes = (
		<div className="flex items-center gap-0.5 whitespace-nowrap overflow-hidden">
			{renderNode(aspect.nodes[0], { size: 16, fontSize: 12, abbreviated: true })}
			<span className="opacity-100 text-[15px] mx-1">{"\u2013"}</span>
			{renderNode(aspect.nodes[1], { size: 16, fontSize: 12, abbreviated: true })}
		</div>
	);

	const tail = (
		<div className="flex items-center">
			<div className="flex justify-end mr-2">
				<ErrorDisplay error={aspect.error} />
			</div>
			<DeleteButton onClick={() => onDelete(aspect, null)} />
		</div>
	);

	if (!showAspectLabels && !showNodeLabels) {
		// Fixed spacing, no grow — row is inline-sized
		return (
			<div
				className="inline-flex items-center px-2 cursor-pointer hover:bg-theme-text/10 transition-colors duration-300"
				style={{ height: BINARY_ROW_H, gap: 8 }}
				onMouseEnter={() => onHover(aspect)}
				onMouseLeave={() => onHover(null)}
			>
				{aspectKind}
				{nodes}
				{tail}
			</div>
		);
	}

	if (showAspectLabels) {
		// Nodes on right, before error/delete
		return (
			<div
				className="flex items-center px-2 cursor-pointer hover:bg-theme-text/10 transition-colors duration-300"
				style={{ height: BINARY_ROW_H }}
				onMouseEnter={() => onHover(aspect)}
				onMouseLeave={() => onHover(null)}
			>
				{aspectKind}
				<div className="grow" />
				<div style={{ marginRight: nodeGap }}>{nodes}</div>
				{tail}
			</div>
		);
	}

	// !showAspectLabels && showNodeLabels — nodes on left, after aspect kind
	return (
		<div
			className="flex items-center px-2 cursor-pointer hover:bg-theme-text/10 transition-colors duration-300"
			style={{ height: BINARY_ROW_H }}
			onMouseEnter={() => onHover(aspect)}
			onMouseLeave={() => onHover(null)}
		>
			{aspectKind}
			<div style={{ marginLeft: 8 }}>{nodes}</div>
			<div className="grow" />
			{tail}
		</div>
	);
}

function MiniAspectDiagram({
	aspect,
	nodePositions,
	offset,
	showNodeLabels,
	highlightedNodes,
}: {
	aspect: Aspect,
	nodePositions: NodePositions,
	offset: number,
	showNodeLabels: boolean,
	highlightedNodes: Node[] | null,
}) {
	const cx = 50;
	const cy = 50;
	const r = 50;
	const labelOffset = 25; // gap between circle edge and label anchor

	// Compute label positions
	const labelSpacing = showNodeLabels ? 25 : 25;
	const labelFontSize = 15;
	const symbolSz = 20;
	
	const aspectsColorcoded = useSettingsStore(s => s.aspectsColorcoded);

	// Compute angles and positions for each node
	const nodeData = useMemo(() => {
		return aspect.nodes.map(node => {
			const rawAngle = nodePositions.get(node) + offset;
			const angle = normalizeAngleRad(rawAngle);
			const px = cx + r * Math.cos(angle);
			const py = cy - r * Math.sin(angle);
			// Left side if cos < 0 (node is on the left of the circle)
			const isLeft = Math.cos(angle) < 0;
			return { node, angle, px, py, isLeft };
		});
	}, [aspect, nodePositions, offset]);

	// Prepare node angles map for path computation
	const nodeAngles = useMemo(() => {
		const m = new Map<Node, number>();
		aspect.nodes.forEach(node => {
			m.set(node, normalizeAngleRad(nodePositions.get(node) + offset));
		});
		return m;
	}, [aspect, nodePositions, offset]);

	// Sort nodes into left and right sides, sorted by y position (top to bottom)
	const leftNodes = useMemo(() =>
		nodeData.filter(d => d.isLeft).sort((a, b) => a.py - b.py),
		[nodeData]
	);
	const rightNodes = useMemo(() =>
		nodeData.filter(d => !d.isLeft).sort((a, b) => a.py - b.py),
		[nodeData]
	);

	const aspectColor = (aspectsColorcoded && aspect.kind in aspectKindColors)
		? `rgb(${aspectKindColors[aspect.kind]!.join(',')})`
		: 'var(--color-text)';

	const path = aspectPathData(aspect, nodeAngles, r, cx, cy);


	const computeLabelPositions = (nodes: typeof leftNodes, side: 'left' | 'right') => {
		const anchorX = side === 'left' ? cx - r - labelOffset : cx + r + labelOffset;
		const totalHeight = (nodes.length - 1) * labelSpacing;
		const startY = cy - totalHeight / 2;
		return nodes.map((d, i) => ({
			...d,
			labelX: anchorX,
			labelY: startY + i * labelSpacing,
		}));
	};

	const leftLabels = computeLabelPositions(leftNodes, 'left');
	const rightLabels = computeLabelPositions(rightNodes, 'right');
	const allLabels = [...leftLabels, ...rightLabels];

	return (
		<svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: CONFIG_MINI_DIAGRAM_HEIGHT }}>
			{/* Hatched circle background */}
			<defs>
				<pattern id={"hatch"}
					width="7" height="7"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45)"
				>
					<rect width="2" height="2" fill="var(--color-text)" opacity="1" />
				</pattern>
			</defs>
			<circle cx={cx} cy={cy} r={r}
				fill={`url(#hatch)`}
				stroke="var(--color-text)"
				strokeWidth={1}
				opacity={0.2}
			/>

			{/* Aspect shape */}
			<path
				d={path}
				fill="none"
				stroke={aspectColor}
				strokeWidth={2}
				opacity={0.5}
			/>

			{/* Highlighted subaspect shape */}
			{highlightedNodes && highlightedNodes.every(n => aspect.nodes.includes(n)) && (() => {
				const highlightAspect = { nodes: highlightedNodes, kind: aspect.kind } as Aspect;
				const highlightPath = aspectPathData(highlightAspect, nodeAngles, r, cx, cy);
				return (
					<path
						d={highlightPath}
						fill="none"
						stroke={aspectColor}
						strokeWidth={4}
						opacity={0.5}
					/>
				);
			})()}

			{/* Node dots on circle */}
			{nodeData.map((d, i) => (
				<circle key={i} cx={d.px} cy={d.py} r={1.5}
					fill={aspectColor}
				/>
			))}

			{/* Connecting lines from circle points to labels */}
			{allLabels.map((d, i) => {
				const isLeft = d.isLeft;
				// Quadratic bezier from circle point to label
				const ctrlX = isLeft ? d.px - 6 : d.px + 6;
				return (
					<path key={i}
						d={`M ${d.px} ${d.py} Q ${ctrlX} ${d.py} ${d.labelX + (isLeft ? 3 : -3)} ${d.labelY}`}
						d={`M ${d.px} ${d.py} ${0.7*(isLeft ? 0 : 100) + 0.3*d.px} ${d.py} ${isLeft ? -15 : 115} ${d.labelY} ${d.labelX + (isLeft ? 3 : -3)} ${d.labelY}`}
						fill="none"
						stroke="var(--color-text)"
						strokeWidth={1}
						opacity={0.5}
					/>
				);
			})}

			{/* Labels */}
			{allLabels.map((d, i) => {
				const isLeft = d.isLeft;
				if (showNodeLabels || nodesWithoutSymbol.includes(d.node)) {
					const label = (nodeShortName[d.node] ?? nodePreferredName[d.node] ?? d.node) as string;
					return (
						<text key={i}
							x={d.labelX}
							y={d.labelY}
							textAnchor={isLeft ? 'end' : 'start'}
							dominantBaseline="central"
							fill="var(--color-text)"
							fontSize={labelFontSize}
							fontVariant="small-caps"
						>
							{label}
						</text>
					);
				} else {
					return (
						<image key={i}
							href={nodeSymbols[d.node]}
							x={d.labelX - (isLeft ? symbolSz : 0)}
							y={d.labelY - symbolSz / 2}
							width={symbolSz}
							height={symbolSz}
							style={{ filter: "var(--icon-filter)" }}
						/>
					);
				}
			})}
		</svg>
	);
}

function ConfigurationCard({
	aspect,
	subaspects,
	nodePositions,
	offset,
	onDelete,
	onHover,
	showNodeLabels,
}: {
	aspect: Aspect,
	subaspects: Aspect[],
	nodePositions: NodePositions,
	offset: number,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void,
	showNodeLabels: boolean,
}) {
	const [highlightedNodes, setHighlightedNodes] = useState<Node[] | null>(null);

	return (
		<div
			className="border-theme-border my-1 mx-1 hover:bg-theme-text/5"
			style={{ borderRadius: 'var(--border-radius)' }}
			onMouseEnter={() => onHover(aspect)}
			onMouseLeave={() => { onHover(null); setHighlightedNodes(null); }}
		>
			{/* Header */}
			<div className="flex items-center px-2 py-0">
				<div className="shrink-0 mr-2 flex items-center">
					{renderAspectKind(aspect.kind, { size: 16, fontSize: 12 })}
				</div>
				<div className="grow text-right mr-2">
					<ErrorDisplay error={aspect.error} />
				</div>
				<DeleteButton onClick={() => onDelete(aspect, null)} />
			</div>

			{/* Mini diagram */}
			<div style={{ padding: `0 ${CONFIG_RECT_PADDING}px` }}>
				<MiniAspectDiagram
					aspect={aspect}
					nodePositions={nodePositions}
					offset={offset}
					showNodeLabels={showNodeLabels}
					highlightedNodes={highlightedNodes}
				/>
			</div>

			{/* Subaspects */}
			{subaspects.length > 0 && (
				<div className="flex flex-wrap justify-center gap-x-1 gap-y-0 mx-4 border-x border-theme-border/50">
					{subaspects.map((sub, i) => (
						<div
							key={i}
							className="flex items-center gap-1 px-1 cursor-pointer hover:bg-theme-text/10 transition-colors duration-300"
							style={{ height: SUBASPECT_H }}
							onMouseEnter={(e) => { e.stopPropagation(); onHover(sub); setHighlightedNodes(sub.nodes); }}
							onMouseLeave={(e) => { e.stopPropagation(); onHover(aspect); setHighlightedNodes(null); }}
						>
							<div className="shrink-0 flex items-center">
								{renderAspectKind(sub.kind, { size: 14, fontSize: 11 })}
							</div>
							<ErrorDisplay error={sub.error} />
							<DeleteButton onClick={() => onDelete(sub, aspect)} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function AspectMenu({ aspects, nodePositions, onDelete, onHover, highlightedNode, clearHighlight }: {
	aspects: Map<Aspect, Aspect[]>,
	nodePositions: NodePositions,
	onDelete: (aspect: Aspect, parentAspect: Aspect | null) => void,
	onHover: (aspect: Aspect | null) => void,
	highlightedNode: Node | null,
	clearHighlight: () => void
}) {
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showAspectLabels = useSettingsStore(s => s.showAspectLabels);
	useSettingsStore(s => s.aspectsColorcoded);

	const compactBinaries = !showNodeLabels && !showAspectLabels;

	const offset = useMemo(() => getOffset(nodePositions), [nodePositions]);

	const { displayedConfigurations, displayedBinaryAspects, noAspects } = useMemo(() => {
		const displayedAspects = highlightedNode === null ? aspects : filterAspectsByNode(aspects, highlightedNode);
        const entries = Array.from(displayedAspects.entries());
		const displayedConfigurations = entries.filter(([aspect, _]) => configurationAspectsKinds.includes(aspect.kind));
		const displayedBinaryAspects = entries.filter(([aspect, _]) => !configurationAspectsKinds.includes(aspect.kind));
		const noAspects = displayedConfigurations.length === 0 && displayedBinaryAspects.length === 0;
		return { displayedConfigurations, displayedBinaryAspects, noAspects };
	}, [aspects, highlightedNode]);

	return (
		<div
			className="p-2 overflow-y-auto bg-theme-bg text-theme-text scrollbar-none"
			onMouseLeave={(e) => { e.stopPropagation(); onHover(null); }}
		>
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
			{displayedConfigurations.map(([aspect, subaspects], index) => (
				<div key={index}>
					<ConfigurationCard
						key={index}
						aspect={aspect}
						subaspects={subaspects}
						nodePositions={nodePositions}
						offset={offset}
						onDelete={onDelete}
						onHover={onHover}
						showNodeLabels={showNodeLabels}
					/>
					<hr className="opacity-50 pb-5 translate-y-2 mx-2"/>
				</div>
			))}
			{compactBinaries ? (
				<div className="flex flex-wrap justify-center gap-x-1 gap-y-0">
					{displayedBinaryAspects.map(([aspect, _], index) => (
						<BinaryAspectRow
							key={index}
							aspect={aspect}
							onDelete={onDelete}
							onHover={onHover}
							showNodeLabels={showNodeLabels}
							showAspectLabels={showAspectLabels}
						/>				
					))}
				</div>
			) : (
				displayedBinaryAspects.map(([aspect, _], index) => (
					<BinaryAspectRow
						key={index}
						aspect={aspect}
						onDelete={onDelete}
						onHover={onHover}
						showNodeLabels={showNodeLabels}
						showAspectLabels={showAspectLabels}
					/>
				))
			)}
			{noAspects && (renderString("No aspects.", { fontStyle: "italic" }))}
		</div>
	);
}

export default AspectMenu;
