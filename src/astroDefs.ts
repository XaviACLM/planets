export const Zodiac = {
	ARIES: 'Aries',
	TAURUS: 'Taurus', 
	GEMINI: 'Gemini',
	CANCER: 'Cancer',
	LEO: 'Leo',
	VIRGO: 'Virgo',
	LIBRA: 'Libra',
	SCORPIO: 'Scorpio',
	OPHIUCHUS: 'Ophiuchus',
	SAGITTARIUS: 'Sagittarius',
	CAPRICORN: 'Capricorn',
	AQUARIUS: 'Aquarius',
	PISCES: 'Pisces'
} as const;
export type Zodiac = typeof Zodiac[keyof typeof Zodiac];

export const standardZodiac: Zodiac[] =[
	Zodiac.ARIES,
	Zodiac.TAURUS,
	Zodiac.GEMINI,
	Zodiac.CANCER,
	Zodiac.LEO,
	Zodiac.VIRGO,
	Zodiac.LIBRA,
	Zodiac.SCORPIO,
	Zodiac.SAGITTARIUS,
	Zodiac.CAPRICORN,
	Zodiac.AQUARIUS,
	Zodiac.PISCES,
];

export const ZodiacMode = {
	TROPICAL: "Tropical",
	SIDEREAL_LAHIRI: "Sidereal - Lahiri",
	SIDEREAL_FAGAN_BRADLEY: "Sidereal - Fagan / Bradley",
	SIDEREAL_RAMAN: "Sidereal - Raman",
	SIDEREAL_KRISHNAMURTI: "Sidereal - Krishnamurti",
	SIDEREAL_YUKTESHWAR: "Sidereal - Yukteshwar",
	SIDEREAL_DE_LUCE: "Sidereal - De Luce",
	SIDEREAL_HIPPARCHOS: "Sidereal - Hipparchos",
	SIDEREAL_BABYLONIAN: "Sidereal - Babylonian",
	SIDEREAL_HUBER: "Sidereal - Huber",
	SIDEREAL_SURYASIDDHANTA: "Sidereal - Suryasiddhanta",
	SIDEREAL_TRUE_CITRA: "Sidereal - True Citra",
	SIDEREAL_TRUE_REVANTI: "Sidereal - True Revanti",
	CONSTELLATIONS_CLOSEST: "Constellations - Closest",
	CONSTELLATIONS_IAU: "Constellations - IAU / Berg",
} as const;
export type ZodiacMode = typeof ZodiacMode[keyof typeof ZodiacMode];

export const irregularZodiacModes: ZodiacMode[] = [
	ZodiacMode.CONSTELLATIONS_CLOSEST, 
	ZodiacMode.CONSTELLATIONS_IAU
];

export const Element = {
  AIR: 'Air',
  FIRE: 'Fire',
  EARTH: 'Earth',
  WATER: 'Water',
} as const;
export type Element = typeof Element[keyof typeof Element];

export const Mode = {
  CARDINAL: 'Cardinal',
  FIXED: 'Fixed',
  MUTABLE: 'Mutable',
} as const;
export type Mode = typeof Mode[keyof typeof Mode];

export const zodiacElement: Partial<Record<Zodiac, Element>> = {
	[Zodiac.ARIES] : Element.FIRE,
	[Zodiac.TAURUS] : Element.EARTH,
	[Zodiac.GEMINI] : Element.AIR,
	[Zodiac.CANCER] : Element.WATER,
	[Zodiac.LEO] : Element.FIRE,
	[Zodiac.VIRGO] : Element.EARTH,
	[Zodiac.LIBRA] : Element.AIR,
	[Zodiac.SCORPIO] : Element.WATER,
	[Zodiac.SAGITTARIUS] : Element.FIRE,
	[Zodiac.CAPRICORN] : Element.EARTH,
	[Zodiac.AQUARIUS] : Element.AIR,
	[Zodiac.PISCES] : Element.WATER,
}

export const zodiacMode: Partial<Record<Zodiac, Mode>> = {
	[Zodiac.ARIES] : Mode.CARDINAL,
	[Zodiac.TAURUS] : Mode.FIXED,
	[Zodiac.GEMINI] : Mode.MUTABLE,
	[Zodiac.CANCER] : Mode.CARDINAL,
	[Zodiac.LEO] : Mode.FIXED,
	[Zodiac.VIRGO] : Mode.MUTABLE,
	[Zodiac.LIBRA] : Mode.CARDINAL,
	[Zodiac.SCORPIO] : Mode.FIXED,
	[Zodiac.SAGITTARIUS] : Mode.MUTABLE,
	[Zodiac.CAPRICORN] : Mode.CARDINAL,
	[Zodiac.AQUARIUS] : Mode.FIXED,
	[Zodiac.PISCES] : Mode.MUTABLE,
}

