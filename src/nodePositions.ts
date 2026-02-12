import { normalizeAngleRad } from './util.ts'
import { Node, type SurfacePosition } from './astroDefs.ts'
import { LunarNodeMode, HamburgSchoolMode } from './settingsDefs.ts'
import { computeAllSignificantPoints } from './geometry.ts'
import { smallBodyParams, hamburgSchoolParamsNeely, hamburgSchoolParamsWitte } from './astroFromOrbitalParams.ts'
import {
	orbitalParamsToGeocentricLongitude, nodeToBody, bodyToGeocentricLongitude,
	getTodayEclipticLongitudeFromEQJ,
	computeLunarApogeePerigeeMeeus, computeLunarApogeePerigeeExact,
	computeLunarNodesMeeus, computeLunarNodesExact
} from './astronomyUtil.ts'

// LunarNodeMode dispatchers

function computeLunarApogeePerigee(date: Date, lunarNodeMode: LunarNodeMode): Map<Node, number>{
	if (lunarNodeMode == LunarNodeMode.MEAN) {
		return computeLunarApogeePerigeeMeeus(date);
	} else {
		return computeLunarApogeePerigeeExact(date);
	}
}

function computeLunarNodes(date: Date, lunarNodeMode: LunarNodeMode): Map<Node, number>{
	if (lunarNodeMode == LunarNodeMode.MEAN) {
		return computeLunarNodesMeeus(date);
	} else {
		return computeLunarNodesExact(date);
	}
}

// Position computation functions

