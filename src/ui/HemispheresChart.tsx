import { useMemo, type FC, type ReactNode } from 'react';
import { Node, standardNodes, NodeType, nodeTypes, mainAngles } from '../defs/astroDefs';
import { nodeSymbols, nodeShortName, nodePreferredName, nodesWithoutSymbol } from '../defs/astroGraphics.ts';
import NodePositions from '../model/nodePositions.ts'
import { isNodeAboveHorizon, isNodeEastern } from '../model/chartAnalysis.ts'
import { useSettingsStore } from '../settings/settingsStore.ts'
import { NodesToConsider } from '../defs/settingsDefs.ts'
import { renderString, svgHatchDefs } from './renderPrimitives.tsx'

type HemispheresChartProps = {
	nodePositions: NodePositions,
}

function capitalize(sentence: string): string {
	return String(sentence).charAt(0).toUpperCase() + String(sentence).slice(1);
}

function createEmphasisString(verticalDiff: number, horizontalDiff: number, nNodes: number) {
	// vertical diff is above - below, horizontal diff is east - west
	
	const verticalOrientation = verticalDiff === 0 ? 0 : verticalDiff > 0 ? 1 : -1;
	const horizontalOrientation = horizontalDiff === 0 ? 0 : horizontalDiff > 0 ? 1 : -1;
	const verticalDiffAbs = verticalOrientation > 0 ? verticalDiff : -verticalDiff;
	const horizontalDiffAbs = horizontalOrientation > 0 ? horizontalDiff : -horizontalDiff;
	
	// translating the old parameters from 10 to n. in terms of diffAbs/total
	// starts at nth. slight from 0.2. normal from 0.4. strong from 0.6
	const strengthsPerRelDiff = (diffRel: number) => {
		if (diffRel >= 0.6) { return 3; }
		else if (diffRel >= 0.4) { return 2; }
		else if (diffRel >= 0.2) { return 1; }
		else { return 0; }
	};
	const verticalStrength = strengthsPerRelDiff(verticalDiffAbs/nNodes);
	const horizontalStrength = strengthsPerRelDiff(horizontalDiffAbs/nNodes);
	
	const strengthModifiers: (string|null)[] = [null, "slight ", "", "strong "];
	const strengthModifiersAdj: (string|null)[] = [null, "slighty ", "", "strongly "];
	const verticalModifier = strengthModifiers[verticalStrength];
	const horizontalModifier = strengthModifiers[horizontalStrength];
	const horizontalModifierAdj = strengthModifiersAdj[horizontalStrength];
	
	//painful logic to try to make things stay within 1 lines
	const horizontalStringUsesModifier = horizontalStrength === 1 || horizontalStrength === 3;
	const verticalStringUsesModifier = verticalStrength === 1 || verticalStrength === 3;
	const verticalStringLongish = verticalStrength !== 2;
	const specialCaseTheElision = horizontalStrength === 0 && verticalStringUsesModifier;
	
	if (verticalStrength === horizontalStrength) {
		if (verticalStrength === 0) { // null - null case
			return "No east/west or above/below horizon emphasis.";
		} else {
			return capitalize(`${verticalModifier}emphasis ${horizontalOrientation === 1 ? 'west' : 'east'} & ${verticalOrientation === 1 ? 'above' : 'below'} the horizon.`);
		}
	} else {
		const verticalString = verticalStrength === 0 ? (
			horizontalStringUsesModifier ? (
				'No emphasis above/below horizon'
			) : (
				'No emphasis above/below the horizon'
			)
		) : (
			specialCaseTheElision ? (
				`${verticalModifier}emphasis ${verticalOrientation === 1 ? 'above' : 'below'} horizon`
			) : (
				`${verticalModifier}emphasis ${verticalOrientation === 1 ? 'above' : 'below'} the horizon`
			)
		); 
		const horizontalString = horizontalStrength === 0 ? (
			'No east/west emphasis'
		) : (
			verticalStringLongish ? (
				`${horizontalModifierAdj}${horizontalOrientation === 1? 'western' : 'eastern'}`
			) : (
				`${horizontalModifier}${horizontalOrientation === 1? 'western' : 'eastern'} emphasis`
			)
		);
		if (verticalStrength>horizontalStrength) { // vertical goes first
			return capitalize(`${verticalString}${horizontalStrength === 0 ? '.' : ','} ${horizontalString}.`);
		} else { // horizontal goes first
			return capitalize(`${horizontalString}${verticalStrength === 0 ? '.' : ','} ${verticalString}.`);
		}
	}
}

function generateNodesPerRow(nNodes: number): number[]{
	if (nNodes <= 12){
		return [[], [1], [2], [3], [2, 2], [3, 2], [3, 3], [2, 3, 2], [3, 2, 3], [3, 3, 3], [3, 4, 3], [4, 3, 4], [4, 4, 4]][nNodes];
	}
	const numRows = Math.floor(nNodes/4)
	const nodesPerRow = Array.from({length: numRows}, () => 4);
	nodesPerRow.push(nNodes - 4*numRows);
	return nodesPerRow;
}

