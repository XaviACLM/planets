import { useState, useEffect, useRef, useMemo, type FC } from 'react';
import { Node, NodeType, nodeTypes, standardNodes, mainAngles, nodeDependsOnLocation, HouseAngularity } from './astroDefs';
import { NodesToConsider } from './settingsDefs';
import { getNodeAverageSpeed } from './astroData';
import { Aspect, filterAspectsByNode, getAspectsSummaryData } from './aspects';
import {
	getChartRuler, getHouseAngularities, getAngleProximity,
	isInSect, getFixedStarsWithinLongitude, getSignOfNode,
	getNodePositionWithinSign, getHouseOfNode
} from './chartAnalysis';
import { getDignityState, getBoundLord, getFaceLord, getTriplicityRole, Dignity, type TriplicityRole } from './dignities';
import type { AngleProximityInfo } from './chartAnalysis';
import { formatAngle } from './util';
import { renderString, renderSign, renderNode } from './renderPrimitives';
import { useSettingsStore } from './settingsStore';
import NodePositions from './nodePositions';
import NodeVelocities from './nodeVelocities';
import ZodiacSignPositions from './zodiacSignPositions';
import FixedStarPositions from './fixedStarPositions';
import HouseCuspPositions from './houseCuspPositions';

// ============================================================================
// Data computation (all per-node, computed up front)
// ============================================================================

interface NodeRowData {
	node: Node;
	sign: ReturnType<typeof getSignOfNode>;
	positionInSign: number;
	houseNumber: number | null;
	angularity: string | null;
	dignityLabel: string | null;
	isRetrograde: boolean;
	isStationary: boolean;
	speedLabel: string;
	nAspects: number;
	nConfigurations: number;
	inSect: boolean | null;
	isChartRuler: boolean;
	faceLord: Node | null;
	boundLord: Node | null;
	triplicityRole: TriplicityRole | null;
	fixedStars: Map<string, number>;
	angleProximity: AngleProximityInfo | null;
}

function computeRowData(
	node: Node,
	nodePositions: NodePositions,
	nodeVelocities: NodeVelocities,
	zodiacSignPositions: ZodiacSignPositions,
	fixedStarPositions: FixedStarPositions,
	houseCuspPositions: HouseCuspPositions | null,
	houseAngularities: (string | null)[] | null,
	aspects: Map<Aspect, Aspect[]>,
	chartRuler: Node | null,
	dignityMode: string,
	lunarNodeMode: string,
	stationaryThreshold: number,
	useExtendedDignities: boolean,
	faceMode: string,
	boundsMode: string,
	triplicityMode: string,
	useFixedStars: boolean,
	fixedStarMaximumDistance: number,
	hasSurfacePosition: boolean,
): NodeRowData {
	const sign = getSignOfNode(node, nodePositions, zodiacSignPositions);
	const positionInSign = getNodePositionWithinSign(node, nodePositions, zodiacSignPositions);

	const houseNumber = houseCuspPositions !== null
		? getHouseOfNode(node, nodePositions, houseCuspPositions)
		: null;

	const angularity = houseNumber && houseAngularities
		? houseAngularities[houseNumber - 1]
		: null;

	// Dignity
	const dignityState = getDignityState(node, nodePositions, zodiacSignPositions, dignityMode as any);
	const dignityLabel = dignityState ? ({
		[Dignity.DOMICILE]: "Dom",
		[Dignity.EXALTATION]: "Exl",
		[Dignity.DETRIMENT]: "Det",
		[Dignity.FALL]: "Fall",
		[Dignity.PEREGRINE]: "Per",
	})[dignityState.dignity] : null;

	// Speed
	const speedRadPerDay = nodeVelocities.get(node);
	const avgSpeed = getNodeAverageSpeed(node, lunarNodeMode as any);
	const isStationary = avgSpeed !== undefined && Math.abs(speedRadPerDay) < avgSpeed * stationaryThreshold;
	const isRetrograde = !isStationary && speedRadPerDay < 0;
	const speedLabel = formatAngle(Math.abs(speedRadPerDay), Math.abs(speedRadPerDay) < Math.PI / 180, true);

	// Aspects
	const filtered = filterAspectsByNode(aspects, node);
	const summary = getAspectsSummaryData(filtered);
	summary.nodes.delete(node);

	// Sect
	const inSect = hasSurfacePosition ? isInSect(node, nodePositions) : null;

	// Extended dignities
	const isRegular = zodiacSignPositions.isRegular();
	const isStandard = standardNodes.includes(node);
	const faceLord = (useExtendedDignities && isRegular)
		? getFaceLord(node, nodePositions, zodiacSignPositions, faceMode as any) : null;
	const boundLord = (useExtendedDignities && isRegular)
		? getBoundLord(node, nodePositions, zodiacSignPositions, boundsMode as any) : null;
	const triplicityRole = (useExtendedDignities && isRegular && isStandard && hasSurfacePosition)
		? getTriplicityRole(node, nodePositions, zodiacSignPositions, triplicityMode as any) : null;

	// Fixed stars
	const fixedStars = useFixedStars
		? getFixedStarsWithinLongitude(node, nodePositions, fixedStarPositions, fixedStarMaximumDistance * Math.PI / 180)
		: new Map<string, number>();

	// Angle proximity
	const angleProximity = (hasSurfacePosition && !mainAngles.includes(node))
		? getAngleProximity(node, nodePositions)
		: null;

	return {
		node, sign, positionInSign, houseNumber, angularity,
		dignityLabel, isRetrograde, isStationary, speedLabel,
		nAspects: summary.nAspects, nConfigurations: summary.nConfigurations,
		inSect, isChartRuler: node === chartRuler,
		faceLord, boundLord, triplicityRole, fixedStars, angleProximity,
	};
}


