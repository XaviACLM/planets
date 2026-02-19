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

export const majorBinaryAspectsKinds: AspectKind[] = [
	AspectKind.CONJUNCTION,
	AspectKind.OPPOSITION,
	AspectKind.TRINE,
	AspectKind.SQUARE,
	AspectKind.SEXTILE,
	AspectKind.PARALLEL,
	AspectKind.CONTRAPARALLEL,
]

export const configurationAspectsKinds: AspectKind[] = [
	AspectKind.GRAND_TRINE,
	AspectKind.GRAND_SQUARE,
	AspectKind.GRAND_SEXTILE,
	AspectKind.T_SQUARE,
	AspectKind.MYSTIC_RECTANGLE,
	AspectKind.FINGER_OF_YOD,
	AspectKind.KITE,
]

export const aspectKindCategories = [
	{
		name: 'Configurations',
		items: configurationAspectsKinds,
	},
	{
		name: 'Major Binary',
		items: majorBinaryAspectsKinds,
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

export const defaultAspectKinds: AspectKind[] = [
	...configurationAspectsKinds,
	...majorBinaryAspectsKinds,
]
