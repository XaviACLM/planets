import { Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, Vector, AstroTime, RotateVector, Rotation_EQJ_ECT } from "astronomy-engine";

import { normalizeAngleRad } from './util.ts'
import { computeHouseCuspPositions, HouseSystem, AyanamsaDependantHouseSystems } from './houses.ts'
import { smallBodyParams, orbitalLongitude, hamburgSchoolParamsNeely, hamburgSchoolParamsWitte} from './astroFromOrbitalParams.ts'
import { AstrologyMode, Node, type SurfacePosition, LunarNodeMode, HamburgSchoolMode } from './astroDefs.ts'
import { type vec3, toAstronomyVector, computeAllSignificantPoints } from './geometry.ts'


// https://storage.yandexcloud.net/j108/library/tzubx8h2/Buz_Overbeck_-_Ayanamsa_-_A_Statistical_Study.pdf
// https://iphemeris.com/blog/document/ayanamsa
// those missing from the code in scripts, pulling swissephemeris data
const Ayanamsas: Partial<Record<AstrologyMode, number>> = {
	// in J2000 ecliptic longitude
	[AstrologyMode.SIDEREAL_LAHIRI] : 23.8531,
	[AstrologyMode.SIDEREAL_FAGAN_BRADLEY] : 24.7367,
	[AstrologyMode.SIDEREAL_RAMAN] : 22.4069, 
	[AstrologyMode.SIDEREAL_KRISHNAMURTI] : 23.7619,
	[AstrologyMode.SIDEREAL_YUKTESHWAR] : 22.4778,
	[AstrologyMode.SIDEREAL_DE_LUCE] : 27.8056,
	[AstrologyMode.SIDEREAL_HIPPARCHOS] : 20.2461,
	[AstrologyMode.SIDEREAL_BABYLONIAN] : 24.7867,
	[AstrologyMode.SIDEREAL_HUBER] : 24.7336,
	[AstrologyMode.SIDEREAL_SURYASIDDHANTA] : 20.8950,
	[AstrologyMode.SIDEREAL_TRUE_CITRA] : 23.8400,
	[AstrologyMode.SIDEREAL_TRUE_REVANTI] : 20.0451,
}

function computeLunarApogeePerigeeMeeus(date: Date): Map<Node, number> {
    const jd = (date.getTime() / 86400000) + 2440587.5;
    const t = (jd - 2451545.0) / 36525.0;
    
    // again Meeus Ch. 47
    const omega = 83.3532465 + 4069.0137287 * t - 0.0103200 * t*t - (t*t*t)/80053;
    const perigee = (omega % 360) * Math.PI / 180;
    
    return new Map<Node, number>([
        [Node.LUNAR_PERIGEE, normalizeAngleRad(perigee)],
        [Node.LUNAR_APOGEE, normalizeAngleRad(perigee + Math.PI)]
    ]);
}

function computeLunarApogeePerigeeExact(date: Date): Map<Node, number> {
    const s = GeoMoonState(date);
    
    const GM = 8.887692587023177e-10;  // earth's gravitational parameter in AU^3 / day^2
    const r = Math.sqrt(s.x*s.x + s.y*s.y + s.z*s.z);
    
    // angular momentum
    const h = {
        x: s.y * s.vz - s.z * s.vy,
        y: s.z * s.vx - s.x * s.vz,
        z: s.x * s.vy - s.y * s.vx
    };
    
    // eccentricity vector points toward perigee
    const rVec = {x: s.x, y: s.y, z: s.z};
    const vVec = {x: s.vx, y: s.vy, z: s.vz};
    
    // e = (v x h)/GM - r/mod(r)
    const vxh = {
        x: vVec.y * h.z - vVec.z * h.y,
        y: vVec.z * h.x - vVec.x * h.z,
        z: vVec.x * h.y - vVec.y * h.x
    };
    const e = {
        x: vxh.x/GM - rVec.x/r,
        y: vxh.y/GM - rVec.y/r,
        z: vxh.z/GM - rVec.z/r,
		t: MakeTime(date)
    };
    
	
    const eEcl = Ecliptic(new Vector(e.x, e.y, e.z, e.t)).vec;
    const omega = Math.atan2(eEcl.y, eEcl.x);
    
    return new Map<Node, number>([
        [Node.LUNAR_PERIGEE, normalizeAngleRad(omega)],
        [Node.LUNAR_APOGEE, normalizeAngleRad(omega + Math.PI)]
    ]);
}

