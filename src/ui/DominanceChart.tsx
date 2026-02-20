import { useMemo, type FC, type ReactNode } from 'react';
import {
	Node,
	Zodiac,
	Element,
	Mode,
	personalPlanets,
	socialPlanets,
	transpersonalPlanets,
	zodiacElement,
	zodiacMode,
	nodeDependsOnLocation,
	standardNodes,
	nodeTypes,
	NodeType,
	mainAngles
} from '../defs/astroDefs';
import { elementSymbols, modeSymbols, nodesWithoutSymbol } from '../defs/astroGraphics.ts';
import NodePositions from '../model/nodePositions.ts'
import ZodiacSignPositions from '../model/zodiacSignPositions.ts'
import { getSignOfNode } from '../model/chartAnalysis.ts'
import { useSettingsStore } from '../settings/settingsStore.ts'
import { NodesToConsider } from '../defs/settingsDefs.ts'
import { renderString, renderSmallcapsString, renderTitle, renderElement, renderMode, renderNode, svgHatchDefs } from './renderPrimitives.tsx'
const luminaries: Node[] = [Node.SUN, Node.MOON];

type DominanceChartProps = {
	nodePositions: NodePositions,
	zodiacSignPositions: ZodiacSignPositions,
}

// Custom hook containing all shared logic for dominance charts
const useDominanceData = (nodePositions: NodePositions, zodiacSignPositions: ZodiacSignPositions) => {
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showElementLabels = useSettingsStore(s => s.showElementLabels);
	const showModeLabels = useSettingsStore(s => s.showModeLabels);
	const symbolSize = 20;
	const textSize = 12;
	const strokeWidth = 1;
	
	const whichNodes = useSettingsStore(s => s.nodesInDominanceChart);
	const hamburgPhysical = useSettingsStore(s => s.hamburgPhysical);
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	
	const nodesInConsideration = useMemo(() => {
		switch (whichNodes) {
			case NodesToConsider.STANDARD:
				return Array.from(selectedNodes)
					.filter(node => standardNodes.includes(node))
					.filter(node => nodePositions.has(node));
			case NodesToConsider.PHYSICAL:
				return Array.from(selectedNodes)
					.filter(n => nodeTypes[n] === NodeType.BODY || (nodeTypes[n] === NodeType.HYPOTHETICAL && hamburgPhysical))
					.filter(node => nodePositions.has(node));
			case NodesToConsider.ALL:
				return Array.from(selectedNodes)
					.filter(node => nodePositions.has(node));
		}
	}, [whichNodes, selectedNodes, hamburgPhysical])

	const {nodeElements, nodeModes, nodesByElement, nodesByMode, validPersonalPlanets, validSocialPlanets, validTranspersonalPlanets, validMainAngles, validLuminaries, allPlanets, discardedNodes} = useMemo(() => {
		const nodeElements: Map<Node, Element> = new Map();
		const nodeModes: Map<Node, Mode> = new Map();
		const nodesByElement: Map<Element, Node[]> = new Map();
		const nodesByMode: Map<Mode, Node[]> = new Map();
		const validPersonalPlanets: Node[] = [];
		const validSocialPlanets: Node[] = [];
		const validTranspersonalPlanets: Node[] = [];
		const validMainAngles: Node[] = [];
		const validLuminaries: Node[] = [];
		const allPlanets: Node[] = [];
		const discardedNodes: Node[] = [];

		for (const elem of Object.values(Element)){
			nodesByElement.set(elem, []);
		}
		for (const mode of Object.values(Mode)){
			nodesByMode.set(mode, []);
		}

		for (const node of nodesInConsideration){
			if (nodeDependsOnLocation[node] && !nodePositions.hasSurfacePosition()){
				continue;
			}

			const z = getSignOfNode(node, nodePositions, zodiacSignPositions);
			if (z == Zodiac.OPHIUCHUS){
				discardedNodes.push(node);
				continue;
			}

			if (personalPlanets.includes(node)){
				validPersonalPlanets.push(node);
			}
			if (socialPlanets.includes(node)){
				validSocialPlanets.push(node);
			}
			if (transpersonalPlanets.includes(node)){
				validTranspersonalPlanets.push(node);
			}
			if (mainAngles[node]){
				validMainAngles.push(node);
			}
			if (luminaries.includes(node)){
				validLuminaries.push(node);
			}
			
			if (whichNodes === NodesToConsider.ALL || !nodeDependsOnLocation[node]){
				allPlanets.push(node);
			}

			const elem = zodiacElement[z]!;
			const mode = zodiacMode[z]!;

			nodeElements.set(node, elem);
			nodeModes.set(node, mode);
			nodesByElement.get(elem)!.push(node);
			nodesByMode.get(mode)!.push(node);
		}


		return {nodeElements, nodeModes, nodesByElement, nodesByMode, validPersonalPlanets, validSocialPlanets, validTranspersonalPlanets, validMainAngles, validLuminaries, allPlanets, discardedNodes};
	}, [nodePositions, zodiacSignPositions, nodesInConsideration]);

	const renderElementSVG = (elem: Element, leftJustify: boolean): ReactNode => {
		return showElementLabels ? (
			<text
				fill="var(--color-text)"
				fontSize={textSize}
				textAnchor={leftJustify ? "start" : "end"}
				fontVariant="small-caps"
			>
				{elem}
			</text>
		) : (
			<image
				href={elementSymbols[elem]}
				width={symbolSize}
				height={symbolSize}
				style={{filter:"var(--icon-filter)"}}
			/>
		);
	};

	const renderModeSVG = (mode: Mode, leftJustify: boolean): ReactNode => {
		return showModeLabels ? (
			<text
				fill="var(--color-text)"
				fontSize={textSize}
				textAnchor={leftJustify ? "start" : "end"}
				fontVariant="small-caps"
			>
				{mode}
			</text>
		) : (
			<image
				href={modeSymbols[mode]}
				width={symbolSize}
				height={symbolSize}
				style={{filter:"var(--icon-filter)"}}
			/>
		);
	};

	const createCounter = <T extends string>(
		enumObj: { readonly [key: string]: T },
		nodeMap: Map<Node, T>
	) => {
		return (nodes: Node[]): Map<T, number> => {
			const counts: Map<T, number> = new Map();
			for (const value of Object.values(enumObj)){
				counts.set(value as T, 0);
			}
			for (const node of nodes){
				const value = nodeMap.get(node)!;
				counts.set(value as T, counts.get(value)! + 1);
			}
			return counts;
		};
	};

	const countElements = createCounter(Element, nodeElements);
	const countModes = createCounter(Mode, nodeModes);

	const createDominantFinder = <T extends string>(
		countFun: (nodes: Node[]) => Map<T, number>,
	) => {
		return (nodes: Node[]): T | null => {
			const counts: Map<T, number> = countFun(nodes);
			const maxVal = Math.max(...Array.from(counts.values()));
			const maxCount = Array.from(counts.values()).filter(n => n == maxVal).length;
			if (maxCount !== 1){
				return null;
			}
			return Array.from(counts.entries()).find(([_,count]) => count == maxVal)![0];
		};
	};

	const getDominantElement = createDominantFinder(countElements);
	const getDominantMode = createDominantFinder(countModes);

	const createBarChartCreator = <T extends string>(
		countFun: (nodes: Node[]) => Map<T, number>,
		labelRenderer: (k: T, leftJustify: boolean) => ReactNode,
		showLabels: boolean,
	) => {
		return (nodes: Node[], leftJustify: boolean) => {

			const counts: Map<T, number> = countFun(nodes);
			const totalNodes = nodes.length;

			const width = 135;
			const labelSpacing = textSize * 4.8;
			const symbolSpacing = symbolSize * 1.5;
			const annotationSpacing = showLabels ? labelSpacing : symbolSpacing;
			const etcSpacing = 5; // annotation to bar
			const height = symbolSize * counts.size;

			const labelTransform = leftJustify ? (
				showLabels ? `translate(${annotationSpacing-etcSpacing},14)` : `translate(${etcSpacing},0)`
			) : (
				showLabels ? `translate(${width-annotationSpacing+etcSpacing},14)` : `translate(${width-annotationSpacing+etcSpacing},0)`
			);

			const { defs, fill } = svgHatchDefs({ dotSize: 1, spacing: 3 });

			return (
				<svg width={width} height={height}>
					{defs}
					{Array.from(counts.entries()).map(([value, count], i) => {
						const barWidth = Math.max(0.1, (width - labelSpacing - 1) * (count/totalNodes));
						return (
							<g key={i} transform={`translate(0, ${i*symbolSize})`}>
								<rect
									x={leftJustify ? annotationSpacing : width - annotationSpacing - barWidth}
									y={symbolSize*0.15}
									width={barWidth}
									height={symbolSize*0.7}
									fill="none"
									stroke="var(--color-text)"
									strokeWidth={strokeWidth}
								/>
								<rect
									x={leftJustify ? annotationSpacing : width - annotationSpacing - barWidth}
									y={symbolSize*0.15}
									width={barWidth}
									height={symbolSize*0.7}
									fill={fill}
									stroke="var(--color-text)"
									strokeWidth={strokeWidth}
								/>
								<line
									x1={leftJustify ? annotationSpacing+barWidth : 0}
									y1={symbolSize/2}
									x2={leftJustify ? width : width - annotationSpacing - barWidth}
									y2={symbolSize/2}
									stroke="var(--color-text)"
									strokeWidth={strokeWidth/2}
								/>
								<g transform={labelTransform}>{labelRenderer(value, !leftJustify)}</g>
							</g>
						);
					})}
				</svg>
			);
		};
	};

	const elementBarChart = createBarChartCreator(countElements, renderElementSVG, showElementLabels);
	const modeBarChart = createBarChartCreator(countModes, renderModeSVG, showModeLabels);

	const dominanceString = (nodes: Node[]): ReactNode => {
		const dominantElement = getDominantElement(nodes);
		const dominantMode = getDominantMode(nodes);
		if ( dominantElement === null ) {
			if ( dominantMode === null ){
				return (
					<div>
						{renderString("No dominant element or mode.")}
					</div>
				);
			} else {
				return (
					<div>
						{renderSmallcapsString(dominantMode)}
						{renderString(" mode dominant. No dominant element.")}
					</div>
				);
			}
		} else {
			if ( dominantMode === null ){
				return (
					<div>
						{renderSmallcapsString(dominantElement)}
						{renderString(" dominant. No dominant mode.")}
					</div>
				);
			} else {
				return (
					<div>
						{renderSmallcapsString(dominantElement)}
						{renderString(" and ")}
						{renderSmallcapsString(dominantMode)}
						{renderString(" mode dominant.")}
					</div>
				);
			}
		}
	};

	const smallNodeDisplay = (nodes: Node[]): ReactNode => {
		return (
			<div className="flex justify-center flex-wrap">
				{nodes.map((node) => {
					return (
						<div key={node} className="mx-2 flex items-center gap-1">
							{renderNode(node, { preferText: true })}
							{" | "}
							{renderElement(nodeElements.get(node)!)}
							{" · "}
							{renderMode(nodeModes.get(node)!)}
						</div>
					);
				})}
			</div>
		);
	}

	const listNodes = (nodes: Node[], preferText: boolean): ReactNode => {
		const requiresDot = nodes.map(node => nodesWithoutSymbol.includes(node))
		const followedByDot: boolean[] = [];
		for (let i=0; i<nodes.length-1; i++) {
			followedByDot.push(requiresDot[i] || requiresDot[i+1]);
		}
		return (
			<>
			{nodes.map((node, i) => {
				return <span key={node}>
					{preferText || showNodeLabels ? renderSmallcapsString(node) : renderNode(node)}
					{(preferText || showNodeLabels) && (i < nodes.length - 1)
					&& <span style={{fontSize: textSize}}>, </span>
					}
					{!(preferText || showNodeLabels) && followedByDot[i] 
					&& <span style={{fontSize: textSize}}> · </span>
					}
					{!(preferText || showNodeLabels) && !followedByDot[i] 
					&& <span style={{fontSize: textSize}}> </span>
					}
				</span>;
			})}
			</>
		);
	}

	return {
		showNodeLabels,
		textSize,
		nodeElements,
		nodeModes,
		nodesByElement,
		nodesByMode,
		validPersonalPlanets,
		validSocialPlanets,
		validTranspersonalPlanets,
		validMainAngles,
		validLuminaries,
		allPlanets,
		discardedNodes,
		elementBarChart,
		modeBarChart,
		dominanceString,
		smallNodeDisplay,
		listNodes,
		renderTitle,
		renderElement,
		renderMode,
		nodePositions,
	};
};

