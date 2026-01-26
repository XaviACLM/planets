import { useState, useMemo, FC } from 'react';
import { Node, mainAngles, NodeType, nodeTypes, zodiacElement, zodiacMode, standardNodes } from './astroDefs';
import { DignityMode, HouseAngularityMode, HamburgSchoolMode } from './settingsDefs';
import ZodiacPositions from './zodiacPositions';
import { RulershipGraph } from './rulershipGraph';
import { Aspect, filterAspectsByNode, getAspectsSummaryData } from './aspects';
import { getChartRuler, getHouseAngularities, getAngleProximity, isInSect } from './astrologyUtils';
import { getEclipticLongitudeSpeed } from './astronomyUtils';
import { getDignityState } from './dignities';
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
} from './renderPrimitives';

// Opinionated thresholds
const STATIONARY_THRESHOLD_DEG_PER_DAY = 0.1; // degrees/day - planet considered stationary below this
const ANGLE_PROXIMITY_THRESHOLD_DEG = 10; // degrees - show "near angle" info within this distance
									
type PlanetPanelProps = {
	zodiacPositions: ZodiacPositions;
	rulershipGraph: RulershipGraph;
	aspects: Map<Aspect, Aspect[]>;
	date: Date;
	dignityMode: DignityMode;
	houseAngularityMode: HouseAngularityMode;
	hamburgSchoolMode: HamburgSchoolMode;
	showNodeLabels: boolean;
	showSymbolLabels: boolean;
	showElementLabels: boolean;
	showModeLabels: boolean;
	showSignsInDispositorChains: boolean;
};

