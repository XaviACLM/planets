import { Node, Zodiac, Element, zodiacElement, standardNodes, irregularAstrologyModes, Sect, standardZodiac, classicalDignityData, modernDignityData, type DignityData } from './astroDefs.ts';
import { DignityMode, TriplicityMode, FaceMode, BoundsMode } from './settingsDefs.ts';
import { getChartSect } from './astrologyUtil.ts';
import ZodiacPositions from './zodiacPositions.ts';

export const Dignity = {
	DOMICILE: "Domicile",
	EXALTATION: "Exaltation",
	DETRIMENT: "Detriment",
	FALL: "Fall",
	PEREGRINE: "Peregrine",
} as const;
export type Dignity = typeof Dignity[keyof typeof Dignity];

export type DignityState = {
	dignity: Dignity;
	degreeOffset?: number;
};

export function getDignityState(node: Node, zodiacPositions: ZodiacPositions, dignityMode: DignityMode): DignityState | null {
	// TODO: investigate if it's possible to give a reasonable result with irregular zodiac systems
	if (irregularAstrologyModes.includes(zodiacPositions.astrologyMode)) {
		throw new Error(`getDignityState is not supported for irregular astrology mode: ${zodiacPositions.astrologyMode}`);
	}

	const dignityData = dignityMode === DignityMode.CLASSICAL ? classicalDignityData : modernDignityData;

	const data = dignityData[node];
	if (!data) {
		return null;
	}

	const sign = zodiacPositions.getSymbolOfNode(node);
	const position = zodiacPositions.getNodePosition(node);
	const signStartPositions = zodiacPositions.getZodiacSymbolPositions();
	const signStart = signStartPositions.get(sign)!;
	const degreeInSign = ((position - signStart) * 180 / Math.PI + 360) % 360;

	if (data.domicile.includes(sign)) {
		return { dignity: Dignity.DOMICILE };
	}

	if (data.exaltation && data.exaltation.sign === sign) {
		if (data.exaltation.degree !== undefined) {
			const offset = degreeInSign - data.exaltation.degree;
			return { dignity: Dignity.EXALTATION, degreeOffset: offset };
		}
		return { dignity: Dignity.EXALTATION };
	}

	if (data.detriment.includes(sign)) {
		return { dignity: Dignity.DETRIMENT };
	}

	if (data.fall && data.fall.sign === sign) {
		if (data.fall.degree !== undefined) {
			const offset = degreeInSign - data.fall.degree;
			return { dignity: Dignity.FALL, degreeOffset: offset };
		}
		return { dignity: Dignity.FALL };
	}

	return { dignity: Dignity.PEREGRINE };
}

// ============================================================================
// TRIPLICITIES
// ============================================================================

export const TriplicityRole = {
	DIURNAL: "Diurnal",
	NOCTURNAL: "Nocturnal",
	PARTICIPATING: "Participating",
} as const;
export type TriplicityRole = typeof TriplicityRole[keyof typeof TriplicityRole];

type TriplicityRulers = {
	diurnal: Node;
	nocturnal: Node;
	participating: Node | null;
};

type TriplicityData = Record<Element, TriplicityRulers>;

const dorotheanTriplicityData: TriplicityData = {
	[Element.FIRE]: { diurnal: Node.SUN, nocturnal: Node.JUPITER, participating: Node.SATURN },
	[Element.EARTH]: { diurnal: Node.VENUS, nocturnal: Node.MOON, participating: Node.MARS },
	[Element.AIR]: { diurnal: Node.SATURN, nocturnal: Node.MERCURY, participating: Node.JUPITER },
	[Element.WATER]: { diurnal: Node.VENUS, nocturnal: Node.MARS, participating: Node.MOON },
};

const ptolemaicLillyTriplicityData: TriplicityData = {
	[Element.FIRE]: { diurnal: Node.SUN, nocturnal: Node.JUPITER, participating: null },
	[Element.EARTH]: { diurnal: Node.VENUS, nocturnal: Node.MOON, participating: null },
	[Element.AIR]: { diurnal: Node.SATURN, nocturnal: Node.MERCURY, participating: null },
	[Element.WATER]: { diurnal: Node.MARS, nocturnal: Node.MARS, participating: null },
};