const HemispheresChart: FC<HemispheresChartProps> = ({
	nodePositions,
}) => {
	const showNodeLabelsSetting = useSettingsStore(s => s.showNodeLabels);
	const whichNodes = useSettingsStore(s => s.nodesInHemispheresChart);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	
	const nodesInConsideration = useMemo(() => {
		if (whichNodes === NodesToConsider.STANDARD) {
			return standardNodes;
		} else if (whichNodes === NodesToConsider.ALL) {
			return Array.from(selectedNodes)
				.filter(node => !mainAngles.includes(node));
		} else {
			return Array.from(selectedNodes)
				.filter(node => nodeTypes[node] === NodeType.BODY || (hamburgPhysical && nodeTypes[node] === NodeType.HYPOTHETICAL))
				.filter(node => !mainAngles.includes(node));
		}
	}, [whichNodes, selectedNodes, hamburgPhysical])
	
	const {nodesAboveEast, nodesAboveWest, nodesBelowEast, nodesBelowWest, verticalDiff, horizontalDiff} = useMemo(() => {
		const nodesAboveEast: Node[] = [];
		const nodesAboveWest: Node[] = [];
		const nodesBelowEast: Node[] = [];
		const nodesBelowWest: Node[] = [];
	
		for (const node of nodesInConsideration){
			if (isNodeAboveHorizon(node, nodePositions)) {
				if (isNodeEastern(node, nodePositions)) {
					nodesAboveEast.push(node);
				} else {
					nodesAboveWest.push(node);
				}
			} else {
				if (isNodeEastern(node, nodePositions)) {
					nodesBelowEast.push(node);
				} else {
					nodesBelowWest.push(node);
				}
			}
		}
		
		const verticalDiff: number = (nodesAboveEast.length + nodesAboveWest.length) - (nodesBelowEast.length + nodesBelowWest.length);
		const horizontalDiff: number = (nodesAboveEast.length + nodesBelowEast.length) - (nodesAboveWest.length + nodesBelowWest.length);

		return {nodesAboveEast, nodesAboveWest, nodesBelowEast, nodesBelowWest, verticalDiff, horizontalDiff};
	}, [nodePositions, nodesInConsideration]);
	
	const symbolSize = 20;
	const nodeSpacing = 27;
	const textInListSpacing = 18;
	const textSize = 12;
	const strokeWidth = 1;

	const svgTextProps = {
		fill: "var(--color-text)",
		fontSize: textSize,
		fontVariant: "small-caps",
	} as const;
	
	const allNodesHaveSymbols = nodesInConsideration.every(node => !nodesWithoutSymbol.includes(node));
	const showNodeLabels = showNodeLabelsSetting || !allNodesHaveSymbols;
	
	const renderNodeGroupSVG = (nodes: Node[], width: number): ReactNode => {
		if (showNodeLabels) {
			const nNodes = nodes.length;
			if (nNodes <= 5) {
				const b = 0.14*width;
				return nodes.map((node, i) => {
					const rowOffset = i - (nNodes-1)/2;
					const label = nodePreferredName[node] ?? node;
					return (
						<text
							key={i}
							{...svgTextProps}
							textAnchor="middle"
							textLength={label.length > b ? width*0.95 : undefined}
							fontSize={label.length > b ? 2+textSize*b/label.length : textSize}
							transform={`translate(0,${textInListSpacing*rowOffset+textSize/3})`}
						>
							{label}
						</text>
					);
				});
			} else {
				const b = 0.06*width;
				const nLeft = Math.floor(nNodes/2);
				const nRight = Math.ceil(nNodes/2);
				return (
					<>
						{Array.from({length:nLeft}, (_, i) => {
							const node = nodes[i];
							const rowOffset = i - (nLeft-1)/2;
							const label = nodeShortName[node] ?? nodePreferredName[node] ?? node;
							return (
								<text
									key={i}
									{...svgTextProps}
									textAnchor="end"
									textLength={label.length > b ? width*0.45 : undefined}
									fontSize={label.length > b ? 2+textSize*b/label.length : textSize}
									transform={`translate(${-textInListSpacing/4},${textInListSpacing*rowOffset+textSize/3})`}
								>
									{label}
								</text>
							);
						})}
						{Array.from({length:nRight}, (_, i) => {
							const node = nodes[i+nLeft];
							const rowOffset = i - (nRight-1)/2;
							const label = nodeShortName[node] ?? nodePreferredName[node] ?? node;
							return (
								<text
									key={i+nLeft}
									{...svgTextProps}
									textAnchor="start"
									textLength={label.length > b ? width*0.45 : undefined}
									fontSize={label.length > b ? 2+textSize*b/label.length : textSize}
									transform={`translate(${textInListSpacing/4},${textInListSpacing*rowOffset+textSize/3})`}
								>
									{label}
								</text>
							);
						})}
					</>
				);
			}
		} else {
			const nodesPerRow: number[] = generateNodesPerRow(nodes.length);
			const nRows = nodesPerRow.length;
			const rowPerIdx = nodesPerRow.flatMap((count, index) => Array(count).fill(index));
			const colPerIdx = nodesPerRow.flatMap((count, _) => Array.from(Array(count).keys()));
			return nodes.map((node, i) => {
				const rowOffset = rowPerIdx[i] - (nRows-1)/2;
				const colOffset = colPerIdx[i] - (nodesPerRow[rowPerIdx[i]]-1)/2;
				return (
					<image
						key={i}
						href={nodeSymbols[node]}
						width={symbolSize}
						height={symbolSize}
						style={{filter:"var(--icon-filter)"}}
						transform={`translate(${colOffset*nodeSpacing-symbolSize/2},${rowOffset*nodeSpacing-symbolSize/2})`}
					/>
				);
			});
		}
	}
	
	const hTop = Math.max(100, showNodeLabels ? (
			130 + textInListSpacing * (Math.ceil(Math.max(nodesAboveEast.length, nodesAboveWest.length)/2)-6)
		):(
			100 + nodeSpacing * (Math.ceil(Math.max(nodesAboveEast.length, nodesAboveWest.length)/4)-3)
		))
	
	const hBot = 20 + Math.max(100, showNodeLabels ? (
			100 + textInListSpacing * (Math.ceil(Math.max(nodesBelowEast.length, nodesBelowWest.length)/2)-6)
		):(
			100 + nodeSpacing * (Math.ceil(Math.max(nodesBelowEast.length, nodesBelowWest.length)/4)-3)
		))
		
	const height = hTop + hBot;
	const hatchingWidth = 15;

	const createHemispheresChart = (width: number) => {
		const { defs: hatchDefs, fill: hatchFill } = svgHatchDefs({ dotSize: 1, spacing: 5 });
		return (
			<svg width={width} height={height}>
				{hatchDefs}
				<rect
					x={0}
					y={0}
					width={width}
					height={height}
					strokeWidth={strokeWidth}
					fill={hatchFill}
				/>
				<rect
					x={hatchingWidth}
					y={hatchingWidth}
					width={width-2*hatchingWidth}
					height={height-2*hatchingWidth}
					strokeWidth={strokeWidth}
					fill={"var(--color-bg)"}
				/>
				{/*axes*/}
				<line
					x1={"50%"}
					y1={"0%"}
					x2={"50%"}
					y2={"100%"}
					stroke="var(--color-text)"
					strokeWidth={strokeWidth}
				/>
				<line
					x1={"0%"}
					y1={hTop}
					x2={"100%"}
					y2={hTop}
					stroke="var(--color-text)"
					strokeWidth={strokeWidth}
				/>
				{/*labels + background*/}
				<rect
					x={width/2-textSize*2.5}
					y={hTop-textSize*0.7}
					width={textSize*5}
					height={textSize*1.4}
					fill="var(--color-bg)"
					stroke="none"
				/>
				<text x="50%" y={hTop+textSize*0.3} textAnchor="middle" {...svgTextProps} fontWeight="bold">
					{"Horizon"}
				</text>
				<text x="1%" y={hTop-textSize*0.3} textAnchor="start" {...svgTextProps} fontWeight="bold">
					{"East"}
				</text>
				<text x="99%" y={hTop-textSize*0.3} textAnchor="end" {...svgTextProps} fontWeight="bold">
					{"West"}
				</text>
				<g transform={`translate(${0.25*width},${0.5*hTop})`}>
					{renderNodeGroupSVG(nodesAboveEast, width/2)}
				</g>
				<g transform={`translate(${0.75*width},${0.5*hTop})`}>
					{renderNodeGroupSVG(nodesAboveWest, width/2)}
				</g>
				<g transform={`translate(${0.25*width},${hTop+0.5*hBot})`}>
					{renderNodeGroupSVG(nodesBelowEast, width/2)}
				</g>
				<g transform={`translate(${0.75*width},${hTop+0.5*hBot})`}>
					{renderNodeGroupSVG(nodesBelowWest, width/2)}
				</g>
			</svg>
		);
	};
	
	const createFillerRectangle = (width: number) => {
		const { defs, fill } = svgHatchDefs({ dotSize: 1, spacing: 3.5 });
		return (
			<svg width={width} height={height}>
				{defs}
				<rect
					x={0}
					y={0}
					width={width}
					height={height}
					fill={fill}
				/>
			</svg>
		);
	};
	
	return (
		<div className="text-theme-text p-4">
		
			{renderString(createEmphasisString(verticalDiff, horizontalDiff, nodesInConsideration.length))}
			
			<hr className="opacity-50 my-2"/>
			
			{/*quadrants chart*/}
			<div className="flex justify-center gap-0">
				{false && createFillerRectangle(15)}
				{false && createHemispheresChart(250)}
				{false && createFillerRectangle(15)}
				{createFillerRectangle(0)}
				{createHemispheresChart(310)}
				{createFillerRectangle(0)}
			</div>
			
		</div>
	);
}

export default HemispheresChart;
