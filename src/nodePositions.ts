import { normalizeAngleRad } from './util.ts'
import { classicalRulerships, modernRulerships, Node, type SurfacePosition } from './astroDefs.ts'
import { LunarNodeMode, HamburgSchoolMode } from './settingsDefs.ts'
import { computeAllSignificantPoints } from './geometry.ts'
import { smallBodyParams, hamburgSchoolParamsNeely, hamburgSchoolParamsWitte } from './astroFromOrbitalParams.ts'
import {
	orbitalParamsToGeocentricLongitude, nodeToBody, bodyToGeocentricLongitude,
	getTodayEclipticLongitudeFromEQJ,
	computeLunarApogeePerigeeMeeus, computeLunarApogeePerigeeExact,
	computeLunarNodesMeeus, computeLunarNodesExact
} from './astronomyUtil.ts'
import HouseCuspPositions from './houseCuspPositions.ts'
import ZodiacSignPositions from './zodiacSignPositions.ts'
import { DignityMode } from './settingsDefs.ts'


// nulls indicate we no longer have a position => should delete from map
type PositionsUpdate = Map<Node, number | null>

// the deleting is handled by:
function resolvePositionsUpdate(positionsUpdate: PositionsUpdate) {
	const result = new Map<Node, number>();
	for (const [node, value] of positionsUpdate){
		if (value !== null) {
			result.set(node, value);
		}
	}
	return result;
}

// LunarNodeMode dispatchers

function computeLunarApogeePerigee(date: Date, lunarNodeMode: LunarNodeMode): PositionsUpdate{
	if (lunarNodeMode == LunarNodeMode.MEAN) {
		return computeLunarApogeePerigeeMeeus(date);
	} else {
		return computeLunarApogeePerigeeExact(date);
	}
}

function computeLunarNodes(date: Date, lunarNodeMode: LunarNodeMode): PositionsUpdate{
	if (lunarNodeMode == LunarNodeMode.MEAN) {
		return computeLunarNodesMeeus(date);
	} else {
		return computeLunarNodesExact(date);
	}
}

// Position computation functions

function computeAxisAngles(date: Date, surfacePos: SurfacePosition): PositionsUpdate {
	const { asc, mc, vx } = computeAllSignificantPoints(date, surfacePos);

	const ascLon = getTodayEclipticLongitudeFromEQJ(date, asc);
	const mcLon = getTodayEclipticLongitudeFromEQJ(date, mc);
	const vxLon = getTodayEclipticLongitudeFromEQJ(date, vx);

	return new Map<Node, number>([
		[Node.ASCENDANT, normalizeAngleRad(ascLon)],
		[Node.DESCENDANT, normalizeAngleRad(ascLon + Math.PI)],
		[Node.MIDHEAVEN, normalizeAngleRad(mcLon)],
		[Node.IMUM_COELI, normalizeAngleRad(mcLon + Math.PI)],
		[Node.VERTEX, normalizeAngleRad(vxLon)],
		[Node.ANTIVERTEX, normalizeAngleRad(vxLon + Math.PI)],
	]);
}

function computeEquinoxes(): PositionsUpdate {
	return new Map<Node, number>([
		[Node.VERNAL_EQUINOX, 0],
		[Node.AUTUMNAL_EQUINOX, Math.PI]
	]);
}

function computePhysicalNodePositions(date: Date): PositionsUpdate {
	const nodeAngles = new Map<Node, number>();
	for ( const [node, body] of Object.entries(nodeToBody)) {
		const lon = bodyToGeocentricLongitude(body, date);
		nodeAngles.set(node as Node, lon);
	}
	return nodeAngles;
}

function computeSmallObjectPositions(date: Date): PositionsUpdate {
	const nodeAngles = new Map<Node, number>();

	for (const [node, params] of Object.entries(smallBodyParams)) {
		const lon = orbitalParamsToGeocentricLongitude(params, date);
		nodeAngles.set(node as Node, lon);
	}

	return nodeAngles;
}

