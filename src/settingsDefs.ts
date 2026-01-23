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
	WITTE: "Witte/Sieggrün",
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
