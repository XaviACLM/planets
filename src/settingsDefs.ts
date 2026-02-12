export const LunarNodeMode = {
	TRUE: "True", //geometric
	MEAN: "Mean", //meeus
} as const;
export type LunarNodeMode = typeof LunarNodeMode[keyof typeof LunarNodeMode];

export const DignityMode = {
	CLASSICAL: "Classical",
	MODERN: "Modern",
} as const;
export type DignityMode = typeof DignityMode[keyof typeof DignityMode];

export const HamburgSchoolMode = {
	WITTE: "Witte", //Witte / Sieggrün
	NEELY: "Neely",
} as const;
export type HamburgSchoolMode = typeof HamburgSchoolMode[keyof typeof HamburgSchoolMode];

export const AspectPhysicalityFilter = {
	ALL_PHYSICAL: "All",
	ALL_BUT_ONE_PHYSICAL: "All but one",
	ONE_PHYSICAL: "One",
	NO_PHYSICAL: "None",
} as const;
export type AspectPhysicalityFilter = typeof AspectPhysicalityFilter[keyof typeof AspectPhysicalityFilter];

export const AspectMenuMode = {
	SHOW_ALL: "All",
	SHOW_ONLY_MAXIMAL: "Only maximal",
	SHOW_MAXIMAL_WITH_SUBMENUS: "Maximal with submenus",
} as const;
export type AspectMenuMode = typeof AspectMenuMode[keyof typeof AspectMenuMode];

export const AspectErrorMode = {
	POINTWISE_MAX: "Pointwise max",
	POINTWISE_SUM: "Pointwise sum",
	PAIRWISE_OUTER_MAX: "Pairwise outer max",
	PAIRWISE_OUTER_SUM: "Pairwise outer sum",
	PAIRWISE_FULL_MAX: "Pairwise full max",
	PAIRWISE_FULL_SUM: "Pairwise full sum",
} as const;
export type AspectErrorMode = typeof AspectErrorMode[keyof typeof AspectErrorMode];

export const HouseAngularityMode = {
	TRADITIONAL: "Traditional",
	VERIFIED: "Verified",
	DYNAMIC: "Dynamic",
} as const;
export type HouseAngularityMode = typeof HouseAngularityMode[keyof typeof HouseAngularityMode];

export const TriplicityMode = {
	DOROTHEAN: "Dorothean",
	PTOLEMAIC_LILLY: "Ptolemaic / Lilly",
} as const;
export type TriplicityMode = typeof TriplicityMode[keyof typeof TriplicityMode];

export const FaceMode = {
	CHALDEAN_PTOLEMAIC: "Chaldean / Ptolemaic",
	MODERN: "Modern",
} as const;
export type FaceMode = typeof FaceMode[keyof typeof FaceMode];

export const BoundsMode = {
	EGYPTIAN: "Egyptian",
	PTOLEMAIC: "Ptolemaic",
	CHALDEAN: "Chaldean",
} as const;
export type BoundsMode = typeof BoundsMode[keyof typeof BoundsMode];

export const Theme = {
	DARK: "Dark",
	PARCHMENT: "Parchment",
} as const;
export type Theme = typeof Theme[keyof typeof Theme];

export const NodesToConsider = {
	STANDARD: "Standard (P&L)",
	PHYSICAL: "Physical",
	ALL : "All nodes",
} as const;
export type NodesToConsider = typeof NodesToConsider[keyof typeof NodesToConsider];

export const HouseSystem = {
	WHOLE_SIGN: "Whole Sign",
	EQUAL_HOUSES: "Equal Houses",
	PORPHYRY: "Porphyry",
	EQUAL_HOUSES_VEHLOW: "Equal Houses - Vehlow",
	WHOLE_SIGN_ARIES: "Whole Sign - Aries",

	KRUSINSKY: "Krusinsky",
	REGIOMONTANUS: "Regiomontanus",
	MERIDIAN: "Meridian",
	MORINUS: "Morinus",
	CAMPANUS: "Campanus",
	ZENITH_HORIZONTAL: "Zenith / Horizontal",

	PLACIDUS: "Placidus",
	KOCH: "Koch / Birthplace",
} as const;
export type HouseSystem = typeof HouseSystem[keyof typeof HouseSystem];