const triplicityDataByMode: Record<TriplicityMode, TriplicityData> = {
	[TriplicityMode.DOROTHEAN]: dorotheanTriplicityData,
	[TriplicityMode.PTOLEMAIC_LILLY]: ptolemaicLillyTriplicityData,
};

export function getTriplicityRole(node: Node, zodiacPositions: ZodiacPositions, triplicityMode: TriplicityMode): TriplicityRole | null {
	// TODO: investigate if it's possible to give a reasonable result with irregular zodiac systems
	if (irregularAstrologyModes.includes(zodiacPositions.astrologyMode)) {
		throw new Error(`getTriplicityRole is not supported for irregular astrology mode: ${zodiacPositions.astrologyMode}`);
	}

	if (!standardNodes.includes(node)) {
		throw new Error(`getTriplicityRole is only valid for planets and luminaries, got: ${node}`);
	}

	const sign = zodiacPositions.getSymbolOfNode(node);
	const elem = zodiacElement[sign];
	const triplicityData = triplicityDataByMode[triplicityMode];
	const rulers = triplicityData[elem];

	if (getChartSect(zodiacPositions) === Sect.DIURNAL) {
		if (rulers.diurnal === node) {
			return TriplicityRole.DIURNAL;
		}
	} else {
		if (rulers.nocturnal === node) {
			return TriplicityRole.NOCTURNAL;
		}
	}
	if (rulers.participating === node) {
		return TriplicityRole.PARTICIPATING;
	}

	return null;
}

// ============================================================================
// FACES (DECANS)
// ============================================================================

// Each sign divided into three 10° faces; array is [0-10°, 10-20°, 20-30°]
type FaceData = Record<Zodiac, [Node, Node, Node]>;

const chaldeanPtolemaicFaceData: Partial<FaceData> = {
	[Zodiac.ARIES]: [Node.MARS, Node.SUN, Node.VENUS],
	[Zodiac.TAURUS]: [Node.MERCURY, Node.MOON, Node.SATURN],
	[Zodiac.GEMINI]: [Node.JUPITER, Node.MARS, Node.SUN],
	[Zodiac.CANCER]: [Node.VENUS, Node.MERCURY, Node.MOON],
	[Zodiac.LEO]: [Node.SATURN, Node.JUPITER, Node.MARS],
	[Zodiac.VIRGO]: [Node.SUN, Node.VENUS, Node.MERCURY],
	[Zodiac.LIBRA]: [Node.MOON, Node.SATURN, Node.JUPITER],
	[Zodiac.SCORPIO]: [Node.MARS, Node.SUN, Node.VENUS],
	[Zodiac.SAGITTARIUS]: [Node.MERCURY, Node.MOON, Node.SATURN],
	[Zodiac.CAPRICORN]: [Node.JUPITER, Node.MARS, Node.SUN],
	[Zodiac.AQUARIUS]: [Node.VENUS, Node.MERCURY, Node.MOON],
	[Zodiac.PISCES]: [Node.SATURN, Node.JUPITER, Node.MARS],
};

const modernFaceData: Partial<FaceData> = {
	[Zodiac.ARIES]: [Node.MARS, Node.SUN, Node.JUPITER],
	[Zodiac.TAURUS]: [Node.VENUS, Node.MERCURY, Node.SATURN],
	[Zodiac.GEMINI]: [Node.MERCURY, Node.VENUS, Node.URANUS],
	[Zodiac.CANCER]: [Node.MOON, Node.PLUTO, Node.NEPTUNE],
	[Zodiac.LEO]: [Node.SUN, Node.JUPITER, Node.MARS],
	[Zodiac.VIRGO]: [Node.MERCURY, Node.SATURN, Node.VENUS],
	[Zodiac.LIBRA]: [Node.VENUS, Node.URANUS, Node.MERCURY],
	[Zodiac.SCORPIO]: [Node.PLUTO, Node.NEPTUNE, Node.MOON],
	[Zodiac.SAGITTARIUS]: [Node.JUPITER, Node.MARS, Node.SUN],
	[Zodiac.CAPRICORN]: [Node.SATURN, Node.VENUS, Node.MERCURY],
	[Zodiac.AQUARIUS]: [Node.URANUS, Node.MERCURY, Node.VENUS],
	[Zodiac.PISCES]: [Node.NEPTUNE, Node.MOON, Node.PLUTO],
};

