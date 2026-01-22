import { useMemo, FC, ReactNode } from 'react';
import { Node, Zodiac, Element, Mode, standardNodes } from './astroDefs';
import { nodeSymbols } from './astroGraphics.ts';
import { ZodiacPositions } from './astro.ts'

const luminaries: Node[] = [Node.SUN, Node.MOON];

type HemispheresChartProps = {
	zodiacPositions: ZodiacPositions,
	showNodeLabels: boolean,
}

function capitalize(sentence: string): string {
	return String(sentence).charAt(0).toUpperCase() + String(sentence).slice(1);
}

function createEmphasisString(verticalDiff: number, horizontalDiff: number) {
	// vertical diff is above - below, horizontal diff is east - west
	
	const verticalOrientation = verticalDiff === 0 ? 0 : verticalDiff > 0 ? 1 : -1;
	const horizontalOrientation = horizontalDiff === 0 ? 0 : horizontalDiff > 0 ? 1 : -1;
	const verticalDiffAbs = verticalOrientation > 0 ? verticalDiff : -verticalDiff;
	const horizontalDiffAbs = horizontalOrientation > 0 ? horizontalDiff : -horizontalDiff;
	
	// considering we're working with 10 standard planets. nth if equal, slight if 2 (4 vs 6), av if 4 (3 vs 7), strong if 6/8/10 (0,1,2 vs 8,9,10)
	const strengthsPerDiff: (number|null)[] = [0, null, 1, null, 2, null, 3, null, 3, null, 3];
	const verticalStrength = strengthsPerDiff[verticalDiffAbs];
	const horizontalStrength = strengthsPerDiff[horizontalDiffAbs];
	
	const strengthModifiers: (string|null)[] = [null, "slight ", "", "strong "];
	const strengthModifiersAdj: (string|null)[] = [null, "slighty ", "", "strongly "];
	const verticalModifier = strengthModifiers[verticalStrength];
	const horizontalModifier = strengthModifiers[horizontalStrength];
	const horizontalModifierAdj = strengthModifiersAdj[horizontalStrength];
	
	const horizontalStringUsesModifier = horizontalStrength === 1 || horizontalStrength === 3;
	const verticalStringLongish = verticalStrength !== 2;
	
	if (verticalStrength === horizontalStrength) {
		if (verticalStrength === 0) { // null - null case
			return "No east/west or above/below horizon emphasis.";
		} else {
			return capitalize(`${verticalModifier}emphasis ${horizontalOrientation === 1 ? 'east' : 'west'} & ${verticalOrientation === 1 ? 'above' : 'below'} the horizon.`);
		}
	} else {
		const verticalString = verticalStrength === 0 ? (
			horizontalStringUsesModifier ? (
				'No emphasis above/below horizon'
			) : (
				'No emphasis above/below the horizon'
			)
		) : (
			
			`${verticalModifier}emphasis ${verticalOrientation === 1 ? 'above' : 'below'} the horizon`
		); 
		const horizontalString = horizontalStrength === 0 ? (
			'No east/west emphasis'
		) : (
			verticalStringLongish ? (
				`${horizontalModifierAdj}${horizontalOrientation === 1? 'eastern' : 'western'}`
			) : (
				`${horizontalModifier}${horizontalOrientation === 1? 'eastern' : 'western'} emphasis`
			)
		);
		if (verticalStrength>horizontalStrength) { // vertical goes first
			return capitalize(`${verticalString}${horizontalStrength === 0 ? '.' : ','} ${horizontalString}.`);
		} else { // horizontal goes first
			return capitalize(`${horizontalString}${verticalStrength === 0 ? '.' : ','} ${verticalString}.`);
		}
	}
}



