import { useMemo, FC, ReactNode } from 'react';
import { Node, Zodiac, Element, Mode, standardNodes, NodeType, nodeTypes, mainAngles } from './astroDefs';
import { nodeSymbols, nodeShortName, nodePreferredName } from './astroGraphics.ts';
import ZodiacPositions from './zodiacPositions.ts'
import { useSettingsStore } from './settingsStore.ts'
import { NodesToConsider } from './settingsDefs.ts'
import { renderString } from './renderPrimitives.tsx'

type HemispheresChartProps = {
	zodiacPositions: ZodiacPositions,
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
	
	// considering we're working with 10 standard planets. nth if equal, slight if 2 (4 vs 6), av if 4 (3 vs 7), strong if 6/8/10 (0,1,2 vs 8,9,10)
	const strengthsPerDiff: (number|null)[] = [0, null, 1, null, 2, null, 3, null, 3, null, 3];
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
	const nodesPerRow = Array.from({length: numRows}, (_, i) => 4);
	nodesPerRow.push(nNodes - 4*numRows);
	return nodesPerRow;
}

const HemispheresChart: FC<HemispheresChartProps> = ({
	zodiacPositions,
}) => {
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const whichNodes = useSettingsStore(s => s.nodesInHemispheresChart);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	
	const nodesUnderConsideration = useMemo(() => {
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
	
	console.log(whichNodes, nodesUnderConsideration);
	
	const {nodesAboveEast, nodesAboveWest, nodesBelowEast, nodesBelowWest, verticalDiff, horizontalDiff} = useMemo(() => {
		const nodesAboveEast: Node[] = [];
		const nodesAboveWest: Node[] = [];
		const nodesBelowEast: Node[] = [];
		const nodesBelowWest: Node[] = [];
	
		for (const node of nodesUnderConsideration){
			if (zodiacPositions.isNodeAboveHorizon(node)) {
				if (zodiacPositions.isNodeEastern(node)) {
					nodesAboveEast.push(node);
				} else {
					nodesAboveWest.push(node);
				}
			} else {
				if (zodiacPositions.isNodeEastern(node)) {
					nodesBelowEast.push(node);
				} else {
					nodesBelowWest.push(node);
				}
			}
		}
		
		const verticalDiff: number = (nodesAboveEast.length + nodesAboveWest.length) - (nodesBelowEast.length + nodesBelowWest.length);
		const horizontalDiff: number = (nodesAboveEast.length + nodesBelowEast.length) - (nodesAboveWest.length + nodesBelowWest.length);

		return {nodesAboveEast, nodesAboveWest, nodesBelowEast, nodesBelowWest, verticalDiff, horizontalDiff};
	}, [zodiacPositions, nodesUnderConsideration]);
	
	const symbolSize = 20;
	const nodeSpacing = 27;
	const textInListSpacing = 18;
	const textSize = 12;
	const strokeWidth = 1;

	const svgTextProps = {
		fill: "var(--color-text)",
		fontSize: textSize,
		fontVariant: "small-caps",
		fontWeight: "bold",
	} as const;
	
	const renderNodeGroupSVG = (nodes: Node): ReactNode => {
		if (showNodeLabels) {
			const nNodes = nodes.length;
			if (nNodes <= 5) {
				return nodes.map((node, i) => {
					const rowOffset = i - (nNodes-1)/2;
					const label = nodePreferredName[node] ?? node;
					return (
						<text
							key={i}
							{...svgTextProps}
							textAnchor="middle"
							transform={`translate(0,${textInListSpacing*rowOffset+textSize/3})`}
						>
							{label}
						</text>
					);
				});
			} else {
				const nLeft = Math.floor(nNodes/2);
				const nRight = Math.ceil(nNodes/2);
				return (
					<>
						{Array.from({length:nLeft}, (_, i) => {
							const node = nodes[i];
							const rowOffset = i - (nLeft-1)/2;
							const label = nodeShortName[node] ?? nodePreferredName[node] ?? node;
							const scaleFactor = 7/label.length;
							const scaleTransform = scaleFactor < 1 ? `scale(${scaleFactor}, 1)` : ''
							return (
								<text
									key={i}
									{...svgTextProps}
									textAnchor="end"
									transform={`translate(${-textInListSpacing/4},${textInListSpacing*rowOffset+textSize/3}) ${scaleTransform}`}
								>
									{label}
								</text>
							);
						})}
						{Array.from({length:nRight}, (_, i) => {
							const node = nodes[i+nLeft];
							const rowOffset = i - (nRight-1)/2;
							const label = nodeShortName[node] ?? nodePreferredName[node] ?? node;
							const scaleFactor = 7/label.length;
							const scaleTransform = scaleFactor < 1 ? `scale(${scaleFactor}, 1)` : ''
							return (
								<text
									key={i+nLeft}
									{...svgTextProps}
									textAnchor="start"
									transform={`translate(${textInListSpacing/4},${textInListSpacing*rowOffset+textSize/3}) ${scaleTransform}`}
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
			const colPerIdx = nodesPerRow.flatMap((count, index) => Array.from(Array(count).keys()));
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
	
	const hBot = Math.max(100, showNodeLabels ? (
			100 + textInListSpacing * (Math.ceil(Math.max(nodesBelowEast.length, nodesBelowWest.length)/2)-6)
		):(
			100 + nodeSpacing * (Math.ceil(Math.max(nodesBelowEast.length, nodesBelowWest.length)/4)-3)
		))
		
	const height = hTop + hBot;

	const createHemispheresChart = (width: number) => {
		return (
			<svg width={width} height={height} className="my-1">
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
				<text x="50%" y={hTop+textSize*0.3} textAnchor="middle" {...svgTextProps}>
					{"Horizon"}
				</text>
				<text x="0%" y={hTop-textSize*0.3} textAnchor="start" {...svgTextProps}>
					{"East"}
				</text>
				<text x="100%" y={hTop-textSize*0.3} textAnchor="end" {...svgTextProps}>
					{"West"}
				</text>
				<g transform={`translate(${0.25*width},${0.5*hTop})`}>
					{renderNodeGroupSVG(nodesAboveEast)}
				</g>
				<g transform={`translate(${0.75*width},${0.5*hTop})`}>
					{renderNodeGroupSVG(nodesAboveWest)}
				</g>
				<g transform={`translate(${0.25*width},${hTop+0.5*hBot})`}>
					{renderNodeGroupSVG(nodesBelowEast)}
				</g>
				<g transform={`translate(${0.75*width},${hTop+0.5*hBot})`}>
					{renderNodeGroupSVG(nodesBelowWest)}
				</g>
			</svg>
		);
	};
	
	const createFillerRectangle = (width: number) => {
		return (
			<svg width={width} height={height}>
				<rect
					x={0}
					y={0}
					width={width}
					height={height}
					fill="var(--color-text)"
					stroke="var(--color-text)"
					strokeWidth={strokeWidth}
					mask={"url(#mask-stripe2)"}
				/>
				<defs>
					<pattern id="pattern-stripe2"
						width="3.5"
						height="3.5"
						patternUnits="userSpaceOnUse"
						patternTransform="rotate(45)"
					>
						<rect
							width="1"
							height="1"
							transform="translate(0,0)"
							fill="white"
						/>
					</pattern>
					<mask id="mask-stripe2">
						<rect
							x="0"
							y="0"
							width="100%"
							height="100%"
							fill="url(#pattern-stripe2)"
						/>
					</mask>
				</defs>
			</svg>
		);
	};
	
	return (
		<div className="text-theme-text p-4 pt-3" style={{ width: 330 }}>
		
			{renderString(createEmphasisString(verticalDiff, horizontalDiff, nodesUnderConsideration.length))}
			
			<hr className="opacity-50 my-2"/>
			
			{/*quadrants chart*/}
			<div className="flex justify-center gap-2">
				{createFillerRectangle(15)}
				{createHemispheresChart(250)}
				{createFillerRectangle(15)}
			</div>
			
		</div>
	);
}

export default HemispheresChart;
