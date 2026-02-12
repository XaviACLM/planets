import { normalizeAngleRad, anglesLieInShortArc } from './util.ts'
import { computeHouseCuspPositions, HouseSystem, ayanamsaDependantHouseSystems } from './houses.ts'
import { smallBodyParams, hamburgSchoolParamsNeely, hamburgSchoolParamsWitte } from './astroFromOrbitalParams.ts'
import { ZodiacMode, Node, type SurfacePosition, Zodiac, standardZodiac, irregularZodiacModes } from './astroDefs.ts'
import { ayanamsas, zodiacLongitudeClosest, zodiacLongitudeIAU, fixedStars } from './astroData.ts'
import { LunarNodeMode, HamburgSchoolMode } from './settingsDefs.ts'
import { computeAllSignificantPoints } from './geometry.ts'
import {
	orbitalParamsToGeocentricLongitude, nodeToBody, bodyToGeocentricLongitude, addPrecession,
	getTodayEclipticLongitudeFromEQJ,
	computeLunarApogeePerigeeMeeus, computeLunarApogeePerigeeExact,
	computeLunarNodesMeeus, computeLunarNodesExact
} from './astronomyUtil.ts'

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

function computeSiderealOffset(date: Date, zodiacMode: ZodiacMode): number {
	if (zodiacMode === ZodiacMode.TROPICAL) { return 0; }
	
	const ayanamsaJ2000 = ayanamsas[zodiacMode];
	if (ayanamsaJ2000 === undefined) {
		throw new Error("Irregular zodiac mode passed to computeSiderealOffset");
	}
	
	return addPrecession(date, ayanamsaJ2000*Math.PI/180);
}

function computeSignPositionsFromSiderealOffset(siderealOffset: number): number[] {
	return new Map(standardZodiac.map((zodiac, index) => 
		[zodiac, siderealOffset + index * Math.PI / 6]
	));
}

function computeSignPositionsForIrregularMode(date: Date, zodiacMode: ZodiacMode): number[] {
	let zodiacLongitudes = null;
	
	if (zodiacMode === ZodiacMode.CONSTELLATIONS_CLOSEST) {
		zodiacLongitudes = zodiacLongitudeClosest;
	} else if (zodiacMode === ZodiacMode.CONSTELLATIONS_IAU) {
		zodiacLongitudes = zodiacLongitudeIAU;
	} else {
		throw new Error("Regular zodiac mode passed to computeSignPositionsForIrregularMode");
	}
	
	return new Map(
		Object.entries(zodiacLongitudes).map(([zodiac, lon]) => 
			[zodiac, addPrecession(date, lon)]
		)
	);
}

function computeFixedStarPositions(date: Date): Map<string, number> {
	const positions = new Map<string, number>();
	for (const [starName, j2000longitude] of Object.entries(fixedStars)){
		positions.set(starName, addPrecession(date, j2000longitude));
	}
	return positions;
}

interface ZodiacPositionsConstructorArgs {
	date: Date;
	surfacePosition: SurfacePosition | null;
	lunarNodeMode: LunarNodeMode;
	houseSystem: HouseSystem;
	zodiacMode: ZodiacMode;
	hamburgSchoolMode: HamburgSchoolMode;
	housePresweep: boolean;
	nodePositions?: Map<Node, number>;
	houseCuspPositions?: number[] | null;
	siderealOffset?: number | null;
	signPositions?: Map<Zodiac, number>;
	fixedStarPositions?: Map<string, number>;
}

class ZodiacPositions {
	private readonly _nodePositions: Map<Node, number>;
	private readonly _houseCuspPositions: number[] | null;
	private readonly _signPositions: Map<Zodiac, number>;
	private readonly _fixedStarPositions: Map<string, number>;
	
	public readonly date: Date;
	public readonly surfacePosition: SurfacePosition | null;
	public readonly lunarNodeMode: LunarNodeMode;
	public readonly houseSystem: HouseSystem;
	public readonly siderealOffset: number;
	public readonly zodiacMode: ZodiacMode;
	public readonly hamburgSchoolMode: HamburgSchoolMode;
	public readonly housePresweep: boolean;
	
