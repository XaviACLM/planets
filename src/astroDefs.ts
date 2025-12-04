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
	
} as const;
export type Node = typeof Node[keyof typeof Node];

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