export const Node = {
	// bodies
	SUN: "Sun",
	MOON: "Moon",
	MERCURY: "Mercury",
	VENUS: "Venus",
	MARS: "Mars",
	JUPITER: "Jupiter",
	SATURN: "Saturn",
	URANUS: "Uranus",
	NEPTUNE: "Neptune",
	PLUTO: "Pluto",
	
	// primary angles
	ASCENDANT: "Ascendant",
	DESCENDANT: "Descendant",
	MIDHEAVEN: "Midheaven",
	IMUM_COELI: "Imum Coeli",
	// other angles
	VERTEX: "Vertex",
	ANTIVERTEX: "Antivertex",
	VERNAL_EQUINOX: "Vernal Equinox",
	AUTUMNAL_EQUINOX: "Autumnal Equinox",
	
	// arabic parts
	PART_OF_FORTUNE: "Part of Fortune",
	// there's about 400 more. Will need to figure sth out - see below
	
	//lunar
	LUNAR_ASCENDING: "Lunar Ascending",
	LUNAR_DESCENDING: "Lunar Descending",
	LUNAR_APOGEE: "Lunar Apogee", //lilith
	LUNAR_PERIGEE: "Lunar Perigee", // selene
	
	// minor bodies
	CERES: "Ceres",
	PALLAS: "Pallas",
	JUNO: "Juno",
	VESTA: "Vesta",
	CHIRON: "Chiron",
	ERIS: "Eris",
	MAKEMAKE: "Makemake",
	HAUMEA: "Haumea",
	SEDNA: "Sedna",
	
	// hamburg school objects
	CUPIDO: "Cupido",
	HADES: "Hades",
	ZEUS: "Zeus",
	KRONOS: "Kronos",
	APOLLON: "Apollon",
	ADMETOS: "Admetos",
	VULCANUS: "Vulcanus",
	POSEIDON: "Poseidon",
	
	// minor minor bodies
	ASTRAEA: "Astraea",
	HYGIEA: "Hygiea",
	PHOLUS: "Pholus",
	NESSUS: "Nessus",
	CHARIKLO: "Chariklo",
	HYLONOME: "Hylonome",
	CYLLARUS: "Cyllarus",
	GONGGONG: "Gonggong",
	QUAOAR: "Quaoar",
	ORCUS: "Orcus",
	SALACIA: "Salacia",
	VARDA: "Varda",
	IXION: "Ixion",
	VARUNA: "Varuna",
	TYPHON: "Typhon",
	CHAOS: "Chaos",
	RADAMANTHUS: "Radamanthus",
	GKUNHOMDIMA: "Gǃkúnǁʼhòmdímà",
	
} as const;
export type Node = typeof Node[keyof typeof Node];

export const personalPlanets: Node[] = [
	Node.SUN,
	Node.MOON,
	Node.MERCURY,
	Node.VENUS,
	Node.MARS,
]

export const socialPlanets: Node[] = [
	Node.JUPITER,
	Node.SATURN,
]

export const transpersonalPlanets: Node[] = [
	Node.URANUS,
	Node.NEPTUNE,
	Node.PLUTO,
]

export const standardNodes: Node[] = [
	...personalPlanets,
	...socialPlanets,
	...transpersonalPlanets,
]

export const mainAngles: Node[] = [
	Node.ASCENDANT,
	Node.IMUM_COELI,
	Node.DESCENDANT,
	Node.MIDHEAVEN,
];

export const initiallySelectedNodes: Node[] = [
	...standardNodes,
	...mainAngles,
	Node.LUNAR_ASCENDING,
	Node.LUNAR_APOGEE,
	Node.PART_OF_FORTUNE,
	Node.CERES,
	Node.ERIS,
]

export const NodeType = {
	BODY: "Body",
	POINT: "Point",
	HYPOTHETICAL: "Hypothetical",
} as const;
export type NodeType = typeof NodeType[keyof typeof NodeType];