	constructor( config: ZodiacPositionsConstructorArgs ){
		this.surfacePosition = config.surfacePosition;
		this.date = config.date;
		this.lunarNodeMode = config.lunarNodeMode;
		this.houseSystem = config.houseSystem;
		this.zodiacMode = config.zodiacMode;
		this.hamburgSchoolMode = config.hamburgSchoolMode;
		this.housePresweep = config.housePresweep;
		
		if (config.fixedStarPositions === undefined ){
			this._fixedStarPositions = computeFixedStarPositions(this.date);
		} else {
			this._fixedStarPositions = config.fixedStarPositions;
		}
		
		// best be explicit ab whether siderealOffset is undefined/null
		if (config.siderealOffset === undefined) {
			if (irregularZodiacModes.includes(this.zodiacMode)){
				this.siderealOffset = null;
			} else {
				this.siderealOffset = computeSiderealOffset(this.date, this.zodiacMode);
			}
		} else {
			this.siderealOffset = config.siderealOffset;
		}
		if (config.signPositions === undefined) {
			if (this.siderealOffset === null) {
				this._signPositions = computeSignPositionsForIrregularMode(this.date, this.zodiacMode);
			} else {
				this._signPositions = computeSignPositionsFromSiderealOffset(this.siderealOffset);
			}
		} else {
			this._signPositions = config.signPositions;
		}
		
		if (config.nodePositions) {
			this._nodePositions = config.nodePositions;
			this._houseCuspPositions = config.houseCuspPositions || null;
		} else if (this.surfacePosition !== null) {
			this._nodePositions = computeAllNodePositions(this.date, this.surfacePosition, this.lunarNodeMode, this.hamburgSchoolMode);
			this._houseCuspPositions = computeHouseCuspPositions(this.date, this.surfacePosition, this.houseSystem, this._nodePositions, this._signPositions);
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
		zodiacMode: ZodiacMode,
		hamburgSchoolMode: HamburgSchoolMode,
		housePresweep: boolean,
	): ZodiacPositions {
		return new ZodiacPositions({
			date,
			surfacePosition,
			lunarNodeMode,
			houseSystem,
			zodiacMode,
			hamburgSchoolMode,
			housePresweep
		});
	}
	
	private copyWith( updates: Partial<ZodiacPositionsConstructorArgs> ): ZodiacPositions {
		return new ZodiacPositions({
			date: this.date,
			surfacePosition: this.surfacePosition,
			lunarNodeMode: this.lunarNodeMode,
			houseSystem: this.houseSystem,
			zodiacMode: this.zodiacMode,
			hamburgSchoolMode: this.hamburgSchoolMode,
			housePresweep: this.housePresweep,
			nodePositions: this._nodePositions,
			houseCuspPositions: this._houseCuspPositions,
			siderealOffset: this.siderealOffset,
			signPositions: this._signPositions,
			fixedStarPositions: this._fixedStarPositions,
			...updates
		});
	}

	public changeLunarNodeMode(newMode: LunarNodeMode): ZodiacPositions {
		if (newMode == this.lunarNodeMode) {
			return this;
		}
		const newLunarNodePositions = computeLunarNodes(this.date, newMode);
		const newLilithSelenePositions = computeLunarApogeePerigee(this.date, newMode);
		const newNodePositions = new Map<Node, number>([ ...this._nodePositions, ...newLunarNodePositions, ...newLilithSelenePositions]);
		return this.copyWith({lunarNodeMode: newMode, nodePositions: newNodePositions});
	}
	
	public changeHouseSystem(newSystem: HouseSystem): ZodiacPositions {
		if (newSystem == this.houseSystem) {
			return this;
		}
		const newHouseCuspPositions = this.surfacePosition ? 
			computeHouseCuspPositions(this.date, this.surfacePosition, newSystem, this._nodePositions, this._signPositions)
			: null;
		return this.copyWith({houseSystem: newSystem, houseCuspPositions: newHouseCuspPositions});
	}
	
	public changeHousePresweep(newHousePresweep: boolean): ZodiacPositions {
		return this.copyWith({housePresweep: newHousePresweep});
	}
	
	public changeZodiacMode(newZodiacMode: ZodiacMode): ZodiacPositions {
		if (newZodiacMode == this.zodiacMode) {
			return this;
		}
		
		let newSiderealOffset: number;
		let newSignPositions: Map<Zodiac, number>;
		if (irregularZodiacModes.includes(newZodiacMode)){
			newSiderealOffset = null;
			newSignPositions = computeSignPositionsForIrregularMode(this.date, newZodiacMode);
		} else {
			newSiderealOffset = computeSiderealOffset(this.date, newZodiacMode);
			newSignPositions = computeSignPositionsFromSiderealOffset(newSiderealOffset);
		}
		
		if (ayanamsaDependantHouseSystems.includes(this.houseSystem) && this.surfacePosition !== null) {
			const newHouseCuspPositions = computeHouseCuspPositions(
				this.date,
				this.surfacePosition,
				this.houseSystem,
				this._nodePositions,
				newSignPositions
			);
			return this.copyWith({
				zodiacMode: newZodiacMode,
				siderealOffset: newSiderealOffset,
				signPositions: newSignPositions,
				houseCuspPositions: newHouseCuspPositions
			});
		} else {
			return this.copyWith({
				zodiacMode: newZodiacMode,
				siderealOffset: newSiderealOffset,
				signPositions: newSignPositions
			});
		}
	}
	
	public getSignPositions(): Map<Zodiac, number> {
		return this._signPositions;
	}
	
	public isZodiacModeRegular(): boolean {
		return this.siderealOffset !== null;
	}
	
	public _getSignAtLongitude(lon: number): Zodiac {
		if (this.isZodiacModeRegular()){
			return standardZodiac[Math.floor((((lon-this.siderealOffset)*6/Math.PI)%12+12)%12)];
		} else {
			const entries = Array.from(this.getSignPositions().entries());
			const index = entries.findIndex(([_, zlon]) => zlon > lon);
			if (index === -1 || index === 0) { // first is already bigger or all are smaller: last sign (the one across the v.equinox)
				return entries[entries.length - 1][0];
			} else {
				return entries[index - 1][0];
			}
		}
	}
	
	public getSignOfNode(node: Node): Zodiac {
		// will error out if node is absent (intended)
		const lon = this.getNodePosition(node);
		return this._getSignAtLongitude(lon);
	}
	
	public getNodePositionWithinSign(node: Node): number {
		// this might error out if node is absent - intended behaviour
		const lon = this.getNodePosition(node);
		if (this.isZodiacModeRegular()){
			// this should give the same results as the next branch but something something faster/more readable
			return normalizeAngleRad(lon - this.siderealOffset)%(Math.PI/6);
		} else {
			const sign = this._getSignAtLongitude(lon);
			return lon - this._signPositions.get(sign);
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
		if (a === undefined) {throw new Error("getNodePosition called for absent node:", node);}
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
	
	public isNodeAboveHorizon(node: Node): boolean {
		if (!this.hasSurfacePosition()) {
			throw new Error("isNodeAboveHorizon called with no defined surface position");
		}
		// error if node is absent - intended
		const lon = this.getNodePosition(node);
		const asc = this.getNodePosition(Node.ASCENDANT);
		const dsc = this.getNodePosition(Node.DESCENDANT);
		if (asc<dsc){
			return !((asc < lon)&&(lon < dsc));
		} else {
			return ((dsc < lon)&&(lon < asc));
		}
	}
	
	public isNodeEastern(node: Node): boolean {
		if (!this.hasSurfacePosition()) {
			throw new Error("isNodeEastern called with no defined surface position");
		}
		// error if node is absent - intended
		const lon = this.getNodePosition(node);
		const mc = this.getNodePosition(Node.MIDHEAVEN);
		const ic = this.getNodePosition(Node.IMUM_COELI);
		if (mc<ic){
			return ((mc < lon)&&(lon < ic));
		} else {
			return !((ic < lon)&&(lon < mc));
		}
	}
	
	public getHouseOfNode(node: Node): number {
		// errors out if node is absent
		const lon = this.getNodePosition(node);
		const houseLimits = this._houseCuspPositions.map(cusp => {
			if (this.housePresweep){
				const limit = cusp - 5*Math.PI/180;
				return limit > 0 ? limit : limit + 2*Math.PI;
			} else {
				return cusp;
			}
		});
		// might be faster to sort them (1 single slice) and do a zodiac-like approach but seems like premature optimization
		for (let i = 0; i < houseLimits.length-1; i++){
			const houseStart = houseLimits[i];
			const houseEnd = houseLimits[i+1];
			if ( anglesLieInShortArc(houseStart, lon, houseEnd) ) {
				return i+1;
			}
		}
		return houseLimits.length;
	}
	
	public getFixedStarPositions(): Map<string, number> {
		return this._fixedStarPositions;
	}
}

export default ZodiacPositions;