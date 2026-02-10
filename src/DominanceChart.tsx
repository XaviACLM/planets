import { useMemo, FC, ReactNode } from 'react';
import { Node, Zodiac, Element, Mode, personalPlanets, socialPlanets, transpersonalPlanets, zodiacElement, zodiacMode, nodeDependsOnLocation } from './astroDefs';
import { nodeSymbols, elementSymbols, modeSymbols } from './astroGraphics.ts';
import ZodiacPositions from './zodiacPositions.ts'
import { useSettingsStore } from './settingsStore.ts'
import { renderString, renderSmallcapsString, renderTitle, renderElement, renderMode, renderNode } from './renderPrimitives.tsx'
const luminaries: Node[] = [Node.SUN, Node.MOON];

type DominanceChartProps = {
	zodiacPositions: ZodiacPositions,
}

// Custom hook containing all shared logic for dominance charts
const useDominanceData = (zodiacPositions: ZodiacPositions) => {
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showElementLabels = useSettingsStore(s => s.showElementLabels);
	const showModeLabels = useSettingsStore(s => s.showModeLabels);
	const symbolSize = 20;
	const textSize = 12;
	const textSizeTitle = 14;
	const strokeWidth = 1;

	const renderElementSVG = (elem: Element, leftJustify: boolean): ReactNode => {
		return showElementLabels ? (
			<text
				fill="var(--color-text)"
				fontSize={textSize}
				textAnchor={leftJustify ? "start" : "end"}
				fontVariant="small-caps"
				fontWeight="bold"
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
				fontWeight="bold"
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

	const {nodeElements, nodeModes, nodesByElement, nodesByMode, validSocialPlanets, validMainAngles, validLuminaries, allPlanets, discardedNodes} = useMemo(() => {
		const nodeElements: Map<Node, Element> = new Map();
		const nodeModes: Map<Node, Mode> = new Map();
		const nodesByElement: Map<Element, Node[]> = new Map();
		const nodesByMode: Map<Mode, Node[]> = new Map();
		const validSocialPlanets: Node[] = [];
		const validMainAngles: Node[] = [];
		const validLuminaries: Node[] = [];
		const allPlanets: Node[] = [];
		const discardedNodes: Node[] = [];

		const nodesInConsideration: Node[] = [
			...personalPlanets,
			...socialPlanets,
			...transpersonalPlanets,
			Node.ASCENDANT,
			Node.MIDHEAVEN,
		];

		for (const elem of Object.values(Element)){
			nodesByElement.set(elem, []);
		}
		for (const mode of Object.values(Mode)){
			nodesByMode.set(mode, []);
		}

		for (const node of nodesInConsideration){
			if (nodeDependsOnLocation[node] && !zodiacPositions.hasSurfacePosition()){
				continue;
			}

			const z = zodiacPositions.getSymbolOfNode(node);
			if (z == Zodiac.OPHIUCHUS){
				discardedNodes.push(node);
				continue;
			}

			if (socialPlanets.includes(node)){
				validSocialPlanets.push(node);
			}
			if (nodeDependsOnLocation[node]){
				validMainAngles.push(node);
			}
			if (luminaries.includes(node)){
				validLuminaries.push(node);
			}
			if (!nodeDependsOnLocation[node]){
				allPlanets.push(node);
			}

			const elem = zodiacElement[z];
			const mode = zodiacMode[z];

			nodeElements.set(node, elem);
			nodeModes.set(node, mode);
			nodesByElement.get(elem).push(node);
			nodesByMode.get(mode).push(node);
		}

		return {nodeElements, nodeModes, nodesByElement, nodesByMode, validSocialPlanets, validMainAngles, validLuminaries, allPlanets, discardedNodes};
	},[zodiacPositions]);

	const createCounter = <T extends string>(
		enumObj: { readonly [key: string]: T },
		nodeMap: Map<Node, T>
	) => {
		return (nodes: Node[]): Map<T, number> => {
			const counts: Map<T, number> = new Map();
			for (const value of Object.values(enumObj)){
				counts.set(value, 0);
			}
			for (const node of nodes){
				const value = nodeMap.get(node);
				counts.set(value, counts.get(value) + 1);
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
			return Array.from(counts.entries()).find(([_,count]) => count == maxVal)[0];
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
			const labelSpacing = textSize * 5.4;
			const symbolSpacing = symbolSize * 1.5;
			const annotationSpacing = showLabels ? labelSpacing : symbolSpacing;
			const etcSpacing = 5; // annotation to bar
			const height = symbolSize * counts.size;

			const labelTransform = leftJustify ? (
				showLabels ? `translate(${annotationSpacing-etcSpacing},14)` : `translate(${etcSpacing},0)`
			) : (
				showLabels ? `translate(${width-annotationSpacing+etcSpacing},14)` : `translate(${width-annotationSpacing+etcSpacing},0)`
			);

			return (
				<svg width={width} height={height}>
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
									fill="var(--color-text)"
									stroke="var(--color-text)"
									strokeWidth={strokeWidth}
									mask={"url(#mask-stripe)"}
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
					<defs>
						<pattern id="pattern-stripe"
							width="3"
							height="3"
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
						<mask id="mask-stripe">
							<rect
								x="0"
								y="0"
								width="100%"
								height="100%"
								fill="url(#pattern-stripe)"
							/>
						</mask>
					</defs>
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
							{renderNode(node, { forceText: true })}
							{" | "}
							{renderElement(nodeElements.get(node))}
							{" · "}
							{renderMode(nodeModes.get(node))}
						</div>
					);
				})}
			</div>
		);
	}

	const listNodes = (nodes: Node[], forceText: boolean): ReactNode => {
		return (
			<>
			{nodes.map((node, i) => {
				return <span key={node}>
					{forceText || showNodeLabels ? renderSmallcapsString(node) : renderNode(node)}
					{(forceText || showNodeLabels) && (i < nodes.length - 1)
					&& <span style={{fontSize: textSize}}>, </span>
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
		validSocialPlanets,
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
		zodiacPositions,
	};
};

// Abbreviated view component
export const AbridgedDominanceChart: FC<DominanceChartProps> = ({ zodiacPositions }) => {
	const {
		validLuminaries,
		validMainAngles,
		allPlanets,
		elementBarChart,
		modeBarChart,
		dominanceString,
		smallNodeDisplay,
		zodiacPositions: zp,
	} = useDominanceData(zodiacPositions);

	return (
		<div className="text-theme-text p-4 pt-2 pb-2" style={{ width: 330 }}>
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

			{ zp.hasSurfacePosition()
			&& validMainAngles.length != 0
			&& <div>
				<hr className="opacity-50 my-2"/>
				{smallNodeDisplay(validMainAngles)}
			</div>}
		</div>
	);
};

// Full view component
const DominanceChart: FC<DominanceChartProps> = ({ zodiacPositions }) => {
	const {
		textSize,
		nodesByElement,
		nodesByMode,
		validSocialPlanets,
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
		zodiacPositions: zp,
	} = useDominanceData(zodiacPositions);

	return (
		<div className="text-theme-text p-4 pt-3 pb-0" style={{ width: 330 }}>

			<div>
				{renderTitle("Personal Planets")}
				{dominanceString(personalPlanets)}
				<div className="flex justify-center">
					{elementBarChart(personalPlanets, false)}
					{modeBarChart(personalPlanets, true)}
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
				{dominanceString(transpersonalPlanets)}
				<div className="flex justify-center">
					{elementBarChart(transpersonalPlanets, false)}
					{modeBarChart(transpersonalPlanets, true)}
				</div>
			</div>

			{ zp.hasSurfacePosition()
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
				<div>
					<hr className="opacity-50"/>
					{"※"}
					{listNodes(discardedNodes, true)}
					<span style={{fontSize: textSize}}> in Ophiuchus: discarded from analysis.</span>
				</div>
			}
		</div>
	);
}

export default DominanceChart;