export const nodeTypes: Record<Node, NodeType> = {
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
	[Node.VERTEX] : NodeType.POINT,
	[Node.ANTIVERTEX] : NodeType.POINT,
	[Node.VERNAL_EQUINOX] : NodeType.POINT,
	[Node.AUTUMNAL_EQUINOX] : NodeType.POINT,
	
	[Node.PART_OF_FORTUNE] : NodeType.POINT,
	
	[Node.LUNAR_ASCENDING] : NodeType.POINT,
	[Node.LUNAR_DESCENDING] : NodeType.POINT,
	[Node.LUNAR_APOGEE] : NodeType.POINT,
	[Node.LUNAR_PERIGEE] : NodeType.POINT,
	
	[Node.CERES] : NodeType.BODY,
	[Node.PALLAS] : NodeType.BODY,
	[Node.JUNO] : NodeType.BODY,
	[Node.VESTA] : NodeType.BODY,
	[Node.CHIRON] : NodeType.BODY,
	[Node.ERIS] : NodeType.BODY,
	[Node.MAKEMAKE] : NodeType.BODY,
	[Node.HAUMEA] : NodeType.BODY,
	[Node.SEDNA] : NodeType.BODY,
	
	[Node.CUPIDO] : NodeType.HYPOTHETICAL,
	[Node.HADES] : NodeType.HYPOTHETICAL,
	[Node.ZEUS] : NodeType.HYPOTHETICAL,
	[Node.KRONOS] : NodeType.HYPOTHETICAL,
	[Node.APOLLON] : NodeType.HYPOTHETICAL,
	[Node.ADMETOS] : NodeType.HYPOTHETICAL,
	[Node.VULCANUS] : NodeType.HYPOTHETICAL,
	[Node.POSEIDON] : NodeType.HYPOTHETICAL,
	
	[Node.ASTRAEA] : NodeType.BODY,
	[Node.HYGIEA] : NodeType.BODY,
	[Node.PHOLUS] : NodeType.BODY,
	[Node.NESSUS] : NodeType.BODY,
	[Node.CHARIKLO] : NodeType.BODY,
	[Node.HYLONOME] : NodeType.BODY,
	[Node.CYLLARUS] : NodeType.BODY,
	[Node.GONGGONG] : NodeType.BODY,
	[Node.QUAOAR] : NodeType.BODY,
	[Node.ORCUS] : NodeType.BODY,
	[Node.SALACIA] : NodeType.BODY,
	[Node.VARDA] : NodeType.BODY,
	[Node.IXION] : NodeType.BODY,
	[Node.VARUNA] : NodeType.BODY,
	[Node.TYPHON] : NodeType.BODY,
	[Node.CHAOS] : NodeType.BODY,
	[Node.RADAMANTHUS] : NodeType.BODY,
	[Node.GKUNHOMDIMA] : NodeType.BODY,
}

export const nodeDependsOnLocation: Record<Node, boolean> = {
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
	[Node.VERTEX] : true,
	[Node.ANTIVERTEX] : true,
	[Node.VERNAL_EQUINOX] : false,
	[Node.AUTUMNAL_EQUINOX] : false,
	
	[Node.PART_OF_FORTUNE] : true,
	
	[Node.LUNAR_ASCENDING] : false,
	[Node.LUNAR_DESCENDING] : false,
	[Node.LUNAR_APOGEE] : false,
	[Node.LUNAR_PERIGEE] : false,
	
	[Node.CERES] : false,
	[Node.PALLAS] : false,
	[Node.JUNO] : false,
	[Node.VESTA] : false,
	[Node.CHIRON] : false,
	[Node.ERIS] : false,
	[Node.MAKEMAKE] : false,
	[Node.HAUMEA] : false,
	[Node.SEDNA] : false,
	
	[Node.CUPIDO] : false,
	[Node.HADES] : false,
	[Node.ZEUS] : false,
	[Node.KRONOS] : false,
	[Node.APOLLON] : false,
	[Node.ADMETOS] : false,
	[Node.VULCANUS] : false,
	[Node.POSEIDON] : false,
	
	[Node.ASTRAEA] : false,
	[Node.HYGIEA] : false,
	[Node.PHOLUS] : false,
	[Node.NESSUS] : false,
	[Node.CHARIKLO] : false,
	[Node.HYLONOME] : false,
	[Node.CYLLARUS] : false,
	[Node.GONGGONG] : false,
	[Node.QUAOAR] : false,
	[Node.ORCUS] : false,
	[Node.SALACIA] : false,
	[Node.VARDA] : false,
	[Node.IXION] : false,
	[Node.VARUNA] : false,
	[Node.TYPHON] : false,
	[Node.CHAOS] : false,
	[Node.RADAMANTHUS] : false,
	[Node.GKUNHOMDIMA] : false,
}

export interface SurfacePosition {
	latitude: number;
	longitude: number
}