function computeLunarApogeePerigee(date: Date, lunarNodeMode: LunarNodeMode): Map<Node, number>{
	if (lunarNodeMode == LunarNodeMode.MEAN) {
		return computeLunarApogeePerigeeMeeus(date);
	} else {
		return computeLunarApogeePerigeeExact(date);
	}
}

function computeLunarNodesMeeus(date: Date): Map<Node, number> {
	const jd = (date.getTime() / 86400000) + 2440587.5; // Unix ms -> JD
	const t = (jd - 2451545.0) / 36525.0;

	// Meeus Ch. 47: mean longitude of ascending node of lunar orbit
	const omega = 125.04452 - 1934.136261 * t + 0.0020708 * t*t + (t*t*t)/450000; // small correction

	const ascending = (omega)/360*2*Math.PI;
	
	return new Map <Node, number>([
		[Node.LUNAR_ASCENDING, normalizeAngleRad(ascending)],
		[Node.LUNAR_DESCENDING, normalizeAngleRad(ascending + Math.PI)]
	]);
}

function computeLunarNodesExact(date: Date): Map<Node, number>{
	
	const s = GeoMoonState(date);
	
	const r = { x: s.x, y: s.y, z: s.z };
	const v = { x: s.vx, y: s.vy, z: s.vz };
	const h = {
		x: r.y * v.z - r.z * v.y,
		y: r.z * v.x - r.x * v.z,
		z: r.x * v.y - r.y * v.x,
		t: new AstroTime(date)
	};
	
	const hEcl = Ecliptic(new Vector(h.x, h.y, h.z, h.t)).vec; // { x, y, z } in ecliptic frame
	const omega = Math.atan2(hEcl.x, -hEcl.y);
	return new Map <Node, number>([
		[Node.LUNAR_ASCENDING, normalizeAngleRad(omega)],
		[Node.LUNAR_DESCENDING, normalizeAngleRad(omega + Math.PI)]
	]);
	
}

function computeLunarNodes(date: Date, lunarNodeMode: LunarNodeMode): Map<Node, number>{
	if (lunarNodeMode == LunarNodeMode.MEAN) {
		return computeLunarNodesMeeus(date);
	} else {
		return computeLunarNodesExact(date);
	}
}

function getTodayEclipticLongitudeFromEQJ(date: Date, v: vec3): number {
	const astroTime = new AstroTime(date);
	const vECT = RotateVector(Rotation_EQJ_ECT(astroTime), toAstronomyVector(v));
	return Math.atan2(vECT.y, vECT.x);
}

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

export function computeEquinoxes(): Map<Node, number> {
	return new Map<Node, number>([
		[Node.VERNAL_EQUINOX, 0],
		[Node.AUTUMNAL_EQUINOX, Math.PI]
	]);
}

// for the astronomy engine
const nodeToBody: Partial<Record<Node, Body>> = {
	[Node.SUN]: Body.Sun,
	[Node.MOON]: Body.Moon,
	[Node.MERCURY]: Body.Mercury,
	[Node.VENUS]: Body.Venus,
	[Node.MARS]: Body.Mars,
	[Node.JUPITER]: Body.Jupiter,
	[Node.SATURN]: Body.Saturn,
	[Node.URANUS]: Body.Uranus,
	[Node.NEPTUNE]: Body.Neptune,
	[Node.PLUTO]: Body.Pluto,
};

function computePhysicalNodePositions(date: Date): Map<Node, number> {
	
	const correctForAberration = true;
	
	const nodeAngles = new Map<Node, number>();
		
	for ( const [node, body] of Object.entries(nodeToBody)) {
		
		//returns geocentric EQJ2000 vector. also stores date
		const eqj = GeoVector(body, date, correctForAberration)
		
		// accepts EQJ2000 vector w date and turns into ECT (ecliptic of date)
		const etc = Ecliptic(eqj);
		
		nodeAngles.set(node as Node, (etc.elon)/360*2*Math.PI);
	}
	
	return nodeAngles;
}

