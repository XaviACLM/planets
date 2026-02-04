import { useState, useMemo, FC } from 'react';
import { Node, mainAngles, NodeType, nodeTypes, zodiacElement, zodiacMode, standardNodes, Sect, nodeDependsOnLocation } from './astroDefs';
import { nodeAverageSpeed } from './astroData';
import { DignityMode, HouseAngularityMode, HamburgSchoolMode, Theme } from './settingsDefs';
import { RulershipGraph, getFinalDispositorsOfChain } from './rulershipGraph';
import { Aspect, filterAspectsByNode, getAspectsSummaryData } from './aspects';
import { getChartSect, getChartRuler, getHouseAngularities, getAngleProximity, isInSect } from './astrologyUtil';
import { getEclipticLongitudeSpeed } from './astronomyUtil';
import { getDignityState, getBoundLord, getFaceLord, getTriplicityRole, type DignityState, Dignity } from './dignities';
import { formatAngle } from './util';
import {
	renderTitle,
	renderString,
	renderSmallcapsString,
	renderSign,
	renderNode,
	renderElement,
	renderMode,
	renderArrow,
	NodeSelectorButton,
	renderDispositorChain,
	renderFinalDispositors,
	renderCommaSeparatedNodeList
} from './renderPrimitives';
import { nodeImages, nodeSymbols } from './astroGraphics.ts'
import { useSettingsStore } from './settingsStore.ts'
import { useUIStore } from './uiStore.ts'
import ZodiacPositions from './zodiacPositions';

// Opinionated thresholds
const ANGLE_PROXIMITY_THRESHOLD_DEG = 10; // degrees - show "near angle" info within this distance
					
type PlanetPanelProps = {
	zodiacPositions: ZodiacPositions;
	rulershipGraph: RulershipGraph;
	aspects: Map<Aspect, Aspect[]>;
	date: Date;
};

