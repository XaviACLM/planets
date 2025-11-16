import { normalizeAngleRad } from './util.ts'

import { Body, GeoVector, Ecliptic, GeoMoonState, MakeTime, SiderealTime, Vector, AstroTime } from "astronomy-engine";

export enum Node {
	// bodies
	SUN = "Sun",
	MOON = "Moon",
	MERCURY = "Mercury",
	VENUS = "Venus",
	MARS = "Mars",
	JUPITER = "Jupiter",
	SATURN = "Saturn",
	URANUS = "Uranus",
	NEPTUNE = "Neptune",
	PLUTO = "Pluto",
	
	// angles
	ASCENDANT = "Ascendant",
	DESCENDANT = "Descendant",
	MIDHEAVEN = "Midheaven",
	IMUM_COELI = "Imum Coeli",
	//PART_OF_FORTUNE = "Part of Fortune",
	
	//lunar
	LUNAR_ASCENDING = "Lunar Ascending",
	LUNAR_DESCENDING = "Lunar Descending",
	//LUNAR_APOGEE = "Lunar Apogee", //lilith
	//LUNAR_PERIGEE = "Lunar Perigee",
	
	// missing:
	// secondadry angles: anti/vertex, east/west points
	// arabic parts: of spirit, of love, of marriage...
	// fictive/transneptunian: cupido, hades, zeus...
	// uranian: uranian cupido, uranian hades...
	// house cusps
	
	// minor bodies
	//CERES = "Ceres",
	//PALLAS = "Pallas",
	//JUNO = "Juno",
	//VESTA = "Vesta",
	//CHIRON = "Chiron",
}

export enum NodeType {
	BODY = "Body",
	POINT = "Point",
	HOUSE_CUSP = "House Cusp",
}

const nodeTypes: Record<Node, NodeType> = {
	[Node.SUN] : NodeType.BODY,
	[Node.MOON] : NodeType.BODY,
	[Node.MERCURY] : NodeType.BODY,
	[Node.VENUS] : NodeType.BODY,
	[Node.MARS] : NodeType.BODY,
	[Node.JUPITER] : NodeType.BODY,
	[Node.SATURN] : NodeType.BODY,
	[Node.URANUS] : NodeType.BODY,
	[Node.NEPTUNE] : NodeType.BODY,
	[Node.PLUTO] : NodeType.BODY,
	
	[Node.ASCENDANT] : NodeType.POINT,
	[Node.DESCENDANT] : NodeType.POINT,
	[Node.MIDHEAVEN] : NodeType.POINT,
	[Node.IMUM_COELI] : NodeType.POINT,
	//[Node.PART_OF_FORTUNE] : NodeType.POINT,
	
	[Node.LUNAR_ASCENDING] : NodeType.POINT,
	[Node.LUNAR_DESCENDING] : NodeType.POINT,
	//[Node.LUNAR_APOGEE] : NodeType.POINT,
	//[Node.LUNAR_PERIGEE] : NodeType.POINT,
}

const nodeDependsOnLocation: Record<Node, boolean> = {
	[Node.SUN] : false,
	[Node.MOON] : false,
	[Node.MERCURY] : false,
	[Node.VENUS] : false,
	[Node.MARS] : false,
	[Node.JUPITER] : false,
	[Node.SATURN] : false,
	[Node.URANUS] : false,
	[Node.NEPTUNE] : false,
	[Node.PLUTO] : false,
	
	[Node.ASCENDANT] : true,
	[Node.DESCENDANT] : true,
	[Node.MIDHEAVEN] : true,
	[Node.IMUM_COELI] : true,
	//[Node.PART_OF_FORTUNE] : true,
	
	[Node.LUNAR_ASCENDING] : false,
	[Node.LUNAR_DESCENDING] : false,
	//[Node.LUNAR_APOGEE] : false,
	//[Node.LUNAR_PERIGEE] : false,
}

export interface SurfacePosition {
	latitude: number;
	longitude: number
}

export enum LunarNodeMode {
	TRUE = "True", //geometric
	MEAN = "Mean", //meeus
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
		t: MakeTime(date)
	};
	
	const hEcl = Ecliptic(h).vec; // { x, y, z } in ecliptic frame
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

function computeAxialTilt(date: Date): number {
	// in radians
	const vecPole = new Vector(0, 0, 1, new AstroTime(date));
	const eclPole = Ecliptic(vecPole);
	const obliquity = Math.acos(eclPole.vec.z);
	return obliquity;
}

function computeMCIC(date: Date, surfacePos: SurfacePosition): number {
	const latitudeDeg = surfacePos.latitude;
	const longitudeDeg = surfacePos.longitude;
	const gstHours = SiderealTime(date);
	const lstHours = gstHours + longitudeDeg / 15.0;
	const lstHoursNorm = ((lstHours % 24) + 24) % 24;
	const theta = lstHoursNorm * Math.PI / 12
	
	const epsRad = computeAxialTilt(date);
	
	const mc = Math.atan2(Math.cos(epsRad)*Math.sin(theta), Math.cos(theta));
	
	return new Map <Node, number>([
		[Node.MIDHEAVEN, normalizeAngleRad(mc)],
		[Node.IMUM_COELI, normalizeAngleRad(mc + Math.PI)]
	]);
}