// ============================================================================
// Helpers for determining which nodes to show
// ============================================================================

function getNodesForMode(
	mode: NodesToConsider,
	selectedNodes: Set<Node>,
	hasSurfacePosition: boolean,
): Node[] {
	let nodes: Node[];
	switch (mode) {
		case NodesToConsider.STANDARD:
			nodes = [...standardNodes];
			break;
		case NodesToConsider.PHYSICAL:
			nodes = Array.from(selectedNodes)
				.filter(n => nodeTypes[n] === NodeType.BODY);
			break;
		case NodesToConsider.ALL:
			nodes = Array.from(selectedNodes);
			break;
	}

	// Always include ASC and MC if we have a surface position
	if (hasSurfacePosition) {
		if (!nodes.includes(Node.ASCENDANT)) nodes.push(Node.ASCENDANT);
		if (!nodes.includes(Node.MIDHEAVEN)) nodes.push(Node.MIDHEAVEN);
	}

	// Filter out location-dependent nodes if no surface position
	if (!hasSurfacePosition) {
		nodes = nodes.filter(n => !nodeDependsOnLocation[n]);
	}

	return nodes;
}

// ============================================================================
// Cell helper: checks if a cell is applicable for a given node
// ============================================================================

type CellApplicability = 'applicable' | 'not-applicable' | 'no-data';

function getCellApplicability(node: Node, column: string, hasSurfacePosition: boolean): CellApplicability {
	const isStandard = standardNodes.includes(node);

	switch (column) {
		case 'dignity':
		case 'face':
		case 'bound':
		case 'triplicity':
		case 'sect':
			return isStandard ? 'applicable' : 'not-applicable';
		case 'house':
			return hasSurfacePosition ? 'applicable' : 'no-data';
		case 'angleProx':
			return mainAngles.includes(node) ? 'not-applicable' : 'applicable';
		default:
			return 'applicable';
	}
}


// ============================================================================
// PlanetTable component
// ============================================================================

type PlanetTableProps = {
	nodePositions: NodePositions;
	nodeVelocities: NodeVelocities;
	zodiacSignPositions: ZodiacSignPositions;
	fixedStarPositions: FixedStarPositions;
	houseCuspPositions: HouseCuspPositions | null;
	aspects: Map<Aspect, Aspect[]>;
	onNodeClick: (node: Node) => void;
};

const ROW_H = 30;
const HEADER_H = 25;
const FEATHERX_PX = 10;
const FEATHERY_PX = 0;

// Column widths (px) — easy to tweak
const COL = {
	node: 85,
	sign: 55,
	position: 45,
	house: 65,
	dignity: 45,
	speed: 60,
	aspects: 40,
	configs: 40,
	sect: 50,
	face: 36,
	bound: 36,
	triplicity: 36,
	stars: 60,
	angleProx: 50,
};