function computeSmallObjectPositions(date: Date): Map<Node, number> {
	const nodeAngles = new Map<Node, number>();
		
	for ( const [node, params] of Object.entries(smallBodyParams)) {
		const lonDeg = orbitalLongitude(params, date);
		nodeAngles.set(node as Node, lonDeg*Math.PI/180);
	}
	
	return nodeAngles;	
}

function computeHamburgSchoolObjectPositions(date: Date, hamburgSchoolMode: HamburgSchoolMode): Map<Node, number> {
	const nodeAngles = new Map<Node, number>();
	
	const hamburgSchoolParams = hamburgSchoolMode == HamburgSchoolMode.NEELY ? hamburgSchoolParamsNeely : hamburgSchoolParamsWitte;
	for ( const [node, params] of Object.entries(hamburgSchoolParams)) {
		const lonDeg = orbitalLongitude(params, date);
		nodeAngles.set(node as Node, lonDeg*Math.PI/180);
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
	let nodePositions = new Map<Node, number>([
		...computeAllNodePositionsWithoutSurfacePosition(date, lunarNodeMode, hamburgSchoolMode),
		...computeAxisAngles(date, surfacePosition),
	]);
	nodePositions = new Map<Node, number>([
		...nodePositions,
		...computeArabicPartPositions(nodePositions),
	]);
	return nodePositions;
}

function computeSiderealOffset(date: Date, astrologyMode: AstrologyMode): number {
	if (astrologyMode === AstrologyMode.TROPICAL) { return 0; }
	
	const ayanamsaJ2000 = Ayanamsas[astrologyMode]!;
	
	const degPerSecondPrecession = 4.426734852389845e-10;
	const j2000InMillis = Date.UTC(2000, 0, 1, 12, 0, 0);
	
	//getTime will count leap seconds, but the difference is negligible
	const delta = (date.getTime() - j2000InMillis) / 1000;
	const ayanamsaNow = ayanamsaJ2000 + degPerSecondPrecession * delta;
	
	return ayanamsaNow * Math.PI / 180;
}

interface ZodiacPositionsConstructorArgs {
	date: Date;
	surfacePosition: SurfacePosition | null;
	lunarNodeMode: LunarNodeMode;
	houseSystem: HouseSystem;
	astrologyMode: AstrologyMode;
	hamburgSchoolMode: HamburgSchoolMode;
	nodePositions?: Map<Node, number>;
	houseCuspPositions?: number[] | null;
	siderealOffset?: number;
}

export class ZodiacPositions {
	private readonly _nodePositions: Map<Node, number>;
	private readonly _houseCuspPositions: number[] | null;
	
	public readonly date: Date;
	public readonly surfacePosition: SurfacePosition | null;
	public readonly lunarNodeMode: LunarNodeMode;
	public readonly houseSystem: HouseSystem;
	public readonly siderealOffset: number;
	public readonly astrologyMode: AstrologyMode;
	public readonly hamburgSchoolMode: HamburgSchoolMode;
	
	constructor( config: ZodiacPositionsConstructorArgs ){
		this.surfacePosition = config.surfacePosition;
		this.date = config.date;
		this.lunarNodeMode = config.lunarNodeMode;
		this.houseSystem = config.houseSystem;
		this.astrologyMode = config.astrologyMode;
		this.hamburgSchoolMode = config.hamburgSchoolMode;
		
		if (config.siderealOffset) {
			this.siderealOffset = config.siderealOffset;
		} else {
			this.siderealOffset = computeSiderealOffset(this.date, this.astrologyMode);
		}
		
		if (config.nodePositions) {
			this._nodePositions = config.nodePositions;
			this._houseCuspPositions = config.houseCuspPositions || null;
		} else if (this.surfacePosition !== null) {
			this._nodePositions = computeAllNodePositions(this.date, this.surfacePosition, this.lunarNodeMode, this.hamburgSchoolMode);
			this._houseCuspPositions = computeHouseCuspPositions(this.date, this.surfacePosition, this.houseSystem, this._nodePositions, this.siderealOffset);
		} else {
			this._nodePositions = computeAllNodePositionsWithoutSurfacePosition(this.date, this.lunarNodeMode, this.hamburgSchoolMode);
			this._houseCuspPositions = null;
		}
	}
	
	static create(
		date: Date,
		surfacePosition: SurfacePosition | null,
		lunarNodeMode: LunarNodeMode,
		houseSystem: HouseSystem,
		astrologyMode: AstrologyMode,
		hamburgSchoolMode: HamburgSchoolMode,
	): ZodiacPositions {
		return new ZodiacPositions({
			date,
			surfacePosition,
			lunarNodeMode,
			houseSystem,
			astrologyMode,
			hamburgSchoolMode
		});
	}
	
	private copyWith( updates: Partial<ZodiacPositionsConstructorArgs> ): ZodiacPositions {
		return new ZodiacPositions({
			date: this.date,
			surfacePosition: this.surfacePosition,
			lunarNodeMode: this.lunarNodeMode,
			houseSystem: this.houseSystem,
			astrologyMode: this.astrologyMode,
			hamburgSchoolMode: this.hamburgSchoolMode,
			nodePositions: this._nodePositions,
			houseCuspPositions: this._houseCuspPositions,
			siderealOffset: this.siderealOffset,
			...updates
		});
	}

	public changeLunarNodeMode(newMode: LunarNodeMode): ZodiacPositions{
		if (newMode == this.lunarNodeMode) {
			return this;
		}
		const newLunarNodePositions = computeLunarNodes(this.date, newMode);
		const newLilithSelenePositions = computeLunarApogeePerigee(this.date, newMode);
		const newNodePositions = new Map<Node, number>([ ...this._nodePositions, ...newLunarNodePositions, ...newLilithSelenePositions]);
		return this.copyWith({lunarNodeMode: newMode, nodePositions: newNodePositions});
	}
	
	public changeHouseSystem(newSystem: HouseSystem): ZodiacPositions{
		if (newSystem == this.houseSystem) {
			return this;
		}
		const newHouseCuspPositions = this.surfacePosition ? 
			computeHouseCuspPositions(this.date, this.surfacePosition, newSystem, this._nodePositions, this.siderealOffset)
			: null;
		return this.copyWith({houseSystem: newSystem, houseCuspPositions: newHouseCuspPositions});
	}
	
	public changeAstrologyMode(newAstrologyMode: AstrologyMode): ZodiacPositions{
		if (newAstrologyMode == this.astrologyMode) {
			return this;
		}
		const newSiderealOffset = computeSiderealOffset(this.date, newAstrologyMode);
		if (AyanamsaDependantHouseSystems.includes(this.houseSystem) && this.surfacePosition !== null) {
			const newHouseCuspPositions = computeHouseCuspPositions(this.date, this.surfacePosition, this.houseSystem, this._nodePositions, newSiderealOffset);
			return this.copyWith({astrologyMode: newAstrologyMode, siderealOffset: newSiderealOffset, houseCuspPositions: newHouseCuspPositions});
		} else {
			return this.copyWith({astrologyMode: newAstrologyMode, siderealOffset: newSiderealOffset});
		}
	}

	public changeHamburgSchoolMode(newMode: HamburgSchoolMode): ZodiacPositions{
		if (newMode == this.hamburgSchoolMode) {
			return this;
		}
		const newHamburgSchoolObjectPositions = computeHamburgSchoolObjectPositions(this.date, newMode);
		const newNodePositions = new Map<Node, number>([ ...this._nodePositions, ...newHamburgSchoolObjectPositions]);
		return this.copyWith({hamburgSchoolMode: newMode, nodePositions: newNodePositions});
	}
	
	public hasSurfacePosition(): boolean{
		return this.surfacePosition !== null;
	}
	
	public getNodePositions(): Map<Node, number>{
		return this._nodePositions;
	}
	
	public getNodePosition(node: Node): number{
		const a = this._nodePositions.get(node);
		if (!a) {throw new Error("getNodePosition called for absent node");}
		return a;
	}
	
	public getHouseCuspPositions(): number[] | null{
		return this._houseCuspPositions;
	}
	
	public getHouseCuspPosition(i: number): number | null{
		return this._houseCuspPositions?.[i] || null;
	}
	
	public houseSystemUndefinedForPosition(): boolean {
		// returns true iff a position is specified but the chosen house system is undefined for that date/time
		return this.surfacePosition !== null && this._houseCuspPositions === null
	}
	
	public houseCuspsAreDefined(): boolean {
		return this._houseCuspPositions !== null
	}
}
