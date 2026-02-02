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

export const standardZodiac: [Zodiac] =[
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

export const AstrologyMode = {
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
export type AstrologyMode = typeof AstrologyMode[keyof typeof AstrologyMode];

// https://storage.yandexcloud.net/j108/library/tzubx8h2/Buz_Overbeck_-_Ayanamsa_-_A_Statistical_Study.pdf
// https://iphemeris.com/blog/document/ayanamsa
// those missing from the code in scripts, pulling swissephemeris data
export const ayanamsas: Partial<Record<AstrologyMode, number>> = {
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

export const irregularAstrologyModes: AstrologyMode[] = Object.values(AstrologyMode).filter(mode => 
    mode !== AstrologyMode.TROPICAL && 
    !(Object.keys(ayanamsas) as AstrologyMode[]).includes(mode)
) as AstrologyMode[];

export const zodiacLongitudeClosest: Record<Zodiac, number> = {
	[Zodiac.ARIES] : 0.610481957714658,
	[Zodiac.TAURUS] : 0.809283631691531,
	[Zodiac.GEMINI] : 1.5267809525908373,
	[Zodiac.CANCER] : 2.1034634737766833,
	[Zodiac.LEO] : 2.4448001259141483,
	[Zodiac.VIRGO] : 3.010302580817891,
	[Zodiac.LIBRA] : 3.7901704662198483,
	[Zodiac.SCORPIO] : 4.18304646518869,
	[Zodiac.OPHIUCHUS] : 4.291068045815738,
	[Zodiac.SAGITTARIUS] : 4.666853099398361,
	[Zodiac.CAPRICORN] : 5.177419308949345,
	[Zodiac.AQUARIUS] : 5.664778889649456,
	[Zodiac.PISCES] : 6.137074041724778,
}

export const zodiacLongitudeIAU: Record<Zodiac, number> = {
	[Zodiac.ARIES] : 0.5006710809308025,
	[Zodiac.TAURUS] : 0.932292091737694,
	[Zodiac.GEMINI] : 1.5732392440197722,
	[Zodiac.CANCER] : 2.059288010209377,
	[Zodiac.LEO] : 2.4092369528387416,
	[Zodiac.VIRGO] : 3.034271715326123,
	[Zodiac.LIBRA] : 3.801490778565342,
	[Zodiac.SCORPIO] : 4.208082360282873,
	[Zodiac.OPHIUCHUS] : 4.3220852335887985,
	[Zodiac.SAGITTARIUS] : 4.646721441014687,
	[Zodiac.CAPRICORN] : 5.229995888867893,
	[Zodiac.AQUARIUS] : 5.715748880259971,
	[Zodiac.PISCES] : 6.13567725989199,
}

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

export const mainAngles = [
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

// Here and below Ophiuchus gets assigned to Pluto (common suggestion of Schmidt and Berg)
export const classicalRulerships: Record<Zodiac, Node> = {
	[Zodiac.ARIES]: Node.MARS,
	[Zodiac.TAURUS]: Node.VENUS,
	[Zodiac.GEMINI]: Node.MERCURY,
	[Zodiac.CANCER]: Node.MOON,
	[Zodiac.LEO]: Node.SUN,
	[Zodiac.VIRGO]: Node.MERCURY,
	[Zodiac.LIBRA]: Node.VENUS,
	[Zodiac.SCORPIO]: Node.MARS,
	[Zodiac.OPHIUCHUS]: Node.PLUTO,
	[Zodiac.SAGITTARIUS]: Node.JUPITER,
	[Zodiac.CAPRICORN]: Node.SATURN,
	[Zodiac.AQUARIUS]: Node.SATURN,
	[Zodiac.PISCES]: Node.JUPITER,
};

export const modernRulerships: Record<Zodiac, Node> = {
	[Zodiac.ARIES]: Node.MARS,
	[Zodiac.TAURUS]: Node.VENUS,
	[Zodiac.GEMINI]: Node.MERCURY,
	[Zodiac.CANCER]: Node.MOON,
	[Zodiac.LEO]: Node.SUN,
	[Zodiac.VIRGO]: Node.MERCURY,
	[Zodiac.LIBRA]: Node.VENUS,
	[Zodiac.SCORPIO]: Node.PLUTO,
	[Zodiac.OPHIUCHUS]: Node.PLUTO,
	[Zodiac.SAGITTARIUS]: Node.JUPITER,
	[Zodiac.CAPRICORN]: Node.SATURN,
	[Zodiac.AQUARIUS]: Node.URANUS,
	[Zodiac.PISCES]: Node.NEPTUNE,
};

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

export const traditionalHouseAngularities: HouseAngularity[] = [
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

export const fixedStars: Record<string, number> = {
	// in J2000 ecliptic longitude
	["Aldebaran"] : 69.785,
	["Algol"] : 56.163,
	["Sirius"] : 104.077,
	["Procyon"] : 115.781,
	["Regulus"] : 149.825,
	["Alkaid"] : 176.929,
	["Alcyone"] : 59.988,
	["Capella"] : 81.854,
	["Spica"] : 203.837,
	["Arcturus"] : 204.229,
	["Alphecca"] : 222.291,
	["Antares"] : 249.758,
	["Vega"] : 285.312,
	["Deneb Algedi"] : 323.538,
	["Unukalhai"] : 232.071,
	["Fomalhaut"] : 333.856, //not behenian, but royal
}

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