function computeAxisAngles(date: Date, surfacePos: SurfacePosition): Map<Node, number> {
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

function computeEquinoxes(): Map<Node, number> {
	return new Map<Node, number>([
		[Node.VERNAL_EQUINOX, 0],
		[Node.AUTUMNAL_EQUINOX, Math.PI]
	]);
}

function computePhysicalNodePositions(date: Date): Map<Node, number> {
	const nodeAngles = new Map<Node, number>();
	for ( const [node, body] of Object.entries(nodeToBody)) {
		const lon = bodyToGeocentricLongitude(body, date);
		nodeAngles.set(node as Node, lon);
	}
	return nodeAngles;
}

function computeSmallObjectPositions(date: Date): Map<Node, number> {
	const nodeAngles = new Map<Node, number>();

	for (const [node, params] of Object.entries(smallBodyParams)) {
		const lon = orbitalParamsToGeocentricLongitude(params, date);
		nodeAngles.set(node as Node, lon);
	}

	return nodeAngles;
}

function computeHamburgSchoolObjectPositions(date: Date, hamburgSchoolMode: HamburgSchoolMode): Map<Node, number> {
	const nodeAngles = new Map<Node, number>();

	const hamburgSchoolParams = hamburgSchoolMode == HamburgSchoolMode.NEELY ? hamburgSchoolParamsNeely : hamburgSchoolParamsWitte;
	for (const [node, params] of Object.entries(hamburgSchoolParams)) {
		const lon = orbitalParamsToGeocentricLongitude(params, date);
		nodeAngles.set(node as Node, lon);
	}

	return nodeAngles;
}

function computeArabicPartPositions(nodePositions: Map<Node, number>): Map<Node, number> {
	const asc = nodePositions.get(Node.ASCENDANT)!;
	const sun = nodePositions.get(Node.SUN)!;
	const d = normalizeAngleRad(sun-asc);
	const dayBirth = d > Math.PI;
	const f = dayBirth ? 1 : -1;
	//source: https://horoscopes.astro-seek.com/astrology-arabic-lots-list
	// there's a bajillion of these. I see two ideas:
	// - just the part of fortune. that's basic.
	// - all of them, with some complicated filters to include them by source/category/etc.
	// I don't think there's a midpoint between the two.
	// let's just leave the PoF for now and look into the other stuff later down the line.

	// oh, and this will depend on house cusps eventually, so we'll need to move things around a bit.
	// this will probably go in its own file, anyway.
	return new Map <Node, number>([
		[Node.PART_OF_FORTUNE, asc + f*(nodePositions.get(Node.MOON)! - nodePositions.get(Node.SUN)!)],
		//[Node.PART_OF_SPIRIT, asc + f*(nodePositions.get(Node.SUN) - nodePositions.get(Node.MOON))],
		//[Node.PART_OF_LOVE, asc + f*(nodePositions.get(Node.VENUS) - nodePositions.get(Node.SUN))],
		//[Node.PART_OF_MARRIAGE, asc + f*(nodePositions.get(Node.DESCENDANT) - nodePositions.get(Node.VENUS))],
		//[Node.PART_OF_NECESSITY, asc + f*(nodePositions.get(Node.SATURN) - nodePositions.get(Node.MOON))],

		//Dubious. Source notes same formula for parts of: commerce, communication, slaves 4b, vitality
		//[Node.PART_OF_CAREER, asc + f*(nodePositions.get(Node.MERCURY) - nodePositions.get(Node.SUN))],

		// first source said courage = mars - sun. not in main source, equals:
		// commerce (jacobson), conquest, deceit, destruction(jones), dignity B, enemies (olympiodorus B), fire, lost animal, passion, sowing, travel (firmicus), wheat
		// okay.
		// [Node.PART_OF_COURAGE, asc + f*(nodePositions.get(Node.MARS) - nodePositions.get(Node.SUN))],

		//[Node.PART_OF_LONGEVITY, asc + f*(nodePositions.get(Node.MOON) - nodePositions.get(Node.JUPITER))],
		//[Node.PART_OF_DEATH, asc + f*(houseCusps[7] - nodePositions.get(Node.MOON))], //8th cusp
	]);
}

function computeAllNodePositionsWithoutSurfacePosition(
	date: Date,
	lunarNodeMode: LunarNodeMode,
	hamburgSchoolMode: HamburgSchoolMode
): Map<Node, number>{
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
	hamburgSchoolMode: HamburgSchoolMode
): Map<Node, number>{
	let positions = new Map<Node, number>([
		...computeAllNodePositionsWithoutSurfacePosition(date, lunarNodeMode, hamburgSchoolMode),
		...computeAxisAngles(date, surfacePosition),
	]);
	positions = new Map<Node, number>([
		...positions,
		...computeArabicPartPositions(positions),
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
	positions?: Map<Node, number>;
}

class NodePositions {
	private readonly _date: Date;
	private readonly _surfacePosition: SurfacePosition | null;
	private readonly _lunarNodeMode: LunarNodeMode;
	private readonly _hamburgSchoolMode: HamburgSchoolMode;
	private readonly _positions: Map<Node, number>;

	constructor(config: NodePositionsConstructorArgs) {
		this._date = config.date;
		this._surfacePosition = config.surfacePosition;
		this._lunarNodeMode = config.lunarNodeMode;
		this._hamburgSchoolMode = config.hamburgSchoolMode;

		if (config.positions !== undefined) {
			this._positions = config.positions;
		} else if (this._surfacePosition !== null) {
			this._positions = computeAllNodePositions(
				this._date, this._surfacePosition, this._lunarNodeMode, this._hamburgSchoolMode
			);
		} else {
			this._positions = computeAllNodePositionsWithoutSurfacePosition(
				this._date, this._lunarNodeMode, this._hamburgSchoolMode
			);
		}
	}

	static create(
		date: Date,
		surfacePosition: SurfacePosition | null,
		lunarNodeMode: LunarNodeMode,
		hamburgSchoolMode: HamburgSchoolMode
	): NodePositions {
		return new NodePositions({ date, surfacePosition, lunarNodeMode, hamburgSchoolMode });
	}

	private copyWith(updates: Partial<NodePositionsConstructorArgs>): NodePositions {
		return new NodePositions({
			date: this._date,
			surfacePosition: this._surfacePosition,
			lunarNodeMode: this._lunarNodeMode,
			hamburgSchoolMode: this._hamburgSchoolMode,
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
		return this.copyWith({ lunarNodeMode: newMode, positions: newPositions });
	}

	public changeHamburgSchoolMode(newMode: HamburgSchoolMode): NodePositions {
		if (newMode == this._hamburgSchoolMode) {
			return this;
		}
		const newHamburgSchoolObjectPositions = computeHamburgSchoolObjectPositions(this._date, newMode);
		const newPositions = new Map<Node, number>([...this._positions, ...newHamburgSchoolObjectPositions]);
		return this.copyWith({ hamburgSchoolMode: newMode, positions: newPositions });
	}

	public getPositions(): Map<Node, number> {
		return this._positions;
	}

	public get(node: Node): number {
		const a = this._positions.get(node);
		if (a === undefined) { throw new Error(`get called for absent node: ${node}`); }
		return a;
	}

	public hasSurfacePosition(): boolean {
		return this._surfacePosition !== null;
	}

	public getParams(): { date: Date, surfacePosition: SurfacePosition | null, lunarNodeMode: LunarNodeMode, hamburgSchoolMode: HamburgSchoolMode } {
		return { date: this._date, surfacePosition: this._surfacePosition, lunarNodeMode: this._lunarNodeMode, hamburgSchoolMode: this._hamburgSchoolMode };
	}
}

export default NodePositions;