function computeAscendantAndDescendant(date: Date, surfacePos: SurfacePosition): number {
	const latitudeDeg = surfacePos.latitude;
	const longitudeDeg = surfacePos.longitude;
	const gstHours = SiderealTime(date);
	const lstHours = gstHours + longitudeDeg / 15.0;
	const lstHoursNorm = ((lstHours % 24) + 24) % 24;
	const theta = lstHoursNorm * Math.PI / 12
	
	const epsRad = computeAxialTilt(date);
		
	const phi = latitudeDeg * Math.PI/180;
	
	const x = Math.cos(theta);
	const y = - (Math.sin(theta) * Math.cos(epsRad) + Math.tan(phi) * Math.sin(epsRad));
	const lambda = Math.atan2(x,y);
	
	return new Map <Node, number>([
		[Node.ASCENDANT, normalizeAngleRad(lambda)],
		[Node.DESCENDANT, normalizeAngleRad(lambda + Math.PI)]
	]);
}

// for the astronomy engine
const NodeToBody: Partial<Record<Node, Body>> = {
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
		
	for ( const [node, body] of Object.entries(NodeToBody)) {
		const eqj = GeoVector(body, new Date(), correctForAberration)
		const etc = Ecliptic(eqj);
		nodeAngles.set(node, (etc.elon)/360*2*Math.PI);
	}
	
	return nodeAngles;
}

function computeAllNodePositionsWithoutSurfacePosition(date: Date, lunarNodeMode: LunarNodeMode): Map<Node, number>{
	return new Map<Node, number>([
		...computePhysicalNodePositions(date),
		...computeLunarNodes(date, lunarNodeMode)
	]);
}

function computeAllNodePositionsWithSurfacePosition(date: Date, surfacePos: SurfacePosition, houseSystem: HouseSystem): Map<Node, number>{
	return new Map<Node, number>([
		//...(new Map<Node, number>([[Node.ASCENDANT, computeAscendant(date, surfacePos)]])),
		...computeAscendantAndDescendant(date, surfacePos),
		...computeMCIC(date, surfacePos),
	]);
}

function computeHouseCuspPositions(date: Date, surfacePos: SurfacePosition, houseSystem: HouseSystem): Map<Node, number>{
	//TODO
}

function computeAllNodePositions(date: Date, surfacePosition: SurfacePosition, lunarNodeMode: LunarNodeMode, houseSystem: HouseSystem): Map<Node, number>{
	return new Map<Node, number>([
		...computeAllNodePositionsWithoutSurfacePosition(date, lunarNodeMode),
		...computeAllNodePositionsWithSurfacePosition(date, surfacePosition, houseSystem)
	]);
	return allNodes
}

export enum HouseSystem {
	WHOLE_SIGN = "Whole Sign",
	CARTER_POLI_EQUATORIAL = "Carter-Poli Equatorial",
	CAMPANUS = "Campanus",
	ALCABITIUS = "Alcabitius",
	PLACIDUS = "Placidus"
}

interface ZodiacPositionsConstructorArgs {
	date: Date;
	surfacePosition: SurfacePosition | null;
	lunarNodeMode: LunarNodeMode;
	houseSystem: HouseSystem;
	nodePositions?: Map<Node, number>
}

export class ZodiacPositions {
	private readonly _nodePositions: Map<Node, number>;
	
	public readonly date: Date;
	public readonly surfacePosition: SurfacePosition | null;
	public readonly lunarNodeMode: LunarNodeMode;
	public readonly houseSystem: HouseSystem;
	
	constructor( config: ZodiacPositionsConstructorArgs ){
		this.surfacePosition = config.surfacePosition;
		this.date = config.date;
		this.lunarNodeMode = config.lunarNodeMode;
		this.houseSystem = config.houseSystem;
		
		if (config.nodePositions) {
			this._nodePositions = config.nodePositions;
		} else if (this.surfacePosition !== null) {
			this._nodePositions = computeAllNodePositions(this.date, this.surfacePosition, this.lunarNodeMode, this.houseSystem);
		} else {
			this._nodePositions = computeAllNodePositionsWithoutSurfacePosition(this.date, this.lunarNodeMode);
		}
	}
	
	static create(
		date: Date,
		surfacePosition: SurfacePosition | null,
		lunarNodeMode: LunarNodeMode,
		houseSystem: HouseSystem,
	): ZodiacPositions {
		return new ZodiacPositions({
			date,
			surfacePosition,
			lunarNodeMode,
			houseSystem
		});
	}
	
	private copyWith( updates: Partial<ZodiacPositionsConstructorArgs> ): ZodiacPositions {
		return new ZodiacPositions({
			date: this.date,
			surfacePosition: this.surfacePosition,
			lunarNodeMode: this.lunarNodeMode,
			houseSystem: this.housesSystem,
			nodePositions: this._nodePositions,
			...updates
		});
	}

	public changeLunarNodesMode(newMode: LunarNodeMode){
		if (newMode == this.lunarNodeMode) {
			return this;
		}
		const newLunarNodePositions = computeLunarNodes(this.date, newMode);
		const newNodePositions = new Map<Node, number>([ ...this._nodePositions, ...newLunarNodePositions]);
		return this.copyWith({lunarNodeMode: newMode, nodePositions: newNodePositions});
	}
	
	public changeHouseSystem(newSystem: HouseSystem){
		if (newSystem == this.houseSystem) {
			return;
		}
		const newHouseCuspPositions = computeHouseCuspPositions(this.date, this.surfacePosition, newSystem);
		const newNodePositions = new Map<Node, number>([ ...this._nodePositions, ...newHouseCuspPositions]);
		return this.copyWith({nodePositions: newNodePositions});
	}
	
	public getNodePositions(): Map<Node, number>{
		return this._nodePositions;
	}
	
	public getNodePosition(node: Node): number{
		return this._nodePositions[node];
	}
}
