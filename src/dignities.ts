import { Node, Zodiac, DignityMode } from './astroDefs.ts';
import ZodiacPositions from './zodiacPositions.ts';

export const Dignity = {
	DOMICILE: "Domicile",
	EXALTATION: "Exaltation",
	DETRIMENT: "Detriment",
	FALL: "Fall",
	PEREGRINE: "Peregrine",
} as const;
export type Dignity = typeof Dignity[keyof typeof Dignity];

type DignityData = {
	domicile: Zodiac[];
	exaltation: { sign: Zodiac; degree?: number } | null;
	detriment: Zodiac[];
	fall: { sign: Zodiac; degree?: number } | null;
};

const baseDignityData: Partial<Record<Node, DignityData>> = {
	[Node.SUN]: {
		domicile: [Zodiac.LEO],
		exaltation: { sign: Zodiac.ARIES, degree: 19 },
		detriment: [Zodiac.AQUARIUS],
		fall: { sign: Zodiac.LIBRA, degree: 19 },
	},
	[Node.MOON]: {
		domicile: [Zodiac.CANCER],
		exaltation: { sign: Zodiac.TAURUS, degree: 3 },
		detriment: [Zodiac.CAPRICORN],
		fall: { sign: Zodiac.SCORPIO, degree: 3 },
	},
	[Node.MERCURY]: {
		domicile: [Zodiac.GEMINI, Zodiac.VIRGO],
		exaltation: { sign: Zodiac.VIRGO, degree: 15 },
		detriment: [Zodiac.SAGITTARIUS, Zodiac.PISCES],
		fall: { sign: Zodiac.PISCES, degree: 15 },
	},
	[Node.VENUS]: {
		domicile: [Zodiac.TAURUS, Zodiac.LIBRA],
		exaltation: { sign: Zodiac.PISCES, degree: 27 },
		detriment: [Zodiac.ARIES, Zodiac.SCORPIO],
		fall: { sign: Zodiac.VIRGO, degree: 27 },
	},
};

const classicalDignityData: Partial<Record<Node, DignityData>> = {
	...baseDignityData,
	[Node.MARS]: {
		domicile: [Zodiac.ARIES, Zodiac.SCORPIO],
		exaltation: { sign: Zodiac.CAPRICORN, degree: 28 },
		detriment: [Zodiac.LIBRA, Zodiac.TAURUS],
		fall: { sign: Zodiac.CANCER, degree: 28 },
	},
	[Node.JUPITER]: {
		domicile: [Zodiac.SAGITTARIUS, Zodiac.PISCES],
		exaltation: { sign: Zodiac.CANCER, degree: 15 },
		detriment: [Zodiac.GEMINI, Zodiac.VIRGO],
		fall: { sign: Zodiac.CAPRICORN, degree: 15 },
	},
	[Node.SATURN]: {
		domicile: [Zodiac.CAPRICORN, Zodiac.AQUARIUS],
		exaltation: { sign: Zodiac.LIBRA, degree: 21 },
		detriment: [Zodiac.CANCER, Zodiac.LEO],
		fall: { sign: Zodiac.ARIES, degree: 21 },
	},
};

const modernDignityData: Partial<Record<Node, DignityData>> = {
	...baseDignityData,
	[Node.MARS]: {
		domicile: [Zodiac.ARIES],
		exaltation: { sign: Zodiac.CAPRICORN, degree: 28 },
		detriment: [Zodiac.LIBRA],
		fall: { sign: Zodiac.CANCER, degree: 28 },
	},
	[Node.JUPITER]: {
		domicile: [Zodiac.SAGITTARIUS],
		exaltation: { sign: Zodiac.CANCER, degree: 15 },
		detriment: [Zodiac.GEMINI],
		fall: { sign: Zodiac.CAPRICORN, degree: 15 },
	},
	[Node.SATURN]: {
		domicile: [Zodiac.CAPRICORN],
		exaltation: { sign: Zodiac.LIBRA, degree: 21 },
		detriment: [Zodiac.CANCER],
		fall: { sign: Zodiac.ARIES, degree: 21 },
	},
	[Node.URANUS]: {
		domicile: [Zodiac.AQUARIUS],
		exaltation: { sign: Zodiac.SCORPIO },
		detriment: [Zodiac.LEO],
		fall: { sign: Zodiac.TAURUS },
	},
	[Node.NEPTUNE]: {
		domicile: [Zodiac.PISCES],
		exaltation: { sign: Zodiac.CANCER },
		detriment: [Zodiac.VIRGO],
		fall: { sign: Zodiac.CAPRICORN },
	},
	[Node.PLUTO]: {
		domicile: [Zodiac.SCORPIO],
		exaltation: { sign: Zodiac.LEO },
		detriment: [Zodiac.TAURUS],
		fall: { sign: Zodiac.AQUARIUS },
	},
};

export type DignityState = {
	dignity: Dignity;
	degreeOffset?: number;
};

export function getDignityState(node: Node, zodiacPositions: ZodiacPositions, dignityMode: DignityMode): DignityState | null {
	const dignityData = dignityMode === DignityMode.CLASSICAL ? classicalDignityData : modernDignityData;

	const data = dignityData[node];
	if (!data) {
		return null;
	}

	const sign = zodiacPositions.getSymbolOfNode(node) as unknown as Zodiac;
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
