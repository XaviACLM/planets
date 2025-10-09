export function distance(p1: number, p2: number): number {
	const twoPi = 2 * Math.PI;
	p1 = ((p1 % twoPi) + twoPi) % twoPi;
	p2 = ((p2 % twoPi) + twoPi) % twoPi;

	const d = Math.abs(p1 - p2);
	return Math.min(d, twoPi - d);
}

export function regularArrangement(n: number, phase: number): number[] {
	const twoPi = 2 * Math.PI;
	phase = ((phase % (twoPi / n)) + (twoPi / n)) % (twoPi / n);

	return Array.from({ length: n }, (_, i) => (twoPi * i) / n + phase);
}

export function emDistanceWithKnownBasis(
	a1: number[],
	a2: number[],
	i1: number,
	i2: number,
	n: number
): number {
	let d = 0;
	if (i1 < 0) {i1 = n+i1}
	if (i2 < 0) {i2 = n+i2}
	for (let i = 0; i < n; i++) {
		const i1a = (i1 + i) % n;
		const i2a = (i2 + i) % n;
		d += distance(a1[i1a], a2[i2a]);
	}
	return d;
}

export function minEmDistanceToRegular(arrangement: number[], n: number): number {
	const twoPi = 2 * Math.PI;
	const distances: number[] = [];

	for (let i = 0; i < arrangement.length; i++) {
		const p = arrangement[i];
		const phase = ((p % (twoPi / n)) + (twoPi / n)) % (twoPi / n);
		const rotatedArrangement = regularArrangement(n, phase);
		const ri = Math.floor(p / (twoPi / n));
		const d = emDistanceWithKnownBasis(arrangement, rotatedArrangement, i, ri, n);
		distances.push(d);
	}

	return Math.min(...distances);
}

