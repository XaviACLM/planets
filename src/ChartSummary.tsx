import { FC, useMemo } from 'react';
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

	const renderClickableNode = (node: Node, showPosition: boolean = true, forceText: boolean = false) => {
		const sign = zodiacPositions.getSymbolOfNode(node);
		const positionInSign = zodiacPositions.getNodePositionWithinSign(node);
		const formattedPosition = formatAngle(positionInSign);
		
		console.log(forceText);
		
		return (
			<span
				className="cursor-pointer hover:opacity-70 whitespace-nowrap"
				onClick={(e) => { e.stopPropagation(); setHighlightedNode(node); }}
			>
				{renderNode(node, {showLabel: forceText, withArticle: forceText})}
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
	
	const nodeReprLength = (node: Node) => {
		return (
			(showNodeLabels ? node.length : 0)
			+ (showSymbolLabels ? zodiacPositions.getSymbolOfNode(node).length : 0)
		);
	}
	const nodes = [Node.SUN, Node.MOON, Node.ASCENDANT].sort((n1, n2) => nodeReprLength(n2)-nodeReprLength(n1));
	

	return (
		<div className="absolute top-4 left-4 text-theme-text text-sm z-[100] whitespace-nowrap">
			<div>
			<>
				{renderString((isDiurnal ? "Diurnal" : "Nocturnal") + " Chart")}
			</>
			{chartRuler && (
				<>
					{renderString(" · Ruled by ")}
					{renderClickableNode(chartRuler, false, true)}
				</>
			)}
			</div>
			{nodes.map((node, i) => (
				<div key={i}>
					{renderClickableNode(node)}
				</div>
			))}
		</div>
	);
};

export default ChartSummary;