function computeHamburgSchoolObjectPositions(date: Date, hamburgSchoolMode: HamburgSchoolMode): PositionsUpdate {
	const nodeAngles = new Map<Node, number>();

	const hamburgSchoolParams = hamburgSchoolMode == HamburgSchoolMode.NEELY ? hamburgSchoolParamsNeely : hamburgSchoolParamsWitte;
	for (const [node, params] of Object.entries(hamburgSchoolParams)) {
		const lon = orbitalParamsToGeocentricLongitude(params, date);
		nodeAngles.set(node as Node, lon);
	}

	return nodeAngles;
}

function computeHighDependencyArabicPartPositions(
	nodePositions: Map<Node, number>,
	houseCuspPositions: HouseCuspPositions | null,
	zodiacSignPositions: ZodiacSignPositions,
	dignityMode: DignityMode,
): PositionUpdate {

	if (houseCuspPositions === null){
		return new Map <Node, number>([
			[Node.PART_OF_WEALTH, null],
			[Node.PART_OF_DEATH, null],
		]);
	}
	const asc = nodePositions.get(Node.ASCENDANT)!;
	const sun = nodePositions.get(Node.SUN)!;
	const d = normalizeAngleRad(sun-asc);
	const dayBirth = d > Math.PI;
	const f = dayBirth ? 1 : -1;
	
	const hc2 = houseCuspPositions.getCuspPosition(2);
	const hc8 = houseCuspPositions.getCuspPosition(8);
	const hc2sign = zodiacSignPositions.getSignAtLongitude(hc2);
	const rulerships = dignityMode === DignityMode.CLASSICAL ? classicalRulerships : modernRulerships;
	const hc2ruler = nodePositions.get(rulerships[hc2sign])!;
	
	return new Map <Node, number>([
		[Node.PART_OF_WEALTH, asc + f*(hc2 - hc2ruler)],
		[Node.PART_OF_DEATH, nodePositions.get(Node.SATURN)! + f*(hc8 - nodePositions.get(Node.MOON)!)],
	]);
}
	

function computeArabicPartPositions(
	nodePositions: Map<Node, number>,
	houseCuspPositions: HouseCuspPositions | null,
	zodiacSignPositions: ZodiacSignPositions,
	dignityMode: DignityMode,
): PositionsUpdate {
	const asc = nodePositions.get(Node.ASCENDANT)!;
	const sun = nodePositions.get(Node.SUN)!;
	const d = normalizeAngleRad(sun-asc);
	const dayBirth = d > Math.PI;
	const f = dayBirth ? 1 : -1;
	
	const fortune = asc + f*(nodePositions.get(Node.MOON)! - nodePositions.get(Node.SUN)!);
	const spirit = asc + f*(nodePositions.get(Node.SUN)! - nodePositions.get(Node.MOON)!);
	
	return new Map <Node, number>([
		[Node.PART_OF_FORTUNE, fortune],
		[Node.PART_OF_SPIRIT, spirit],
		
		[Node.PART_OF_EROS, asc + f*(spirit - fortune)], //Dorotheus of Sidon formula used (as opposed to Paulus of Alexandria)
		[Node.PART_OF_NECESSITY, asc + f*(fortune - nodePositions.get(Node.MERCURY)!)],
		[Node.PART_OF_COURAGE, asc + f*(fortune - nodePositions.get(Node.MARS)!)],
		[Node.PART_OF_VICTORY, asc + f*(nodePositions.get(Node.JUPITER)! - spirit)],
		[Node.PART_OF_NEMESIS, asc + f*(fortune - nodePositions.get(Node.SATURN)!)],
		
		[Node.PART_OF_MARRIAGE_MEN, asc + f*(nodePositions.get(Node.VENUS)! - nodePositions.get(Node.SATURN)!)],
		[Node.PART_OF_MARRIAGE_WOMEN, asc + f*(nodePositions.get(Node.SATURN)! - nodePositions.get(Node.VENUS)!)],
		[Node.PART_OF_CHILDREN, asc + f*(nodePositions.get(Node.SATURN)! - nodePositions.get(Node.JUPITER)!)],
		...computeHighDependencyArabicPartPositions(nodePositions, houseCuspPositions, zodiacSignPositions, dignityMode),
		
		[Node.PART_OF_FATHER, asc + f*(nodePositions.get(Node.SATURN)! - nodePositions.get(Node.SUN)!)],
		[Node.PART_OF_MOTHER, asc + f*(nodePositions.get(Node.MOON)! - nodePositions.get(Node.VENUS)!)],
	]);
}