// Abbreviated view component
export const AbridgedDominanceChart: FC<DominanceChartProps> = ({ nodePositions, zodiacSignPositions }) => {
	const {
		validLuminaries,
		validMainAngles,
		allPlanets,
		elementBarChart,
		modeBarChart,
		dominanceString,
		smallNodeDisplay,
		nodePositions: np,
	} = useDominanceData(nodePositions, zodiacSignPositions);

	return (
		<div className="text-theme-text p-4 pt-2 pb-2">
			<div>
				{dominanceString(allPlanets)}

				<hr className="opacity-50 my-2"/>

				<div className="flex justify-center">
					{elementBarChart(allPlanets, false)}
					{modeBarChart(allPlanets, true)}
				</div>
			</div>


			{ validLuminaries.length != 0
			&& <div>
				<hr className="opacity-50 my-2"/>
				{smallNodeDisplay(validLuminaries)}
			</div>}

			{ np.hasSurfacePosition()
			&& validMainAngles.length != 0
			&& <div>
				<hr className="opacity-50 my-2"/>
				{smallNodeDisplay(validMainAngles)}
			</div>}
		</div>
	);
};

// Full view component
export const DominanceChart: FC<DominanceChartProps> = ({ nodePositions, zodiacSignPositions }) => {
	const {
		textSize,
		nodesByElement,
		nodesByMode,
		validPersonalPlanets,
		validSocialPlanets,
		validTranspersonalPlanets,
		validMainAngles,
		validLuminaries,
		discardedNodes,
		elementBarChart,
		modeBarChart,
		dominanceString,
		smallNodeDisplay,
		listNodes,
		renderTitle,
		renderElement,
		renderMode,
		nodePositions: np,
	} = useDominanceData(nodePositions, zodiacSignPositions);

	return (
		<div className="text-theme-text p-4 pt-3 pb-0" style={{ width: 330 }}>

			<div>
				{renderTitle("Personal Planets")}
				{dominanceString(validPersonalPlanets)}
				<div className="flex justify-center">
					{elementBarChart(validPersonalPlanets, false)}
					{modeBarChart(validPersonalPlanets, true)}
				</div>
			</div>

			{ validLuminaries.length != 0
			&& <div>
				<div>
					{smallNodeDisplay(validLuminaries)}
				</div>
			</div>}

			{ validSocialPlanets.length != 0
			&& <div>
				<hr className="opacity-50 my-2"/>

				<div>
					{renderTitle("Social Planets")}
					{smallNodeDisplay(validSocialPlanets)}
				</div>
			</div>}

			<hr className="opacity-50 my-2"/>

			<div>
				{renderTitle("Transpersonal Planets")}
				{dominanceString(validTranspersonalPlanets)}
				<div className="flex justify-center">
					{elementBarChart(validTranspersonalPlanets, false)}
					{modeBarChart(validTranspersonalPlanets, true)}
				</div>
			</div>

			{ np.hasSurfacePosition()
			&& validMainAngles.length != 0
			&& <div>
				<hr className="opacity-50 my-2"/>
				<div>
					{renderTitle("Main Angles")}
					{smallNodeDisplay(validMainAngles)}
				</div>
			</div>}

			<hr className="opacity-50 my-2"/>

			<div className="grid overflow-hidden bg-theme-bg w-full my-4" style={{ gridTemplateColumns: 'auto 1fr' }}>
				{Array.from(nodesByElement.entries()).map(([elem, nodes], index) => (
					[
						<div
							key={`label-${index}`}
							className="col-start-1 whitespace-nowrap text-right mr-2 border-r border-theme-border pr-2"
						>
							{renderElement(elem)}
						</div>,
						<div
							key={`value-${index}`}
							className="col-start-2 mb-1"
						>
							{listNodes(nodes, false)}
						</div>
					]
				))}
			</div>

			<hr className="opacity-50 my-2"/>

			<div className="grid overflow-hidden bg-theme-bg w-full my-4" style={{ gridTemplateColumns: 'auto 1fr' }}>
				{Array.from(nodesByMode.entries()).map(([elem, nodes], index) => (
					[
						<div
							key={`label-${index}`}
							className="col-start-1 whitespace-nowrap text-right mr-2 border-r border-theme-border pr-2"
						>
							{renderMode(elem)}
						</div>,
						<div
							key={`value-${index}`}
							className="col-start-2 mb-1"
						>
							{listNodes(nodes, false)}
						</div>
					]
				))}
			</div>

			{ (discardedNodes.length != 0) &&
				<div className="pb-2">
					<hr className="opacity-50 pb-2"/>
					{"※"}
					{listNodes(discardedNodes, true)}
					<span style={{fontSize: textSize}}> in Ophiuchus: discarded from analysis.</span>
				</div>
			}
		</div>
	);
}
