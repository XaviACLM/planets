import { type FC, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Node, Sect } from './astroDefs';
import { getChartSect, getChartRuler, getSignOfNode, getNodePositionWithinSign } from './chartAnalysis';
import { formatAngle } from './util';
import { renderString, renderNode, renderSign } from './renderPrimitives';
import { useSettingsStore } from './settingsStore';
import NodePositions from './nodePositions';
import ZodiacSignPositions from './zodiacSignPositions';

type ChartSummaryProps = {
	nodePositions: NodePositions;
	zodiacSignPositions: ZodiacSignPositions;
	setHighlightedNode: (node: Node) => void;
};

const ChartSummary: FC<ChartSummaryProps> = ({
	nodePositions,
	zodiacSignPositions,
	setHighlightedNode,
}) => {

	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);

	const dignityMode = useSettingsStore(s => s.dignityMode);

	const chartSect = useMemo(() => {
		return getChartSect(nodePositions);
	}, [nodePositions]);

	const chartRuler = useMemo(() => {
		return getChartRuler(nodePositions, zodiacSignPositions, dignityMode);
	}, [nodePositions, zodiacSignPositions, dignityMode]);

	// Refs for measuring node row widths
	const nodeRefs = useRef<Map<Node, HTMLDivElement | null>>(new Map());
	const [sortedNodes, setSortedNodes] = useState<Node[]>([Node.SUN, Node.MOON, Node.ASCENDANT]);
	const [measured, setMeasured] = useState(false);

	// Measure actual widths and sort after render
	useLayoutEffect(() => {
		const widths = new Map<Node, number>();
		const nodes = [Node.SUN, Node.MOON, Node.ASCENDANT];

		for (const node of nodes) {
			const el = nodeRefs.current.get(node);
			if (el) {
				widths.set(node, el.getBoundingClientRect().width);
			}
		}

		// Sort by width descending (widest first)
		const sorted = [...nodes].sort((a, b) => {
			const widthA = widths.get(a) ?? 0;
			const widthB = widths.get(b) ?? 0;
			return widthB - widthA;
		});

		setSortedNodes(sorted);
		setMeasured(true);
	}, [nodePositions, zodiacSignPositions, showNodeLabels, showSymbolLabels]);

	const renderClickableNode = (node: Node, showPosition: boolean = true, preferText: boolean = false) => {
		const sign = getSignOfNode(node, nodePositions, zodiacSignPositions);
		const positionInSign = getNodePositionWithinSign(node, nodePositions, zodiacSignPositions);
		const formattedPosition = formatAngle(positionInSign);

		return (
			<span
				className="cursor-pointer hover:opacity-70 whitespace-nowrap"
				onClick={(e) => { e.stopPropagation(); setHighlightedNode(node); }}
			>
				{renderNode(node, {showLabel: preferText ? true : undefined, withArticle: preferText})}
				{showPosition && (
					<>
						{renderString(" | ")}
						{renderSign(sign)}
						{renderString(" · ")}
						{renderString(formattedPosition)}
					</>
				)}
			</span>
		);
	};

	const isDiurnal = chartSect === Sect.DIURNAL;

	return (
		<div
			className="absolute top-4 left-4 text-theme-text text-sm whitespace-nowrap"
			style={{ visibility: measured ? 'visible' : 'hidden' }}
		>
			<div>
				{renderString((isDiurnal ? "Diurnal" : "Nocturnal") + " Chart")}
				{chartRuler && (
					<>
						{renderString(" · Ruled by ")}
						{renderClickableNode(chartRuler, false, true)}
					</>
				)}
			</div>
			{sortedNodes.map((node) => (
				<div
					key={node}
					ref={(el) => { nodeRefs.current.set(node, el); }}
					style={{ width: 'fit-content' }}
				>
					{renderClickableNode(node)}
				</div>
			))}
		</div>
	);
};

export default ChartSummary;