export const percentiles: Record<string, Record<string, number>> = {'2': {'10': 2.82492183405002, '20': 2.512041226571723, '30': 2.196411448548795, '40': 1.8833191534301896, '50': 1.569921378032447, '60': 1.2565291282897997, '70': 0.943533088305391, '80': 0.6289363773733934, '90': 0.31426461359944025, '91': 0.28295033258869606, '92': 0.2515173548879527, '93': 0.2198807155608602, '94': 0.18836926606823035, '95': 0.156681304618711, '96': 0.12505089992205187, '97': 0.09376445765856845, '98': 0.06261846817645944, '99': 0.030974986598556242, '99.1': 0.027730709593221547, '99.2': 0.024610971758071365, '99.3': 0.021292932878626214, '99.4': 0.01830529033281625, '99.5': 0.015244978397931597, '99.6': 0.012309232548422422, '99.7': 0.009199138048033184, '99.8': 0.006261577693059683, '99.9': 0.0030901848856057512, '99.91': 0.0027720456600333065, '99.92': 0.002437166039547911, '99.93': 0.00215310303920635, '99.94': 0.0018285670722661962, '99.95': 0.0015746806831060528, '99.96': 0.0012591241475501391, '99.97': 0.0009524308855546337, '99.98': 0.0006672645240300978, '99.99': 0.0003276868002454192}, '3': {'10': 3.0433980889212435, '20': 2.5663016323864913, '30': 2.202845884191832, '40': 1.98801913665014, '50': 1.815081392549216, '60': 1.623343087799249, '70': 1.4059043377043596, '80': 1.1466470558154458, '90': 0.8115627097763858, '91': 0.7699958135339398, '92': 0.7255806614732099, '93': 0.6788806715105213, '94': 0.6296097321664045, '95': 0.5745558614550759, '96': 0.5140696466163157, '97': 0.4456329036665362, '98': 0.36326532020019453, '99': 0.2553297808209758, '99.1': 0.2416539062470937, '99.2': 0.22790125078946266, '99.3': 0.21458409285450064, '99.4': 0.19846511792718619, '99.5': 0.1816169971798196, '99.92': 0.07326885358201485, '99.93': 0.06882048558514198, '99.94': 0.0638312549184959, '99.95': 0.058498528643549985,'99.96': 0.05368625534037133, '99.97': 0.04652398288526749, '99.98': 0.038326443743930017, '99.99': 0.025862032539675894}, '4': {'10': 3.9688370515063665, '20': 3.366192207397342, '30': 2.953952825302361, '40': 2.646158770106605, '50': 2.3777607525037605, '60': 2.123381297800478, '70': 1.8702420189090312, '80': 1.606233836129107, '90': 1.2740754773747365, '91': 1.2298418954913422, '92': 1.182766245072856, '93': 1.1304085360141483, '94': 1.0741913727443777, '95': 1.011725679942291, '96': 0.939552870925971, '97': 0.8548837011422066, '98': 0.7454112479134012, '99': 0.5923037906530073, '99.1': 0.5719726816038473, '99.2': 0.5502923150442507, '99.3': 0.5255723352180417, '99.4': 0.4991385603366061, '99.5': 0.4689258108271657, '99.6': 0.4367472810938051, '99.7': 0.39619422850092784, '99.8': 0.34753838589917463, '99.9': 0.2757971182914186, '99.91': 0.2646780346879165, '99.92': 0.25416998306586214, '99.93': 0.24294073388148685, '99.94': 0.23240263630500624, '99.95': 0.21876192560498597, '99.96': 0.2032878359611795, '99.97': 0.18271250779903936, '99.98': 0.1609410282549268, '99.99': 0.1277382351705474}, '6': {'10': 4.861979942391542, '20': 4.165824147541702, '30': 3.7050527406016895, '40': 3.3430431451880844, '50': 3.0316183170212065, '60': 2.7436445212860034, '70': 2.46340007805307, '80': 2.1664567198443647, '90': 1.8032908060598274, '91': 1.7581808252833215, '92': 1.7105679094026873, '93': 1.6576819941120893, '94': 1.601416904121481, '95': 1.5390897157787307, '96': 1.4667360484390772, '97': 1.379112684234093, '98': 1.2705770909966823, '99': 1.1033306952679172, '99.1': 1.0792459662262117, '99.2': 1.0536308331925373, '99.3': 1.0252700011827163, '99.4': 0.9951440299783612, '99.5': 0.960482623760968, '99.6': 0.9168232482962224, '99.7': 0.8660127685300232, '99.8': 0.8015203693709417, '99.9': 0.6976027753857931, '99.91': 0.6824202124925003, '99.92': 0.666886200704681, '99.93': 0.6509126734912764, '99.94': 0.6352925787636964, '99.95': 0.6113891098888175, '99.96': 0.5843961138596394, '99.97': 0.5524004297143547, '99.98': 0.5130397320937039, '99.99': 0.4444125711664664}}

export function findQuantile(d: number, n: number): number {
	const table = percentiles[String(n)];

	const percentileItems = Object.entries(table).sort(
		([a], [b]) => parseFloat(a) - parseFloat(b)
	);

	for (let i = 0; i < percentileItems.length; i++) {
		const [percentile, pd] = percentileItems[i];
		if (pd < d) {
			if (i === 0) {
				return 0.0;
			}
			const [lowerPercentile, lowerPd] = percentileItems[i - 1];
			const f = (d - pd) / (lowerPd - pd);
			const est =
				parseFloat(percentile) +
				(parseFloat(lowerPercentile) - parseFloat(percentile)) * f;
			return est / 100;
		}
	}

	return 99.99 / 100;
}

export enum Node {
	SUN = "Sun",
	MOON = "Moon",
	ASCENDANT = "Ascendant",
	LUNAR_ASCENDING = "Lunar ↑",
	LUNAR_DESCENDING = "Lunar ↓",
	MERCURY = "Mercury",
	MARS = "Mars",
	VENUS = "Venus",
	JUPITER = "Jupiter",
	NEPTUNE = "Neptune",
	PLUTO = "Pluto",
	URANUS = "Uranus",
	SATURN = "Saturn",
}

import { Body } from "astronomy-engine";

export const NodeToBody: Partial<Record<Node, Body>> = {
	[Node.SUN]: Body.Sun,
	[Node.MOON]: Body.Moon,
	[Node.MERCURY]: Body.Mercury,
	[Node.VENUS]: Body.Venus,
	[Node.MARS]: Body.Mars,
	[Node.JUPITER]: Body.Jupiter,
	[Node.SATURN]: Body.Saturn,
	[Node.URANUS]: Body.Uranus,
	[Node.NEPTUNE]: Body.Neptune,
	[Node.PLUTO]: Body.Pluto,
};