// matches renderPrimitives.ts (not that it needs to)
const SMALL_TEXT_SIZE = 10;
const TEXT_SIZE = 12;
const SMALL_SYMBOL_SIZE = 18;
const SYMBOL_SIZE = 20;

const PlanetTable: FC<PlanetTableProps> = ({
	nodePositions,
	nodeVelocities,
	zodiacSignPositions,
	fixedStarPositions,
	houseCuspPositions,
	aspects,
	onNodeClick,
}) => {
	const dignityMode = useSettingsStore(s => s.dignityMode);
	const houseAngularityMode = useSettingsStore(s => s.houseAngularityMode);
	const lunarNodeMode = useSettingsStore(s => s.lunarNodeMode);
	const stationaryThreshold = useSettingsStore(s => s.stationarySpeedPercentageThreshold) / 100;
	const useExtendedDignities = useSettingsStore(s => s.useExtendedDignities);
	const faceMode = useSettingsStore(s => s.faceMode);
	const boundsMode = useSettingsStore(s => s.boundsMode);
	const triplicityMode = useSettingsStore(s => s.triplicityMode);
	const useFixedStars = useSettingsStore(s => s.useFixedStars);
	const fixedStarMaximumDistance = useSettingsStore(s => s.fixedStarMaximumDistance);
	const selectedNodes = useSettingsStore(s => s.selectedNodes);
	const nodesToConsider = useSettingsStore(s => s.nodesInPlanetTable);

	// render deps
	useSettingsStore(s => s.showNodeLabels);
	useSettingsStore(s => s.showSymbolLabels);

	const hasSurfacePosition = nodePositions.hasSurfacePosition();

	const chartRuler = useMemo(
		() => hasSurfacePosition ? getChartRuler(nodePositions, zodiacSignPositions, dignityMode) : null,
		[nodePositions, zodiacSignPositions, dignityMode, hasSurfacePosition]
	);

	const houseAngularities = useMemo(
		() => houseCuspPositions !== null
			? getHouseAngularities(nodePositions, houseCuspPositions, houseAngularityMode)
			: null,
		[nodePositions, houseCuspPositions, houseAngularityMode]
	);

	const nodes = useMemo(
		() => getNodesForMode(nodesToConsider, selectedNodes, hasSurfacePosition),
		[nodesToConsider, selectedNodes, hasSurfacePosition]
	);

	const rows: NodeRowData[] = useMemo(() => {
		return nodes.map(node => computeRowData(
			node, nodePositions, nodeVelocities, zodiacSignPositions,
			fixedStarPositions, houseCuspPositions, houseAngularities, aspects,
			chartRuler, dignityMode, lunarNodeMode, stationaryThreshold,
			useExtendedDignities, faceMode, boundsMode, triplicityMode,
			useFixedStars, fixedStarMaximumDistance, hasSurfacePosition,
		));
	}, [
		nodes, nodePositions, nodeVelocities, zodiacSignPositions,
		fixedStarPositions, houseCuspPositions, houseAngularities, aspects,
		chartRuler, dignityMode, lunarNodeMode, stationaryThreshold,
		useExtendedDignities, faceMode, boundsMode, triplicityMode,
		useFixedStars, fixedStarMaximumDistance, hasSurfacePosition,
	]);

	// ── Rendering helpers ──

	const cellClass = "flex items-center justify-center overflow-hidden";

	const renderInapplicableCell = (width: number) => (
		<div className={cellClass} style={{ width, height: ROW_H }}>
			<span className="text-theme-text opacity-20 text-xs">—</span>
		</div>
	);

	const renderCell = (
		content: React.ReactNode,
		width: number,
		applicability: CellApplicability = 'applicable',
		extraClass: string = '',
	) => {
		if (applicability === 'not-applicable' || applicability === 'no-data') {
			return renderInapplicableCell(width);
		}
		return (
			<div
				className={`${cellClass} ${extraClass}`}
				style={{ width, height: ROW_H }}
			>
				{content}
			</div>
		);
	};

	const HEADER_ANGLE = 0; // degrees
	const HEADER_FORWARD_DISPL = 0; // px

	const headerCell = (label: string, width: number) => (
		<div
			className="flex items-end justify-center overflow-visible"
			style={{ width, height: HEADER_H }}
		>
			<span
				className={`text-theme-text opacity-50 text-[${TEXT_SIZE}px] uppercase tracking-wider whitespace-nowrap`}
				style={{ transform: `translate(${HEADER_FORWARD_DISPL}px, 0) rotate(${HEADER_ANGLE}deg)`, transformOrigin: 'bottom left', display: 'inline-block' }}
			>
				{label}
			</span>
		</div>
	);

	// ── Determine visible columns ──

	const showHouse = houseCuspPositions !== null && hasSurfacePosition;
	const showFace = false && useExtendedDignities && zodiacSignPositions.isRegular();
	const showBound = false && useExtendedDignities && zodiacSignPositions.isRegular();
	const showTriplicity = false && useExtendedDignities && zodiacSignPositions.isRegular();
	const showStars = false && useFixedStars;
	const showAngleProx = false && hasSurfacePosition;
	const showSect = hasSurfacePosition;

	// ── Scaling: shrink uniformly if container is too narrow ──

	const naturalWidth = useMemo(() => {
		let w = COL.node + COL.sign + COL.position + COL.dignity + COL.speed + COL.aspects + COL.configs;
		if (showHouse) w += COL.house;
		if (showSect) w += COL.sect;
		if (showFace) w += COL.face;
		if (showBound) w += COL.bound;
		if (showTriplicity) w += COL.triplicity;
		if (showStars) w += COL.stars;
		if (showAngleProx) w += COL.angleProx;
		return w + FEATHERX_PX * 2;
	}, [showHouse, showSect, showFace, showBound, showTriplicity, showStars, showAngleProx]);

	const [scale, setScale] = useState(1);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const obs = new ResizeObserver(([entry]) => {
			setScale(Math.min(1, entry.contentRect.width / naturalWidth));
		});
		obs.observe(el);
		return () => obs.disconnect();
	}, [naturalWidth]);

	// ── Angularity abbreviations ──

	const angularityLabel = (ang: string | null): string | null => {
		if (ang === null) return null;
		if (ang === HouseAngularity.ANGULAR) return "Ang";
		if (ang === HouseAngularity.SUCCEDENT) return "Suc";
		if (ang === HouseAngularity.CADENT) return "Cad";
		return null;
	};

	return (
		<div ref={containerRef} className="w-full flex justify-center">
		<div
			className="bg-theme-bg/50 backdrop-blur-sm text-theme-text text-xs select-none border-y border-theme-border"
			style={{
				width: naturalWidth,
				paddingTop: FEATHERY_PX,
				paddingBottom: FEATHERY_PX,
				zoom: scale,
				maskImage: `linear-gradient(to right, transparent, black ${FEATHERX_PX}px, black calc(100% - ${FEATHERX_PX}px), transparent), linear-gradient(to bottom, transparent, black ${FEATHERY_PX}px, black calc(100% - ${FEATHERY_PX}px), transparent)`,
				maskComposite: 'intersect',
			}}
		>
			{/* Header */}
			<div className="flex border-b border-theme-border" style={{ paddingLeft: FEATHERX_PX, paddingRight: FEATHERX_PX }}>
				<div style={{ width: COL.node, height: HEADER_H }} />
				{headerCell("Sign", COL.sign)}
				{headerCell("Pos", COL.position)}
				{showHouse && headerCell("House", COL.house)}
				{headerCell("Dig", COL.dignity)}
				{headerCell("Speed", COL.speed)}
				{headerCell("#Asp", COL.aspects)}
				{headerCell("#Cfg", COL.configs)}
				{showSect && headerCell("Sect", COL.sect)}
				{showFace && headerCell("Face", COL.face)}
				{showBound && headerCell("Bnd", COL.bound)}
				{showTriplicity && headerCell("Trip", COL.triplicity)}
				{showStars && headerCell("Stars", COL.stars)}
				{showAngleProx && headerCell("Angle", COL.angleProx)}
			</div>

			{/* Rows */}
			{rows.map((row) => {
				const app = (col: string) => getCellApplicability(row.node, col, hasSurfacePosition);

				const speedClass = (row.isRetrograde || row.isStationary) ? "underline" : "";
				const speedPrefix = row.isRetrograde ? "R " : row.isStationary ? "S " : "";

				const angLabel = angularityLabel(row.angularity);

				return (
					<div
						key={row.node}
						className={`flex border-b border-theme-border/30 hover:bg-theme-text/5 cursor-pointer ${row.isChartRuler ? "bg-theme-text/[0.08]" : ""}`}
						style={{ paddingLeft: FEATHERX_PX, paddingRight: FEATHERX_PX }}
						onClick={(e) => { e.stopPropagation(); onNodeClick(row.node);}}
					>
						
						{/* Node — right-justified with solid right border */}
						<div
							style={{ width: COL.node, height: ROW_H }}
							className={`flex items-center justify-end pr-1.5 overflow-hidden border-r border-theme-border/50 ${row.isChartRuler ? "underline" : ""}`}
						>
							{renderNode(row.node, { size: SYMBOL_SIZE, fontSize: TEXT_SIZE, abbreviated: true })}
						</div>

						{/* Sign */}
						{renderCell(
							renderSign(row.sign, undefined, { size: SYMBOL_SIZE, fontSize: TEXT_SIZE, abbreviated: true }),
							COL.sign,
						)}

						{/* Position in sign */}
						{renderCell(
							renderString(formatAngle(row.positionInSign), { fontSize: TEXT_SIZE }),
							COL.position,
						)}

						{/* House + angularity */}
						{showHouse && renderCell(
							row.houseNumber !== null ? (
								<>
									{renderString(String(row.houseNumber), { fontSize: TEXT_SIZE })}
									{angLabel && (
										<>
											{renderString("\u00A0·\u00A0", { fontSize: TEXT_SIZE })}
											{renderString(angLabel, { fontSize: TEXT_SIZE })}
										</>
									)}
								</>
							) : null,
							COL.house,
							app('house'),
						)}

						{/* Dignity */}
						{renderCell(
							row.dignityLabel ? renderString(row.dignityLabel, { fontSize: TEXT_SIZE }) : null,
							COL.dignity,
							app('dignity'),
						)}

						{/* Speed */}
						{renderCell(
							<span className={speedClass}>
								{renderString(`${speedPrefix}${row.speedLabel}`, { fontSize: TEXT_SIZE })}
							</span>,
							COL.speed,
						)}

						{/* Aspects count */}
						{renderCell(
							renderString(String(row.nAspects), { fontSize: TEXT_SIZE }),
							COL.aspects,
						)}

						{/* Configurations count */}
						{renderCell(
							row.nConfigurations > 0
								? renderString(String(row.nConfigurations), { fontSize: TEXT_SIZE })
								: <span className="opacity-30">{renderString("0", { fontSize: TEXT_SIZE })}</span>,
							COL.configs,
						)}

						{/* Sect */}
						{showSect && renderCell(
							row.inSect !== null
								? renderString(row.inSect ? "In" : "Out", { fontSize: TEXT_SIZE })
								: null,
							COL.sect,
							app('sect'),
						)}

						{/* Face lord */}
						{showFace && renderCell(
							row.faceLord ? renderNode(row.faceLord, { size: SMALL_SYMBOL_SIZE, fontSize: SMALL_TEXT_SIZE }) : null,
							COL.face,
							app('face'),
						)}

						{/* Bound lord */}
						{showBound && renderCell(
							row.boundLord ? renderNode(row.boundLord, { size: SMALL_SYMBOL_SIZE, fontSize: SMALL_TEXT_SIZE }) : null,
							COL.bound,
							app('bound'),
						)}

						{/* Triplicity role */}
						{showTriplicity && renderCell(
							row.triplicityRole ? renderString(row.triplicityRole.slice(0, 3), { fontSize: TEXT_SIZE }) : null,
							COL.triplicity,
							app('triplicity'),
						)}

						{/* Fixed stars */}
						{showStars && renderCell(
							row.fixedStars.size > 0
								? renderString([...row.fixedStars.keys()].join(", "), { fontSize: SMALL_TEXT_SIZE })
								: null,
							COL.stars,
						)}

						{/* Angle proximity */}
						{showAngleProx && renderCell(
							row.angleProximity
								? renderString(
									`${renderNode(row.angleProximity.closestAngle, { size: 12, fontSize: 8 }) ? '' : ''}${formatAngle(row.angleProximity.distance)}`,
									{ fontSize: SMALL_TEXT_SIZE }
								)
								: null,
							COL.angleProx,
							app('angleProx'),
						)}
					</div>
				);
			})}
		</div>
		</div>
	);
};

export default PlanetTable;