// Dignity data - single source of truth for domicile, exaltation, detriment, fall
export type DignityData = {
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

export const classicalDignityData: Partial<Record<Node, DignityData>> = {
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

export const modernDignityData: Partial<Record<Node, DignityData>> = {
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

// Extract Zodiac->Node rulership map from dignity data
function extractRulerships(dignityData: Partial<Record<Node, DignityData>>): Partial<Record<Zodiac, Node>> {
	const rulerships: Partial<Record<Zodiac, Node>> = {};
	for (const [node, data] of Object.entries(dignityData)) {
		for (const sign of data.domicile) {
			rulerships[sign] = node as Node;
		}
	}
	return rulerships;
}

// Ophiuchus gets assigned to Pluto (common suggestion of Schmidt and Berg)
export const classicalRulerships: Record<Zodiac, Node> = {
	...extractRulerships(classicalDignityData),
	[Zodiac.OPHIUCHUS]: Node.PLUTO,
} as Record<Zodiac, Node>;

export const modernRulerships: Record<Zodiac, Node> = {
	...extractRulerships(modernDignityData),
	[Zodiac.OPHIUCHUS]: Node.PLUTO,
} as Record<Zodiac, Node>;

export const nodeCategories = [
	{
		name: 'Major Bodies',
		items: standardNodes,
	},
	{
		name: 'Primary Angles',
		items: [
			...mainAngles,
			Node.VERTEX,
			Node.ANTIVERTEX,
			Node.VERNAL_EQUINOX,
			Node.AUTUMNAL_EQUINOX
		]
	},
	{
		name: 'Arabic Parts',
		items: [
			Node.PART_OF_FORTUNE
		]
	},
	{
		name: 'Lunar Nodes',
		items: [
			Node.LUNAR_ASCENDING,
			Node.LUNAR_DESCENDING, 
			Node.LUNAR_APOGEE,
			Node.LUNAR_PERIGEE
		]
	},
	{
		name: 'Major Asteroids & Dwarfs',
		items: [
			Node.CERES,
			Node.PALLAS,
			Node.JUNO,
			Node.VESTA,
			Node.CHIRON,
			Node.ERIS,
			Node.MAKEMAKE,
			Node.HAUMEA,
			Node.SEDNA
		]
	},
	{
		name: 'Hamburg School Objects',
		items: [
			Node.CUPIDO,
			Node.HADES,
			Node.ZEUS,
			Node.KRONOS,
			Node.APOLLON,
			Node.ADMETOS,
			Node.VULCANUS,
			Node.POSEIDON,
		]
	},
	{
		name: 'Minor Bodies',
		items: [
			Node.ASTRAEA,
			Node.HYGIEA,
			Node.PHOLUS,
			Node.NESSUS,
			Node.CHARIKLO,
			Node.HYLONOME,
			Node.CYLLARUS,
			Node.GONGGONG,
			Node.QUAOAR,
			Node.ORCUS,
			Node.SALACIA,
			Node.VARDA,
			Node.IXION,
			Node.VARUNA,
			Node.TYPHON,
			Node.CHAOS,
			Node.RADAMANTHUS,
			Node.GKUNHOMDIMA,
		]
	}
];

export const HouseAngularity = {
	ANGULAR: "Angular",
	SUCCEDENT: "Succedent",
	CADENT: "Cadent",
} as const;
export type HouseAngularity = typeof HouseAngularity[keyof typeof HouseAngularity];

export const traditionalHouseAngularities: (HouseAngularity | null)[] = [
	HouseAngularity.ANGULAR,
	HouseAngularity.SUCCEDENT,
	HouseAngularity.CADENT,
	HouseAngularity.ANGULAR,
	HouseAngularity.SUCCEDENT,
	HouseAngularity.CADENT,
	HouseAngularity.ANGULAR,
	HouseAngularity.SUCCEDENT,
	HouseAngularity.CADENT,
	HouseAngularity.ANGULAR,
	HouseAngularity.SUCCEDENT,
	HouseAngularity.CADENT,
	null, //13th house
]

export const Sect = {
	DIURNAL: "Diurnal",
	NOCTURNAL: "Nocturnal",
	VARIABLE: "Variable",
} as const;
export type Sect = typeof Sect[keyof typeof Sect];

export const planetSects: Partial<Record<Node, Sect>> = {
	[Node.SUN]: Sect.DIURNAL,
	[Node.JUPITER]: Sect.DIURNAL,
	[Node.SATURN]: Sect.DIURNAL,
	[Node.MOON]: Sect.NOCTURNAL,
	[Node.VENUS]: Sect.NOCTURNAL,
	[Node.MARS]: Sect.NOCTURNAL,
	[Node.MERCURY]: Sect.VARIABLE,
};