export enum AspectKind {
	CONJUNCTION = 0,
	SEXTILE = 1,
	SQUARE = 2,
	TRINE = 3,
	OPPOSITION = 4,
	GRAND_SEXTILE = 5,
	GRAND_SQUARE = 6,
	GRAND_TRINE = 7,
}

export interface Aspect {
	kind: AspectKind;
	nodes: Node[];
	error: number;
	percentile: number;
}

export function findAspects(
	positions: Map<Node, number>,
	thresholdPairs: number = 0.95,
	thresholdGrandTrines: number = 0.99,
	thresholdGrandSquares: number = 0.995,
	thresholdGrandSextiles: number = 0.999
): Aspect[] {
	const aspects: Aspect[] = [];

	const PI = Math.PI;

	const nodes = Object.values(Node).filter(v => typeof v === "string") as Node[];

	for (let i = 0; i < nodes.length; i++) {
		for (let j = i + 1; j < nodes.length; j++) {
			const n1 = nodes[i];
			const n2 = nodes[j];
			const p1 = positions.get(n1);
			const p2 = positions.get(n2);
			const d = distance(p1, p2);

			if (d < PI * (1 - thresholdPairs)) {
				aspects.push({
					type: AspectKind.CONJUNCTION,
					nodes: [n1, n2],
					error: d,
					percentile: 100 * (1 - d / PI),
				});
			}
			if (Math.abs(d - PI / 3) < PI * (1 - thresholdPairs)) {
				aspects.push({
					type: AspectKind.SEXTILE,
					nodes: [n1, n2],
					error: Math.abs(d - PI / 3),
					percentile: 100 * (1 - Math.abs(d - PI / 3) / PI),
				});
			}
			if (Math.abs(d - PI / 2) < PI * (1 - thresholdPairs)) {
				aspects.push({
					type: AspectKind.SQUARE,
					nodes: [n1, n2],
					error: Math.abs(d - PI / 2),
					percentile: 100 * (1 - Math.abs(d - PI / 2) / PI),
				});
			}
			if (Math.abs(d - (2 * PI) / 3) < PI * (1 - thresholdPairs)) {
				aspects.push({
					type: AspectKind.TRINE,
					nodes: [n1, n2],
					error: Math.abs(d - (2 * PI) / 3),
					percentile: 100 * (1 - Math.abs(d - (2 * PI) / 3) / PI),
				});
			}
			if (Math.abs(d - PI) < PI * (1 - thresholdPairs)) {
				aspects.push({
					type: AspectKind.OPPOSITION,
					nodes: [n1, n2],
					error: Math.abs(d - PI),
				percentile: 100 * (1 - Math.abs(d - PI) / PI),
				});
			}
		}
	}

	const thresholdGrands: Record<number, number | null> = {
		3: thresholdGrandTrines,
		4: thresholdGrandSquares,
		6: thresholdGrandSextiles,
	};

	const aspectGrands: Record<number, AspectKind | null> = {
		3: AspectKind.GRAND_TRINE,
		4: AspectKind.GRAND_SQUARE,
		6: AspectKind.GRAND_SEXTILE,
	};

	const combinations = <T>(arr: T[], k: number): T[][] => {
		if (k === 0) return [[]];
		if (arr.length < k) return [];
		const [head, ...tail] = arr;
		const withHead = combinations(tail, k - 1).map(c => [head, ...c]);
		const withoutHead = combinations(tail, k);
		return [...withHead, ...withoutHead];
	};

	for (const n of [3, 4, 6]) {
		const t = thresholdGrands[n];
		const aspectType = aspectGrands[n];

		for (const subset of combinations(nodes, n)) {
			const positionsSubset = subset.map(node => positions.get(node));
			const error = minEmDistanceToRegular(positionsSubset, n);
			const quantile = findQuantile(error, n);
			if (quantile > t) {
				aspects.push({
					type: aspectType,
					nodes: subset,
					error,
					percentile: quantile * 100,
				});
			}
		}
	}

	aspects.sort((a, b) => b.percentile - a.percentile);

	return aspects;
}