function computeAllNodePositionsWithoutSurfacePosition(
	date: Date,
	lunarNodeMode: LunarNodeMode,
	hamburgSchoolMode: HamburgSchoolMode
): PositionsUpdate{
	return new Map<Node, number>([
		...computePhysicalNodePositions(date),
		...computeSmallObjectPositions(date),
		...computeHamburgSchoolObjectPositions(date, hamburgSchoolMode),
		...computeLunarNodes(date, lunarNodeMode),
		...computeLunarApogeePerigee(date, lunarNodeMode),
		...computeEquinoxes(),
	]);
}

function computeAllNodePositions(
	date: Date,
	surfacePosition: SurfacePosition,
	lunarNodeMode: LunarNodeMode,
	hamburgSchoolMode: HamburgSchoolMode,
	houseCuspPositions: HouseCuspPositions | null,
	zodiacSignPositions: ZodiacSignPositions,
	dignityMode: DignityMode,
): PositionsUpdate{
	let positions = new Map<Node, number>([
		...computeAllNodePositionsWithoutSurfacePosition(date, lunarNodeMode, hamburgSchoolMode),
		...computeAxisAngles(date, surfacePosition),
	]);
	positions = new Map<Node, number>([
		...positions,
		...computeArabicPartPositions(positions, houseCuspPositions, zodiacSignPositions, dignityMode),
	]);
	return positions;
}


// ============================================================================
// NodePositions class
// ============================================================================

interface NodePositionsConstructorArgs {
	date: Date;
	surfacePosition: SurfacePosition | null;
	lunarNodeMode: LunarNodeMode;
	hamburgSchoolMode: HamburgSchoolMode;
	houseCuspPositions: HouseCuspPositions | null;
	zodiacSignPositions: ZodiacSignPositions;
	dignityMode: DignityMode;
	positions: Map<Node, number>;
}

class NodePositions {
	// dependencies
	private readonly _date: Date;
	private readonly _surfacePosition: SurfacePosition | null;
	private readonly _lunarNodeMode: LunarNodeMode;
	private readonly _hamburgSchoolMode: HamburgSchoolMode;
	// these just for the part of wealth & friend
	private readonly _houseCuspPositions: HouseCuspPositions | null;
	private readonly _zodiacSignPositions: ZodiacSignPositions;
	private readonly _dignityMode: DignityMode;
	
	// actual state
	private readonly _positions: Map<Node, number>;

	constructor(config: NodePositionsConstructorArgs) {
		this._date = config.date;
		this._surfacePosition = config.surfacePosition;
		this._lunarNodeMode = config.lunarNodeMode;
		this._hamburgSchoolMode = config.hamburgSchoolMode;
		this._houseCuspPositions = config.houseCuspPositions;
		this._zodiacSignPositions = config.zodiacSignPositions;
		this._dignityMode = config.dignityMode;
		this._positions = config.positions;
	}

	static create(
		date: Date,
		surfacePosition: SurfacePosition | null,
		lunarNodeMode: LunarNodeMode,
		hamburgSchoolMode: HamburgSchoolMode,
		houseCuspPositions: HouseCuspPositions | null,
		zodiacSignPositions: ZodiacSignPositions,
		dignityMode: DignityMode,
	): NodePositions {
		
		const positions = resolvePositionsUpdate(
			surfacePosition === null ? (
				computeAllNodePositionsWithoutSurfacePosition(
					date, lunarNodeMode, hamburgSchoolMode
				)
			) : (
				computeAllNodePositions(
					date, surfacePosition, lunarNodeMode, hamburgSchoolMode,
					houseCuspPositions, zodiacSignPositions, dignityMode
				)
			)
		);
			
		return new NodePositions({
			date, surfacePosition, lunarNodeMode, hamburgSchoolMode,
			houseCuspPositions, zodiacSignPositions, dignityMode, positions
		});
	}

