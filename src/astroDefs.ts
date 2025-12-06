export const Zodiac = {
  Aries: 'Aries',
  Taurus: 'Taurus', 
  Gemini: 'Gemini',
  Cancer: 'Cancer',
  Leo: 'Leo',
  Virgo: 'Virgo',
  Libra: 'Libra',
  Scorpio: 'Scorpio',
  Sagittarius: 'Sagittarius',
  Capricorn: 'Capricorn',
  Aquarius: 'Aquarius',
  Pisces: 'Pisces'
} as const;
export type Zodiac = typeof Zodiac[keyof typeof Zodiac];

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
} as const;
export type AstrologyMode = typeof AstrologyMode[keyof typeof AstrologyMode];

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
	
	// arabic parts
	PART_OF_FORTUNE: "Part of Fortune",
	// there's about 400 more. Will need to figure sth out - see below
	
	//lunar
	LUNAR_ASCENDING: "Lunar Ascending",
	LUNAR_DESCENDING: "Lunar Descending",
	LUNAR_APOGEE: "Lunar Apogee", //lilith
	LUNAR_PERIGEE: "Lunar Perigee", // selene
	
	// missing:
	// secondary angles: anti/vertex, east/west points
	
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
    GKUNHOMDIMA: "Gkunhomdima",
	
} as const;
export type Node = typeof Node[keyof typeof Node];

export const defaultNodes: Node[] = [
	Node.SUN,
	Node.MOON,
	Node.MERCURY,
	Node.VENUS,
	Node.MARS,
	Node.JUPITER,
	Node.SATURN,
	Node.URANUS,
	Node.NEPTUNE,
	Node.PLUTO,
	Node.ASCENDANT,
	Node.DESCENDANT,
	Node.MIDHEAVEN,
	Node.IMUM_COELI,
	Node.LUNAR_ASCENDING,
	Node.LUNAR_APOGEE,
	Node.PART_OF_FORTUNE,
	Node.CERES,
	Node.ERIS,
]

export const innerPlanets: Node[] = [
	Node.MERCURY,
	Node.VENUS,
	Node.EARTH,
	Node.MARS,
]

export const outerPlanets: Node[] = [
	Node.MERCURY,
	Node.VENUS,
	Node.EARTH,
	Node.MARS,
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

export const LunarNodeMode = {
	TRUE: "True", //geometric
	MEAN: "Mean", //meeus
} as const;
export type LunarNodeMode = typeof LunarNodeMode[keyof typeof LunarNodeMode];

export const HamburgSchoolMode = {
	WITTE: "Witte/Sieggrün",
	NEELY: "Neely",
} as const;
export type HamburgSchoolMode = typeof HamburgSchoolMode[keyof typeof HamburgSchoolMode];

export const nodeCategories = [
	{
		name: 'Major Bodies',
		items: [
			Node.SUN,
			Node.MOON,
			Node.MERCURY,
			Node.VENUS,
			Node.MARS,
			Node.JUPITER,
			Node.SATURN,
			Node.URANUS,
			Node.NEPTUNE,
			Node.PLUTO
		]
	},
	{
		name: 'Primary Angles',
		items: [
			Node.ASCENDANT,
			Node.DESCENDANT,
			Node.MIDHEAVEN,
			Node.IMUM_COELI
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

export const AspectKind = {
	// major binary
	CONJUNCTION: "Conjunction", // 0
	OPPOSITION: "Opposition", // 1/2
	TRINE: "Trine", // 1/3
	SQUARE: "Square", // 1/4
	SEXTILE: "Sextile", // 1/6
	PARALLEL: "Parallel",  // same eq. latitude
	CONTRAPARALLEL: "Contraparallel", // opposite eq. latitude
	
	// minor binary
    VIGINTILE: "Vigintile", // 1/20
    SEMISEXTILE: "Semisextile", // 1/12
    UNDECILE: "Undecile", // 1/11
    DECILE: "Decile", // 1/10
    NOVILE: "Novile", // 1/9
    SEMISQUARE: "Semisquare", // 1/8
    SEPTILE: "Septile", // 1/7
    QUINTILE: "Quintile", // 1/5
    BINOVILE: "Binovile", // 2/9
    BISEPTILE: "Biseptile", // 2/7
    TREDECILE: "Tredecile", // 3/10
    SESQUIQUADRATE: "Sesquiquadrate", // 3/8
    BIQUINTILE: "Biquintile", // 2/5
    QUINCUNX: "Quincunx", // 5/12
    TRISEPTILE: "Triseptile", // 3/7
    QUADRANOVILE: "Quadranovile", // 4/9
	
	// configurations
	GRAND_TRINE: "Grand Trine", // 3 in trines
	GRAND_SQUARE: "Grand Square", // 4 in consecutive squares
	GRAND_SEXTILE: "Grand Sextile", // 6 in consecutive sextiles
	T_SQUARE: "T-Square", // a square missing one node
	MYSTIC_RECTANGLE: "Mystic Rectangle", // grand sextile missing two opposed nodes
	FINGER_OF_YOD: "Finger of Yod", // two nodes in sextile are quincunx a third
	KITE: "Kite", // grand sextile missing nodes 1 and 3
} as const;
export type AspectKind = typeof AspectKind[keyof typeof AspectKind];

export const aspectKindCategories = [
	{
		name: 'Configurations',
		items: [
			AspectKind.GRAND_TRINE,
			AspectKind.GRAND_SQUARE,
			AspectKind.GRAND_SEXTILE,
			AspectKind.T_SQUARE,
			AspectKind.MYSTIC_RECTANGLE,
			AspectKind.FINGER_OF_YOD,
			AspectKind.KITE,
		]
	},
	{
		name: 'Major Binary',
		items: [
			AspectKind.CONJUNCTION,
			AspectKind.OPPOSITION,
			AspectKind.TRINE,
			AspectKind.SQUARE,
			AspectKind.SEXTILE,
			AspectKind.PARALLEL,
			AspectKind.CONTRAPARALLEL,
		]
	},
	{
		name: 'Minor Binary',
		items: [
			AspectKind.VIGINTILE,
			AspectKind.SEMISEXTILE,
			AspectKind.UNDECILE,
			AspectKind.DECILE,
			AspectKind.NOVILE,
			AspectKind.SEMISQUARE,
			AspectKind.SEPTILE,
			AspectKind.QUINTILE,
			AspectKind.BINOVILE,
			AspectKind.BISEPTILE,
			AspectKind.TREDECILE,
			AspectKind.SESQUIQUADRATE,
			AspectKind.BIQUINTILE,
			AspectKind.QUINCUNX,
			AspectKind.TRISEPTILE,
			AspectKind.QUADRANOVILE,
		]
	},
 ];

export const defaultAspectKinds: Node[] = [
	AspectKind.GRAND_TRINE,
	AspectKind.GRAND_SQUARE,
	AspectKind.GRAND_SEXTILE,
	AspectKind.T_SQUARE,
	AspectKind.MYSTIC_RECTANGLE,
	AspectKind.FINGER_OF_YOD,
	AspectKind.KITE,
	AspectKind.CONJUNCTION,
	AspectKind.OPPOSITION,
	AspectKind.TRINE,
	AspectKind.SQUARE,
	AspectKind.SEXTILE,
	AspectKind.PARALLEL,
	AspectKind.CONTRAPARALLEL,
]