const faceDataByMode: Record<FaceMode, Partial<FaceData>> = {
	[FaceMode.CHALDEAN_PTOLEMAIC]: chaldeanPtolemaicFaceData,
	[FaceMode.MODERN]: modernFaceData,
};

export function getFaceLord(node: Node, zodiacPositions: ZodiacPositions, faceMode: FaceMode): Node {
	// TODO: investigate if it's possible to give a reasonable result with irregular zodiac systems
	if (irregularAstrologyModes.includes(zodiacPositions.astrologyMode)) {
		throw new Error(`getFaceLord is not supported for irregular astrology mode: ${zodiacPositions.astrologyMode}`);
	}

	const sign = zodiacPositions.getSymbolOfNode(node);
	const positionInSign = zodiacPositions.getNodePositionWithinSign(node);

	const faceData = faceDataByMode[faceMode];
	const faceLords = faceData[sign];
	const faceIndex = Math.floor(positionInSign / (Math.PI/18));
	return faceLords[faceIndex];
}

// ============================================================================
// BOUNDS (TERMS)
// ============================================================================

type BoundEntry = { upToDegree: number; lord: Node };
type BoundsData = Record<Zodiac, BoundEntry[]>;

// https://astrolibrary.org/library/tetrabiblos/tetrabiblos-22/
const egyptianBoundsData: Partial<BoundsData> = {
	// Each array lists bounds in order, with cumulative degree endpoints
	[Zodiac.ARIES]: [
		{ upToDegree: 6, lord: Node.JUPITER },
		{ upToDegree: 12, lord: Node.VENUS },
		{ upToDegree: 20, lord: Node.MERCURY },
		{ upToDegree: 25, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.TAURUS]: [
		{ upToDegree: 8, lord: Node.VENUS },
		{ upToDegree: 14, lord: Node.MERCURY },
		{ upToDegree: 22, lord: Node.JUPITER },
		{ upToDegree: 27, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.GEMINI]: [
		{ upToDegree: 6, lord: Node.MERCURY },
		{ upToDegree: 12, lord: Node.JUPITER },
		{ upToDegree: 17, lord: Node.VENUS },
		{ upToDegree: 24, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.CANCER]: [
		{ upToDegree: 7, lord: Node.MARS },
		{ upToDegree: 13, lord: Node.VENUS },
		{ upToDegree: 19, lord: Node.MERCURY },
		{ upToDegree: 26, lord: Node.JUPITER },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.LEO]: [
		{ upToDegree: 6, lord: Node.JUPITER },
		{ upToDegree: 11, lord: Node.VENUS },
		{ upToDegree: 18, lord: Node.SATURN },
		{ upToDegree: 24, lord: Node.MERCURY },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.VIRGO]: [
		{ upToDegree: 7, lord: Node.MERCURY },
		{ upToDegree: 17, lord: Node.VENUS },
		{ upToDegree: 21, lord: Node.JUPITER },
		{ upToDegree: 28, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.LIBRA]: [
		{ upToDegree: 6, lord: Node.SATURN },
		{ upToDegree: 14, lord: Node.MERCURY },
		{ upToDegree: 21, lord: Node.JUPITER },
		{ upToDegree: 28, lord: Node.VENUS },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.SCORPIO]: [
		{ upToDegree: 7, lord: Node.MARS },
		{ upToDegree: 11, lord: Node.VENUS },
		{ upToDegree: 19, lord: Node.MERCURY },
		{ upToDegree: 24, lord: Node.JUPITER },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.SAGITTARIUS]: [
		{ upToDegree: 12, lord: Node.JUPITER },
		{ upToDegree: 17, lord: Node.VENUS },
		{ upToDegree: 21, lord: Node.MERCURY },
		{ upToDegree: 26, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.CAPRICORN]: [
		{ upToDegree: 7, lord: Node.MERCURY },
		{ upToDegree: 14, lord: Node.JUPITER },
		{ upToDegree: 22, lord: Node.VENUS },
		{ upToDegree: 26, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.AQUARIUS]: [
		{ upToDegree: 7, lord: Node.MERCURY },
		{ upToDegree: 13, lord: Node.VENUS },
		{ upToDegree: 20, lord: Node.JUPITER },
		{ upToDegree: 25, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.PISCES]: [
		{ upToDegree: 12, lord: Node.VENUS },
		{ upToDegree: 16, lord: Node.JUPITER },
		{ upToDegree: 19, lord: Node.MERCURY },
		{ upToDegree: 28, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	]
};

// https://astrolibrary.org/library/tetrabiblos/tetrabiblos-23/
const ptolemaicBoundsData: Partial<BoundsData> = {
	[Zodiac.ARIES]: [
		{ upToDegree: 6, lord: Node.JUPITER },
		{ upToDegree: 14, lord: Node.VENUS },
		{ upToDegree: 21, lord: Node.MERCURY },
		{ upToDegree: 26, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.TAURUS]: [
		{ upToDegree: 8, lord: Node.VENUS },
		{ upToDegree: 15, lord: Node.MERCURY },
		{ upToDegree: 22, lord: Node.JUPITER },
		{ upToDegree: 24, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.GEMINI]: [
		{ upToDegree: 7, lord: Node.MERCURY },
		{ upToDegree: 13, lord: Node.JUPITER },
		{ upToDegree: 20, lord: Node.VENUS },
		{ upToDegree: 26, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.CANCER]: [
		{ upToDegree: 6, lord: Node.MARS },
		{ upToDegree: 13, lord: Node.JUPITER },
		{ upToDegree: 20, lord: Node.MERCURY },
		{ upToDegree: 27, lord: Node.VENUS },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.LEO]: [
		{ upToDegree: 6, lord: Node.JUPITER },
		{ upToDegree: 13, lord: Node.MERCURY },
		{ upToDegree: 19, lord: Node.SATURN },
		{ upToDegree: 25, lord: Node.VENUS },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.VIRGO]: [
		{ upToDegree: 7, lord: Node.MERCURY },
		{ upToDegree: 13, lord: Node.VENUS },
		{ upToDegree: 18, lord: Node.JUPITER }, // angle missing from source, inferred
		{ upToDegree: 24, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.LIBRA]: [
		{ upToDegree: 6, lord: Node.SATURN },
		{ upToDegree: 11, lord: Node.VENUS },
		{ upToDegree: 16, lord: Node.MERCURY },
		{ upToDegree: 24, lord: Node.JUPITER },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.SCORPIO]: [
		{ upToDegree: 6, lord: Node.MARS },
		{ upToDegree: 13, lord: Node.VENUS },
		{ upToDegree: 21, lord: Node.JUPITER },
		{ upToDegree: 27, lord: Node.MERCURY },
		{ upToDegree: 30, lord: Node.SATURN },
	],
	[Zodiac.SAGITTARIUS]: [
		{ upToDegree: 8, lord: Node.JUPITER },
		{ upToDegree: 14, lord: Node.VENUS },
		{ upToDegree: 19, lord: Node.MERCURY },
		{ upToDegree: 25, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.CAPRICORN]: [
		{ upToDegree: 6, lord: Node.VENUS },
		{ upToDegree: 12, lord: Node.MERCURY },
		{ upToDegree: 19, lord: Node.JUPITER },
		{ upToDegree: 25, lord: Node.SATURN },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.AQUARIUS]: [
		{ upToDegree: 6, lord: Node.SATURN },
		{ upToDegree: 12, lord: Node.MERCURY },
		{ upToDegree: 20, lord: Node.VENUS },
		{ upToDegree: 25, lord: Node.JUPITER },
		{ upToDegree: 30, lord: Node.MARS },
	],
	[Zodiac.PISCES]: [
		{ upToDegree: 8, lord: Node.VENUS },
		{ upToDegree: 14, lord: Node.JUPITER },
		{ upToDegree: 20, lord: Node.MERCURY },
		{ upToDegree: 25, lord: Node.MARS },
		{ upToDegree: 30, lord: Node.SATURN },
	]
};

// https://astrolibrary.org/library/tetrabiblos/tetrabiblos-23/
function generateChaldeanBoundsData(sect: Sect): BoundsData{
	if (sect === Sect.VARIABLE) {
		throw new Error(`generateChaldeanBoundsData does not support variable sect (not a valid chart sect)`);
	}
	const isDiurnalChart = sect === Sect.DIURNAL;
	// matching triplicity data, excl. luminaries/participants/venus in water
	const firstTriplicityRuler = Node.JUPITER;
	const secondTriplicityRuler = Node.VENUS;
	const thirdTriplicityRulerPrimary = isDiurnalChart ? Node.SATURN : Node.MERCURY;
	const thirdTriplicityRulerSecondary = isDiurnalChart ? Node.MERCURY : Node.SATURN;
	
	const fourthTriplicityRuler = Node.MARS;
	const triplicityLords = [
		[firstTriplicityRuler, secondTriplicityRuler, thirdTriplicityRulerPrimary, thirdTriplicityRulerSecondary, fourthTriplicityRuler],
		[secondTriplicityRuler, thirdTriplicityRulerPrimary, thirdTriplicityRulerSecondary, fourthTriplicityRuler, firstTriplicityRuler],
		[thirdTriplicityRulerPrimary, thirdTriplicityRulerSecondary, fourthTriplicityRuler, firstTriplicityRuler, secondTriplicityRuler],
		[fourthTriplicityRuler, firstTriplicityRuler, secondTriplicityRuler, thirdTriplicityRulerPrimary, thirdTriplicityRulerSecondary],
	];
	const boundsData: BoundsData = {};
	for (let i = 0; i < 12; i++){
		const sign = standardZodiac[i];
		const lords = triplicityLords[i%4];
		// 8, 7, 6, 5, 4
		boundsData[sign] = [
			{ upToDegree: 8, lord: lords[0] },
			{ upToDegree: 15, lord: lords[1] },
			{ upToDegree: 21, lord: lords[2] },
			{ upToDegree: 26, lord: lords[3] },
			{ upToDegree: 30, lord: lords[4] },
		];
	}
	return boundsData;
}

const diurnalChaldeanBoundsData = generateChaldeanBoundsData(Sect.DIURNAL);
const nocturnalChaldeanBoundsData = generateChaldeanBoundsData(Sect.NOCTURNAL);

function getBoundsData(boundsMode: BoundsMode, zodiacPositions: ZodiacPositions): BoundsData{
	if (boundsMode === BoundsMode.EGYPTIAN){
		return egyptianBoundsData;
	} else if (boundsMode === BoundsMode.PTOLEMAIC){
		return ptolemaicBoundsData;
	} else { //chaldean
		const sect = getChartSect(zodiacPositions); // will error if no surface pos
		if (sect === Sect.DIURNAL) {
			return diurnalChaldeanBoundsData;
		} else {
			return nocturnalChaldeanBoundsData;
		}
	}
}

export function getBoundLord(node: Node, zodiacPositions: ZodiacPositions, boundsMode: BoundsMode): Node {
	// TODO: investigate if it's possible to give a reasonable result with irregular zodiac systems
	if (irregularAstrologyModes.includes(zodiacPositions.astrologyMode)) {
		throw new Error(`getBoundsLord is not supported for irregular astrology mode: ${zodiacPositions.astrologyMode}`);
	}

	const sign = zodiacPositions.getSymbolOfNode(node);
	const positionInSign = zodiacPositions.getNodePositionWithinSign(node);
	const degreeInSign = positionInSign * 180 / Math.PI;

	const boundsData = getBoundsData(boundsMode, zodiacPositions)
	const bounds = boundsData[sign];
	for (const bound of bounds) {
		if (degreeInSign <= bound.upToDegree) {
			return bound.lord;
		}
	}
}
