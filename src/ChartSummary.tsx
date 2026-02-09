import { FC, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Node, Sect } from './astroDefs';
import { getChartSect, getChartRuler } from './astrologyUtil';
import { formatAngle } from './util';
import { renderString, renderNode, renderSign } from './renderPrimitives';
import { useSettingsStore } from './settingsStore';
import ZodiacPositions from './zodiacPositions';

type ChartSummaryProps = {
	zodiacPositions: ZodiacPositions;
	setHighlightedNode: (node: Node) => void;
};

const ChartSummary: FC<ChartSummaryProps> = ({
	zodiacPositions,
	setHighlightedNode,
}) => {

	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);

	const dignityMode = useSettingsStore(s => s.dignityMode);
	const hasSurfacePosition = zodiacPositions.hasSurfacePosition();

	const chartSect = useMemo(() => {
		if (!hasSurfacePosition) return null;
		return getChartSect(zodiacPositions);
	}, [zodiacPositions, hasSurfacePosition]);

	const chartRuler = useMemo(() => {
		return getChartRuler(zodiacPositions, dignityMode);
	}, [zodiacPositions, dignityMode]);

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
	}, [zodiacPositions, showNodeLabels, showSymbolLabels]);

	const renderClickableNode = (node: Node, showPosition: boolean = true, forceText: boolean = false) => {
		const sign = zodiacPositions.getSymbolOfNode(node);
		const positionInSign = zodiacPositions.getNodePositionWithinSign(node);
		const formattedPosition = formatAngle(positionInSign);

		return (
			<span
				className="cursor-pointer hover:opacity-70 whitespace-nowrap"
				onClick={(e) => { e.stopPropagation(); setHighlightedNode(node); }}
			>
				{renderNode(node, {showLabel: forceText ? true : undefined, withArticle: forceText})}
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

	// If no surface position, we can't show much
	if (!hasSurfacePosition) {
		return null;
	}

	const isDiurnal = chartSect === Sect.DIURNAL;

	return (
		<div
			className="absolute top-4 left-4 text-theme-text text-sm z-[100] whitespace-nowrap"
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
					ref={(el) => nodeRefs.current.set(node, el)}
					style={{ width: 'fit-content' }}
				>
					{renderClickableNode(node)}
				</div>
			))}
		</div>
	);
};

export default ChartSummary;