	private copyWith(updates: Partial<NodePositionsConstructorArgs>): NodePositions {
		return new NodePositions({
			...this.getParams(),
			positions: this._positions,
			...updates
		});
	}

	public changeLunarNodeMode(newMode: LunarNodeMode): NodePositions {
		if (newMode == this._lunarNodeMode) {
			return this;
		}
		const newLunarNodePositions = computeLunarNodes(this._date, newMode);
		const newLilithSelenePositions = computeLunarApogeePerigee(this._date, newMode);
		const newPositions = new Map<Node, number>([...this._positions, ...newLunarNodePositions, ...newLilithSelenePositions]);
		return this.copyWith({ lunarNodeMode: newMode, positions: resolvePositionsUpdate(newPositions) });
	}

	public changeHamburgSchoolMode(newMode: HamburgSchoolMode): NodePositions {
		if (newMode == this._hamburgSchoolMode) {
			return this;
		}
		const newHamburgSchoolObjectPositions = computeHamburgSchoolObjectPositions(this._date, newMode);
		const newPositions = new Map<Node, number>([...this._positions, ...newHamburgSchoolObjectPositions]);
		return this.copyWith({ hamburgSchoolMode: newMode, positions: resolvePositionsUpdate(newPositions) });
	}

	public changeHouseCuspPositions(houseCuspPositions: HouseCuspPositions | null): NodePositions {
		const newPositions = new Map<Node, number>([
			...this._positions,
			...computeHighDependencyArabicPartPositions(this._nodePositions, houseCuspPositions, this._zodiacSignPositions, this._dignityMode),
		]);
		return this.copyWith({ houseCuspPositions, positions: resolvePositionsUpdate(newPositions) });
	}

	public changeZodiacSignPositionsAndHouseCuspPositions(
		zodiacSignPositions: ZodiacSignPositions,
		houseCuspPositions: HouseCuspPositions | null
	): NodePositions {
		const newPositions = new Map<Node, number>([
			...this._positions,
			...computeHighDependencyArabicPartPositions(this._nodePositions, houseCuspPositions, zodiacSignPositions, this._dignityMode),
		]);
		return this.copyWith({ zodiacSignPositions, houseCuspPositions, positions: resolvePositionsUpdate(newPositions) });
	}

	public changeDignityMode(dignityMode: DignityMode): NodePositions {
		const newPositions = new Map<Node, number>([
			...this._positions,
			...computeHighDependencyArabicPartPositions(this._nodePositions, this._houseCuspPositions, this._zodiacSignPositions, dignityMode),
		]);
		return this.copyWith({ dignityMode, positions: resolvePositionsUpdate(newPositions) });
	}

	public getPositions(): Map<Node, number> {
		return this._positions;
	}

	public get(node: Node): number {
		const a = this._positions.get(node);
		if (a === undefined) { throw new Error(`get called for absent node: ${node}`); }
		return a;
	}

	public has(node: Node): boolean {
		return this._positions.has(node);
	}

	public hasSurfacePosition(): boolean {
		return this._surfacePosition !== null;
	}

	public getParams(): { date: Date, surfacePosition: SurfacePosition | null, lunarNodeMode: LunarNodeMode, hamburgSchoolMode: HamburgSchoolMode } {
		return {
			date: this._date,
			surfacePosition: this._surfacePosition,
			lunarNodeMode: this._lunarNodeMode,
			hamburgSchoolMode: this._hamburgSchoolMode,
			houseCuspPositions: this._houseCuspPositions,
			zodiacSignPositions: this._zodiacSignPositions,
			dignityMode: this._dignityMode,
		};
	}
}

export default NodePositions;