const PlanetPanel: FC<PlanetPanelProps> = ({
	zodiacPositions,
	rulershipGraph,
	aspects,
	date,
	dignityMode,
	houseAngularityMode,
	hamburgSchoolMode,
	showNodeLabels,
	showSymbolLabels,
	showElementLabels,
	showModeLabels,
	showSignsInDispositorChains,
}) => {
	const hasSurfacePosition = zodiacPositions.hasSurfacePosition();
	const chartRuler = useMemo(
		() => getChartRuler(zodiacPositions, dignityMode),
		[zodiacPositions, dignityMode]
	);

	// Default to Sun, or ASC if location is defined
	const [selectedNode, setSelectedNode] = useState<Node>(
		hasSurfacePosition ? Node.ASCENDANT : Node.SUN
	);

	// Quick selector buttons: ASC, Ruler, Sun, Moon
	const selectorButtons: Array<{
		node: Node | null;
		subtitle?: string;
		disabled: boolean;
	}> = useMemo(() => [
		{
			node: Node.ASCENDANT,
			disabled: !hasSurfacePosition,
		},
		{
			node: chartRuler,
			subtitle: "(ruler)",
			disabled: !chartRuler,
		},
		{
			node: Node.SUN,
			disabled: false,
		},
		{
			node: Node.MOON,
			disabled: false,
		},
	].filter(item => item.node != chartRuler || item.subtitle != undefined), [hasSurfacePosition, chartRuler]);

	// Get sign and position for selected node
	const nodeSign = zodiacPositions.getSymbolOfNode(selectedNode);
	const positionInSign = zodiacPositions.getNodePositionWithinSign(selectedNode);
	const formattedPosition = formatAngle(positionInSign);

	// Get house placement (if location defined)
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

	// 2.2 Speed & Retrograde
	const speedRadPerDay = useMemo(() => {
		if (nodeTypes[selectedNode] === NodeType.POINT) {
			return null;
		} else {
			return getEclipticLongitudeSpeed(selectedNode, date, hamburgSchoolMode);
		}
	}, [selectedNode, date, hamburgSchoolMode]);

	const speedDegPerDay = speedRadPerDay !== null ? (speedRadPerDay * 180 / Math.PI) : null;
	const isRetrograde = speedDegPerDay !== null && speedDegPerDay < -STATIONARY_THRESHOLD_DEG_PER_DAY;
	const isStationary = speedDegPerDay !== null && Math.abs(speedDegPerDay) < STATIONARY_THRESHOLD_DEG_PER_DAY;

	// 2.3 Angle proximity
	const angleProximity = useMemo(() => {
		if (!hasSurfacePosition) return null;
		try {
			return getAngleProximity(selectedNode, zodiacPositions);
		} catch {
			return null;
		}
	}, [selectedNode, zodiacPositions, hasSurfacePosition]);

	const angleProximityDeg = angleProximity ? (angleProximity.distance * 180 / Math.PI) : null;
	const showAngleProximity = angleProximityDeg !== null && angleProximityDeg <= ANGLE_PROXIMITY_THRESHOLD_DEG && !mainAngles.includes(selectedNode);

	// 2.4 Rulership chain
	const dispositorChain = useMemo(() => {
		if (standardNodes.includes(selectedNode)) {
			return rulershipGraph.getDispositorChain(selectedNode);
		} else {
			return rulershipGraph.getDispositorChainForNonstandardNode(selectedNode, nodeSign);
		}
	}, [selectedNode, rulershipGraph]);

	const ruledNodes = useMemo(() => {
		try {
			return rulershipGraph.getRuledNodes(selectedNode, false);
		} catch {
			return null;
		}
	}, [selectedNode, rulershipGraph]);

	const transitivelyRuledNodes = useMemo(() => {
		try {
			return rulershipGraph.getRuledNodes(selectedNode, true);
		} catch {
			return null;
		}
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
	const inSect = useMemo(() => {
		if (!hasSurfacePosition) return null;
		return isInSect(selectedNode, zodiacPositions);
	}, [selectedNode, zodiacPositions, hasSurfacePosition]);

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
			<div className="mt-1">
				{renderString(verb)}
				{renderString(` (${angleProximityDeg!.toFixed(1)}° ${preposition} `)}
				{renderNode(angleProximity.closestAngle, showNodeLabels)}
				{renderString(`)`)}
			</div>
		);
	};

	return (
		<div className="text-white p-4" style={{ width: 330 }}>
			{/* Planet Selector */}
			<div className="mb-4">
				<div className="flex flex-wrap gap-1.5">
					{selectorButtons.map((btn, idx) => (
						btn.disabled ? (
							<button
								key={idx}
								className="bg-transparent border border-gray-800 p-1.5 text-white opacity-40 cursor-not-allowed flex items-center justify-center small-caps"
								disabled
							>
								<span className="text-xs font-medium whitespace-nowrap opacity-60">{btn.node || "Ruler"}</span>
							</button>
						) : (
							<NodeSelectorButton
								key={idx}
								node={btn.node}
								showLabel={showNodeLabels}
								selected={selectedNode === btn.node}
								disabled={btn.disabled}
								onClick={() => setSelectedNode(btn.node!)}
								subtitle={btn.subtitle}
							/>
						)
					))}
				</div>
			</div>

			<hr className="opacity-50 my-2" />

			{/* Basic Info */}
			<div>
				{renderTitle(String(selectedNode))}

				{/* Sign and Position */}
				<div className="mt-2">
					{renderSign(nodeSign, showSymbolLabels)}
					{renderString(" ")}
					{renderSmallcapsString(formattedPosition)}
					{renderString(" (")}
					{renderElement(zodiacElement[nodeSign], showElementLabels)}
					{renderString(", ")}
					{renderMode(zodiacMode[nodeSign], showModeLabels)}
					{renderString(")")}
				</div>

				{/* House Placement */}
				{houseNumber && (
					<div className="mt-1">
						{renderString(`${formatOrdinal(houseNumber)} House`)}
						{angularity && (
							<>
								{renderString(" · ")}
								{renderSmallcapsString(angularity)}
							</>
						)}
					</div>
				)}

				{/* 2.1 Dignity */}
				{dignityState && (
					<div className="mt-1">
						{renderSmallcapsString(dignityState.dignity)}
						{dignityState.degreeOffset !== undefined && (
							renderString(` (${dignityState.degreeOffset > 0 ? "+" : ""}${dignityState.degreeOffset.toFixed(0)}° from exact)`)
						)}
					</div>
				)}

				{/* 2.2 Speed & Retrograde */}
				{speedDegPerDay !== null && (
					<div className="mt-1">
						{isStationary ? (
							renderSmallcapsString("Stationary")
						) : isRetrograde ? (
							renderSmallcapsString("Retrograde")
						) : (
							renderSmallcapsString("Direct")
						)}
						{renderString(` (${Math.abs(speedDegPerDay).toFixed(2)}°/day)`)}
					</div>
				)}

				{/* 2.3 Angle Proximity */}
				{showAngleProximity && angleProximity && (
					<div className="mt-1">
						{formatAngleProximity(angleProximity)}
					</div>
				)}

				{/* 2.6 Sect */}
				{inSect !== null && (
					<div className="mt-1">
						{renderSmallcapsString(inSect ? "In Sect" : "Out of Sect")}
					</div>
				)}
			</div>

			{/* 2.4 Rulership Chain */}
			{dispositorChain && (
				<>
					<hr className="opacity-50 my-2" />
					<div>
						{renderTitle("Dispositor Chain")}
						<div className="mt-2 pl-4" style={{ textIndent: "-1em" }}>
							{renderDispositorChain(dispositorChain, true, showSignsInDispositorChains, showNodeLabels, showSymbolLabels)}
						</div>
						{ruledNodes && ruledNodes.length > 0 && (
							<div className="mt-2">
								{renderString("Rules: ")}
								{ruledNodes.map((node, i) => (
									<span key={i}>
										{i > 0 && renderString(", ")}
										{renderNode(node, showNodeLabels)}
									</span>
								))}
							</div>
						)}
						{transitivelyRuledNodes && transitivelyRuledNodes.length > ruledNodes?.length && (
							<div className="mt-1">
								{renderString("Transitively rules: ")}
								{transitivelyRuledNodes.map((node, i) => (
									<span key={i}>
										{i > 0 && renderString(", ")}
										{renderNode(node, showNodeLabels)}
									</span>
								))}
							</div>
						)}
					</div>
				</>
			)}

			{/* 2.5 Aspects Summary */}
			{aspectsSummary.nAspects > 0 && (
				<>
					<hr className="opacity-50 my-2" />
					<div>
						{renderTitle("Aspects")}
						<div className="mt-2">
							{renderString(`In ${aspectsSummary.nAspects} aspect${aspectsSummary.nAspects !== 1 ? "s" : ""}`)}
							{aspectsSummary.nConfigurations > 0 && (
								renderString(` (${aspectsSummary.nConfigurations} configuration${aspectsSummary.nConfigurations !== 1 ? "s" : ""})`)
							)}
						</div>
						{aspectsSummary.nodes.size > 0 && (
							<div className="mt-1">
								{renderString("With: ")}
								{Array.from(aspectsSummary.nodes).map((node, i) => (
									<span key={i}>
										{i > 0 && renderString(", ")}
										{renderNode(node, showNodeLabels)}
									</span>
								))}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default PlanetPanel;