const PlanetPanel: FC<PlanetPanelProps> = ({
	zodiacPositions,
	rulershipGraph,
	aspects,
	date,
}) => {
	
	const dignityMode = useSettingsStore(s => s.dignityMode);
	const houseAngularityMode = useSettingsStore(s => s.houseAngularityMode);
	const hamburgSchoolMode = useSettingsStore(s => s.hamburgSchoolMode);
	
	// locally unused, render dependency
	// ( = these lines here to force rerender if these values change)
	const showNodeLabels = useSettingsStore(s => s.showNodeLabels);
	const showSymbolLabels = useSettingsStore(s => s.showSymbolLabels);
	const showSignsInDispositorChains = useSettingsStore(s => s.showSignsInDispositorChains);
	
	const useExtendedDignities = useSettingsStore(s => s.useExtendedDignities);
	const triplicityMode = useSettingsStore(s => s.triplicityMode);
	const faceMode = useSettingsStore(s => s.faceMode);
	const boundsMode = useSettingsStore(s => s.boundsMode);
	const stationarySpeedFractionThreshold = useSettingsStore(s => s.stationarySpeedPercentageThreshold)/100;
	
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	
	const theme = useSettingsStore(s => s.theme);
	const isDarkTheme = theme === Theme.DARK;
	
	const hasSurfacePosition = zodiacPositions.hasSurfacePosition();
	const chartRuler = useMemo(
		() => getChartRuler(zodiacPositions, dignityMode),
		[zodiacPositions, dignityMode]
	);

	const selectedNode = useUIStore(s => s.selectedNodeInPlanetPanel);
	const setSelectedNode = useUIStore(s => s.setSelectedNodeInPlanetPanel);
	
	const isStandardNode = standardNodes.includes(selectedNode);

	type SelectorButtonSpecs = {node: Node | null, highlight: boolean, disabled: boolean}
	
	// Quick selector buttons: ASC, Ruler, Sun, Moon
	const selectorButtonsPrimary: Array<SelectorButtonSpecs> = useMemo(() => [
		{
			node: Node.ASCENDANT,
			highlight: false,
			disabled: !hasSurfacePosition,
		},
		{
			node: chartRuler,
			highlight: true,
			disabled: !chartRuler,
		},
		{
			node: Node.SUN,
			highlight: false,
			disabled: false,
		},
		{
			node: Node.MOON,
			highlight: false,
			disabled: false,
		},
	].filter(item => item.node != chartRuler || item.highlight), [hasSurfacePosition, chartRuler]);
	
	const selectorButtonsSecondary: Array<SelectorButtonSpecs> = useMemo(() => standardNodes.filter(
			node => selectedNodes.has(node) && ![Node.SUN, Node.MOON, chartRuler].includes(node)
		).map(node => {
			return {
				node: node,
				highlight: false,
				disabled: false,
			}
		}), [selectedNodes, chartRuler]);
	
	const selectorButtonsTertiary: Array<SelectorButtonSpecs> = useMemo(() => Array.from(selectedNodes).filter(
			node => !standardNodes.includes(node) && node !== Node.ASCENDANT
		).map(node => {
			return {
				node: node,
				highlight: false,
				disabled: !hasSurfacePosition && nodeDependsOnLocation[node],
			}
		}), [selectedNodes]);

	// Get sign and position for selected node
	const nodeSign = zodiacPositions.getSymbolOfNode(selectedNode);
	const positionInSign = zodiacPositions.getNodePositionWithinSign(selectedNode);
	const formattedPosition = formatAngle(positionInSign);

	const faceLord = getFaceLord(selectedNode, zodiacPositions, faceMode);
	const boundLord = getBoundLord(selectedNode, zodiacPositions, boundsMode);

	// Get house placement (if location defined)
	// TODO whether this is defined is a bit more complicated
	const houseNumber = hasSurfacePosition
		? zodiacPositions.getHouseOfNode(selectedNode)
		: null;

	// Get house angularity
	const houseAngularities = hasSurfacePosition
		? getHouseAngularities(zodiacPositions, houseAngularityMode)
		: null;
	const angularity = houseNumber && houseAngularities
		? houseAngularities[houseNumber - 1]
		: null;

	// 2.1 Dignity
	const dignityState = useMemo(
		() => getDignityState(selectedNode, zodiacPositions, dignityMode),
		[selectedNode, zodiacPositions, dignityMode]
	);
	
	const triplicityRole = (hasSurfacePosition && standardNodes.includes(selectedNode)) ? getTriplicityRole(selectedNode, zodiacPositions, triplicityMode) : null;

	// 2.2 Speed & Retrograde
	const speedRadPerDay = useMemo(() => {
		if (nodeTypes[selectedNode] === NodeType.POINT) {
			return null;
		} else {
			return getEclipticLongitudeSpeed(selectedNode, date, hamburgSchoolMode);
		}
	}, [selectedNode, date, hamburgSchoolMode]);

	const isStationary = speedRadPerDay !== null && Math.abs(speedRadPerDay) < nodeAverageSpeed[selectedNode]*stationarySpeedFractionThreshold;
	const isRetrograde = speedRadPerDay !== null && !isStationary && speedRadPerDay < 0;
	const speedDegPerDay = speedRadPerDay !== null && (speedRadPerDay * 180 / Math.PI);
	const formattedSpeedDegPerDay = speedDegPerDay !== null && formatAngle(Math.abs(speedRadPerDay), Math.abs(speedDegPerDay)<1);

	// 2.3 Angle proximity
	const angleProximity = useMemo(() => {
		if (!hasSurfacePosition) return null;
		return getAngleProximity(selectedNode, zodiacPositions);
	}, [selectedNode, zodiacPositions, hasSurfacePosition]);

	const angleProximityDeg = angleProximity ? (angleProximity.distance * 180 / Math.PI) : null;
	const showAngleProximity = angleProximityDeg !== null && angleProximityDeg <= ANGLE_PROXIMITY_THRESHOLD_DEG && !mainAngles.includes(selectedNode);

	// 2.4 Rulership chain
	const { isFinalDispositor, dispositorChain } = useMemo(() => {
		if (isStandardNode) {
			const isFinalDispositor = rulershipGraph.isFinalDispositor(selectedNode);
			const chain = rulershipGraph.getDispositorChain(selectedNode);
			return {
				isFinalDispositor,
				dispositorChain: isFinalDispositor ? getFinalDispositorsOfChain(chain) : chain,
			};
		} else {
			return {
				isFinalDispositor: false,
				dispositorChain: rulershipGraph.getDispositorChainForNonstandardNode(selectedNode, nodeSign)
			};
		}
	}, [selectedNode, rulershipGraph]);

	const ruledNodes = useMemo(() => {
		return isStandardNode ? rulershipGraph.getRuledNodes(selectedNode, false) : null;
	}, [selectedNode, rulershipGraph]);

	const transitivelyRuledNodes = useMemo(() => {
		return isStandardNode ? rulershipGraph.getRuledNodes(selectedNode, true) : null;
	}, [selectedNode, rulershipGraph]);

	// 2.5 Aspects summary
	const aspectsSummary = useMemo(() => {
		const filtered = filterAspectsByNode(aspects, selectedNode);
		const summary = getAspectsSummaryData(filtered);
		// Remove the selected node from the "in aspect with" list
		summary.nodes.delete(selectedNode);
		return summary;
	}, [aspects, selectedNode]);

	// 2.6 Sect
	const { chartIsDiurnal, inSect } = useMemo(() => {
		if (!hasSurfacePosition) {return { chartIsDiurnal: null, inSect: null }};
		return {
			chartIsDiurnal: getChartSect(zodiacPositions) === Sect.DIURNAL,
			inSect: isInSect(selectedNode, zodiacPositions)
		};
	}, [selectedNode, zodiacPositions]);

	const formatOrdinal = (n: number): string => {
		const suffixes = ["th", "st", "nd", "rd"];
		const v = n % 100;
		return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
	};
	
	const formatAngleProximity = (angleProximityInfo: AngleProximityInfo) => {
		const preposition = angleProximity.passed ? "past" : "before";
		const verbs: Partial<Record<Node, string[]>> = {
			[Node.ASCENDANT] : ["Rising", "Risen"],
			[Node.IMUM_COELI] : ["Anti-culminating", "Anti-culminated"],
			[Node.DESCENDANT] : ["Setting", "Set"],
			[Node.MIDHEAVEN] : ["Culminating", "Culminated"],
		}
		const verb = verbs[angleProximityInfo.closestAngle][angleProximityInfo.passed ? 1 : 0];
		return (
			<div>
				{renderString(verb)}
				{renderString(` (${angleProximityDeg!.toFixed(1)}° ${preposition} `)}
				{renderNode(angleProximity.closestAngle, { forceText: true })}
				{renderString(`).`)}
			</div>
		);
	};
	
	const nodeGraphicSVG = () => {
		const planetImageWidth = 115;
		const largeSymbolWidth = 60;
		const padding = 5;
		
		const sunScaling = 10/9; // measured from images to match outer edges
		const sunD = planetImageWidth*(1/2)*(1/sunScaling - 1);
		const saturnScaling = 2.43; // eyeballed
		const saturnD = planetImageWidth*(1/2)*(1/saturnScaling - 1);
		const imageTransform = selectedNode === Node.SUN ? (
				`scale(${sunScaling}, ${sunScaling}) translate(${sunD}, ${sunD})`
			) : selectedNode === Node.SATURN ? (
				`scale(${saturnScaling}, ${saturnScaling*1.05}) translate(${saturnD-4}, ${saturnD-4})` //very eyeballed!
			) : (
				""
			);
		
		return (
			<svg width={planetImageWidth+2*padding} height={planetImageWidth+2*padding} overflow={"visible"} className="">
				<circle cx="50%" cy="50%" r={planetImageWidth/2+padding} fill="url(#outerShadow)" opacity="0.4"/>
				<circle cx="50%" cy="50%" r={planetImageWidth*(0.5-0.01)} fill="var(--color-bg)"/>
				{isStandardNode ? (<>
					<image
						key={0}
						x={padding}
						y={padding}
						href={nodeImages[selectedNode]}
						width={planetImageWidth}
						height={planetImageWidth}
						opacity={1}
						filter={isDarkTheme ? "" : "invert(1)"}
						transform={imageTransform}
					/>
					<circle cx="50%" cy="50%" r={planetImageWidth/2} fill="url(#innerShadow)" filter="url(#boost-alpha)" opacity="1"/>
				</>) : (<>
					<circle cx="50%" cy="50%" r={planetImageWidth*0.50} stroke="var(--color-text)" opacity="0.5" fill="none"/>
					<circle cx="50%" cy="50%" r={planetImageWidth*0.45} stroke="var(--color-text)" opacity="0.5" fill="none"/>
					<circle cx="50%" cy="50%" r={planetImageWidth*0.40} stroke="var(--color-text)" opacity="0.5" fill="none"/>
				</>)}
				<image
					key={2}
					x={padding}
					y={padding}
					href={nodeSymbols[selectedNode]}
					width={largeSymbolWidth}
					height={largeSymbolWidth}
					filter={isDarkTheme ? "invert(1) url(#glow)" : "url(#glow)"}
					transform={`translate(${(planetImageWidth-largeSymbolWidth)/2},${(planetImageWidth-largeSymbolWidth)/2})`}
				/>
				<defs>
					<filter id="glow" x="-200%" y="-200%" width="400%" height="400%">
						<feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="var(--color-text)"/>
						<feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="var(--color-text)"/>
					</filter>
					<filter id="boost-alpha">
						<feComponentTransfer>
							<feFuncA type="table" tableValues="0 0.4 0.7 0.8 0.9"/>
						</feComponentTransfer>
					</filter>
					<radialGradient id="outerShadow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
						<stop offset="89%" stopColor="var(--color-text)"/>
						<stop offset="100%" stopColor="var(--color-bg)"/>
					</radialGradient>
					<radialGradient id="innerShadow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
						<stop offset="0%" stopColor="var(--color-bg)"/>
						<stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0"/>
					</radialGradient>
				</defs>
			</svg>
		);
	}
	
	const selectorButtonList = (buttonSpecs: SelectorButtonSpecs[]) => {
		return (
			<div className="mb-0">
				<div className="flex flex-wrap gap-1.5">
					{buttonSpecs.map((btn, idx) => (
						<NodeSelectorButton
							key={idx}
							node={btn.node || "Ruler"}
							showLabel={showNodeLabels || !btn.node}
							selected={selectedNode === btn.node}
							disabled={btn.disabled}
							highlighted={btn.highlight}
							onClick={() => setSelectedNode(btn.node!)}
						/>
					))}
				</div>
			</div>
		);
	}
	
	const renderRuledNodes = (ruledNodes: Node[], transitivelyRuledNodes: Node[]) => {
		if (ruledNodes.length === 0){
			return renderString("Not ruling any planet or luminary.");
		}
		
		const rulesAllNodes = ruledNodes.length === standardNodes.length - 1;
		const transitivelyRulesAllNodes = transitivelyRuledNodes.length === standardNodes.length - 1;
		const transitivelyRulesAnyNodes = transitivelyRuledNodes.length > ruledNodes.length ;
		const exclusivelyTransitivelyRuledNodes = transitivelyRulesAnyNodes ? transitivelyRuledNodes.filter(n => !ruledNodes.includes(n)) : [];
		return (
			<span>
				{renderString("Rules ")}
				{rulesAllNodes && renderString("all planets & luminaries")}
				{!rulesAllNodes && renderCommaSeparatedNodeList(ruledNodes)}
				{renderString(".")}
				{transitivelyRulesAnyNodes && (<>
					{renderString(" Transitively rules ")}
					{transitivelyRulesAllNodes && renderString("all planets & luminaries")}
					{!transitivelyRulesAllNodes && renderCommaSeparatedNodeList(exclusivelyTransitivelyRuledNodes)}
					{renderString(".")}
				</>)}
			</span>
		);
	}
	
	const renderDignity = (dignityState: DignityState) => {
		const descriptiveStr = {
			[Dignity.DOMICILE] : "In Domicile",
			[Dignity.EXALTATION] : "Exalted",
			[Dignity.DETRIMENT] : "In Detriment",
			[Dignity.FALL] : "In Fall",
			[Dignity.PEREGRINE] : "Peregrine",
		}[dignityState.dignity];
		return (
			<div>
				{renderString(descriptiveStr)}
				{dignityState.degreeOffset !== undefined ? (
					renderString(` (${dignityState.degreeOffset > 0 ? "+" : ""}${dignityState.degreeOffset.toFixed(0)}° from exact)`)
				) : (
					null
				)}
			</div>
		);
	}

	return (
		<div className="text-theme-text p-4" style={{ width: 330 }}>
			{/* Planet Selector */}
			
			<div className="group">
				{selectorButtonList(selectorButtonsPrimary)}
				<div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300">
					<div className="overflow-hidden">
						<hr className="opacity-20 my-2 mx-4" />
						{selectorButtonList(selectorButtonsSecondary)}
						<hr className="opacity-20 my-2 mx-4" />
						{selectorButtonList(selectorButtonsTertiary)}
					</div>
				</div>
			</div>

			<hr className="opacity-50 my-2" />
			
			<div className="flex gap-5">
				{nodeGraphicSVG()}
				{/* POSITION / SIGN, POSITION WITHIN SIGN */}
				<div className="text-right flex-grow">
					
					{/* Sign and Position */}
					<div className="mt-2">
						{renderSign(nodeSign)}
						{renderString(" · ")}
						{renderSmallcapsString(formattedPosition)}
					</div>
				
					{/* House, house angularity */}
					{houseNumber && (
						<div>
							{renderString(`${formatOrdinal(houseNumber)} House`)}
							{angularity && (
								<>
									{renderString(" · ")}
									{renderString(angularity)}
								</>
							)}
						</div>
					)}
					
					{/* Chart ruler */}
					{selectedNode === chartRuler && (<div className="underline">{renderString("Chart Ruler")}</div>)}
					
					{/* Dignity */}
					{dignityState && renderDignity(dignityState)}
					
					{useExtendedDignities && (triplicityRole !== null) && (
						<div>
							{renderString(`Triplicity Ruler (${triplicityRole})`)}
						</div>
					)}

					{/* Speed / Retrograde */}
					{formattedSpeedDegPerDay !== null && (
						<div>
							{isStationary ? (
								renderString("Stationary")
							) : isRetrograde ? (
								renderString("Retrograde")
							) : (
								renderString("Direct")
							)}
							{renderString(` (${formattedSpeedDegPerDay} / day)`)}
						</div>
					)}

					{/* Sect */}
					{inSect !== null && (
						<div>
							{renderString(inSect ? "In Sect" : "Out of Sect")}
							{false && renderString(chartIsDiurnal ? " (Diurnal Chart)" : " (Nocturnal Chart)")}
						</div>
					)}
				
				</div>
			</div>
					
			{/* Extended dignities (face and bound, not triplicity)*/}
			{useExtendedDignities && ( faceLord === boundLord ? (
				<div className="text-wrap">
					{renderString("In the face & bound of ")}
					{renderNode(faceLord, { withArticle: true })}
					{renderString(".")}
				</div>
			) : (
				<div>
					{renderString("In the face of ")}
					{renderNode(faceLord, { withArticle: true })}
					{renderString(" & the bound of ")}
					{renderNode(boundLord, { withArticle: true })}
					{renderString(".")}
				</div>
			))}
					
			{/* Angle Proximity */}
			{showAngleProximity && angleProximity && formatAngleProximity(angleProximity)}

			{/* Aspects Summary */}
			{aspectsSummary.nAspects > 0 ? (
				<>
					{renderString(`In ${aspectsSummary.nAspects} aspect${aspectsSummary.nAspects !== 1 ? "s" : ""}`)}
					{aspectsSummary.nConfigurations > 0 && (
						renderString(` (${aspectsSummary.nConfigurations} configuration${aspectsSummary.nConfigurations !== 1 ? "s" : ""})`)
					)}
					{renderString(", with ")}
					{Array.from(aspectsSummary.nodes).map((node, i) => (
						<span key={i}>
							{i > 0 && renderString(", ")}
							{renderNode(node)}
						</span>
					))}
					{renderString(".")}
				</>
			) : (
				renderString("Not in any aspects.")
			)}

			{/* Rulership Chain */}
			{dispositorChain && (
				<>
					<hr className="opacity-50 mt-4" />
					<span className="absolute -translate-y-4 translate-x-2 bg-theme-bg px-1">
						{renderSmallcapsString("Dispositorship")}
					</span>
					<div>
						<div className="mt-2">
							{isFinalDispositor ? (
								renderFinalDispositors(dispositorChain, true)
							) : (
								renderDispositorChain(dispositorChain, true)
							)}
						</div>
						{isStandardNode && renderRuledNodes(ruledNodes, transitivelyRuledNodes)}
					</div>
				</>
			)}
		</div>
	);
};

export default PlanetPanel;