const HemispheresChart: FC<HemispheresChartProps> = ({
	zodiacPositions,
	showNodeLabels,
}) => {
	const symbolSize = 20;
	const nodeSpacing = 27;
	const textInListSpacing = 18;
	const textSize = 12;
	const strokeWidth = 1;

	const renderSmallcapsString = (str: string): ReactNode => {
		return (
			<span className="small-caps font-bold" style={{ fontSize: textSize }}>
				{str}
			</span>
		);
	};

	const renderString = (str: string): ReactNode => {
		return (
			<span style={{ fontSize: textSize }}>
				{str}
			</span>
		);
	};

	const renderNode = (node: Node): ReactNode => {
		return showNodeLabels ? (
			renderSmallcapsString(node)
		) : (
			<img
				src={nodeSymbols[node]}
				alt={node}
				width={symbolSize}
				height={symbolSize}
				className="invert inline"
			/>
		);
	};
	
	const renderNodeSVG = (node: Node): ReactNode => {
		return showNodeLabels ? (
			<text
				fill="white"
				fontSize={textSize}
				fontVariant="small-caps"
				fontWeight="bold"
			>
				{node}
			</text>
		) : (
			<image
				href={nodeSymbols[node]}
				width={symbolSize}
				height={symbolSize}
				style={{filter:"invert(1)"}}
			/>
		);
	};
	
	const renderNodeGroupSVG = (nodes: Node): ReactNode => {
		if (showNodeLabels) {
			const nNodes = nodes.length;
			if (nNodes <= 5) {
				return nodes.map((node, i) => {
					const rowOffset = i - (nNodes-1)/2;
					return (
						<text
							key={i}
							fill="white"
							fontSize={textSize}
							textAnchor={"middle"}
							fontVariant="small-caps"
							fontWeight="bold"
							transform={`translate(0,${textInListSpacing*rowOffset+textSize/3})`}
						>
							{node}
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
							return (
								<text
									key={i}
									fill="white"
									fontSize={textSize}
									textAnchor={"end"}
									fontVariant="small-caps"
									fontWeight="bold"
									transform={`translate(${-textInListSpacing/4},${textInListSpacing*rowOffset+textSize/3})`}
								>
									{node}
								</text>
							);
						})}
						{Array.from({length:nRight}, (_, i) => {
							const node = nodes[i+nLeft];
							const rowOffset = i - (nRight-1)/2;
							return (
								<text
									key={i+nLeft}
									fill="white"
									fontSize={textSize}
									textAnchor={"start"}
									fontVariant="small-caps"
									fontWeight="bold"
									transform={`translate(${textInListSpacing/4},${textInListSpacing*rowOffset+textSize/3})`}
								>
									{node}
								</text>
							);
						})}
					</>
				);
			}
		} else {
			const nodesPerRow: number[] = [[],[1],[2],[3],[2,2],[3,2],[3,3],[2,3,2],[3,2,3],[3,3,3],[3,4,3]][nodes.length];
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
						style={{filter:"invert(1)"}}
						transform={`translate(${colOffset*nodeSpacing-symbolSize/2},${rowOffset*nodeSpacing-symbolSize/2})`}
					/>
				);
			});
		}
	}
	
	const {nodesAboveEast, nodesAboveWest, nodesBelowEast, nodesBelowWest, verticalDiff, horizontalDiff} = useMemo(() => {
		const nodesAboveEast: Node[] = [];
		const nodesAboveWest: Node[] = [];
		const nodesBelowEast: Node[] = [];
		const nodesBelowWest: Node[] = [];

		for (const node of standardNodes){
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
	}, [zodiacPositions]);

	const createHemispheresChart = (width: number, height: number) => {
		return (
			<svg width={width} height={height} className="my-1">
				{/*axes*/}
				<line
					x1={"50%"}
					y1={"0%"}
					x2={"50%"}
					y2={"100%"}
					stroke="white"
					strokeWidth={strokeWidth}
				/>
				<line
					x1={"0%"}
					y1={"50%"}
					x2={"100%"}
					y2={"50%"}
					stroke="white"
					strokeWidth={strokeWidth}
				/>
				{/*labels + background*/}
				<rect
					x={width/2-textSize*2.3}
					y={height/2-textSize*0.7}
					width={textSize*4.6}
					height={textSize*1.4}
					fill="black"
					stroke="none"
				/>
				<text
					x={"50%"}
					y={height/2+textSize*0.3}
					textAnchor={"middle"}
					fill="white"
					fontSize={textSize}
					fontVariant="small-caps"
					fontWeight="bold"
				>
					{"Horizon"}
				</text>
				<text
					x={"0%"}
					y={height/2-textSize*0.3}
					textAnchor={"start"}
					fill="white"
					fontSize={textSize}
					fontVariant="small-caps"
					fontWeight="bold"
				>
					{"West"}
				</text>
				<text
					x={"100%"}
					y={height/2-textSize*0.3}
					textAnchor={"end"}
					fill="white"
					fontSize={textSize}
					fontVariant="small-caps"
					fontWeight="bold"
				>
					{"East"}
				</text>
				<g transform={`translate(${0.25*width},${0.25*height})`}>
					{renderNodeGroupSVG(nodesAboveWest)}
				</g>
				<g transform={`translate(${0.75*width},${0.25*height})`}>
					{renderNodeGroupSVG(nodesAboveEast)}
				</g>
				<g transform={`translate(${0.25*width},${0.75*height})`}>
					{renderNodeGroupSVG(nodesBelowWest)}
				</g>
				<g transform={`translate(${0.75*width},${0.75*height})`}>
					{renderNodeGroupSVG(nodesBelowEast)}
				</g>
			</svg>
		);
	};
	
	const createFillerRectangle = (width: number, height: number) => {
		return (
			<svg width={width} height={height}>
				<rect
					x={0}
					y={0}
					width={width}
					height={height}
					fill="#777"
					stroke="white"
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
		<div className="text-white p-4 pt-3" style={{ width: 330 }}>
		
			{renderString(createEmphasisString(verticalDiff, horizontalDiff))}
			
			<hr className="opacity-50 my-2"/>
			
			{/*quadrants chart*/}
			<div className="flex justify-center gap-2">
				{createFillerRectangle(15,200)}
				{createHemispheresChart(250,200)}
				{createFillerRectangle(15,200)}
			</div>
			
		</div>
	);
}

export default HemispheresChart;
