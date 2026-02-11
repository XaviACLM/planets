import { classicalRulerships, modernRulerships, Node, traditionalHouseAngularities, HouseAngularity, Sect, planetSects } from './astroDefs.ts';
import { DignityMode, HouseAngularityMode } from './settingsDefs.ts';
import { angleShortDistance } from './util.ts';
import ZodiacPositions from './zodiacPositions';

export function getChartSect(zodiacPositions): Sect {
	return zodiacPositions.isNodeAboveHorizon(Node.SUN) ? Sect.DIURNAL : Sect.NOCTURNAL;
}

export function isInSect(node: Node, zodiacPositions: ZodiacPositions): boolean | null{
	const nodeSect = planetSects[node];
	if (nodeSect === undefined) {
		return null;
	}
	const chartSect = getChartSect(zodiacPositions);
	if (nodeSect == Sect.VARIABLE){
		const variableNodeSect = isTrailing(node, Node.SUN, zodiacPositions) ? Sect.NOCTURNAL : Sect.DIURNAL;
		return chartSect == variableNodeSect;
	} else {
		return chartSect == nodeSect;
	}
}

export function getChartRuler(zodiacPositions: ZodiacPositions, dignityMode: DignityMode): Node | null {
	if (!zodiacPositions.hasSurfacePosition()) {
		return null;
	}
	const ascendantSign = zodiacPositions.getSymbolOfNode(Node.ASCENDANT);
	const rulerships = dignityMode === DignityMode.CLASSICAL ? classicalRulerships : modernRulerships;
	return rulerships[ascendantSign];
}

interface AngleProximityInfo {
	closestAngle: Node;
	distance: number;
	passed: boolean;
}

export function getAngleProximity(node: Node, zodiacPositions: ZodiacPositions): AngleProximityInfo {
	//will throw error for absent node / surface position
	const lon = zodiacPositions.getNodePosition(node);
	
	const asc = zodiacPositions.getNodePosition(Node.ASCENDANT);
	const ic = zodiacPositions.getNodePosition(Node.IMUM_COELI);
	const dsc = zodiacPositions.getNodePosition(Node.DESCENDANT);
	const mc = zodiacPositions.getNodePosition(Node.MIDHEAVEN);
	
	const dAsc = angleShortDistance(lon, asc);
	const dIc = angleShortDistance(lon, ic);
	const dDsc = angleShortDistance(lon, dsc);
	const dMc = angleShortDistance(lon, mc);
	
	const minD = Math.min(dAsc, dIc, dDsc, dMc);
	if (minD == dAsc) {
		return { closestAngle: Node.ASCENDANT, distance: minD, passed: isTrailing(Node.ASCENDANT, node, zodiacPositions)}
	} else if (minD == dIc) {
		return { closestAngle: Node.IMUM_COELI, distance: minD, passed: isTrailing(Node.IMUM_COELI, node, zodiacPositions)}
	} else if (minD == dDsc) {
		return { closestAngle: Node.DESCENDANT, distance: minD, passed: isTrailing(Node.DESCENDANT, node, zodiacPositions)}
	} else {
		return { closestAngle: Node.MIDHEAVEN, distance: minD, passed: isTrailing(Node.MIDHEAVEN, node, zodiacPositions)}
	}
}

function isTrailing(trailingNode: Node, leadingNode: Node, zodiacPositions: ZodiacPositions): boolean {
	// returns true if trailingNode is trailing leadingNode (up to 180º)
	// errors out if either node is absent
	const trailingLon = zodiacPositions.getNodePosition(trailingNode);
	const leadingLon = zodiacPositions.getNodePosition(leadingNode);
	if ( trailingLon > Math.PI ) {
		return (trailingLon > leadingLon) && (leadingLon > trailingLon - Math.PI);
	} else {
		return (trailingLon > leadingLon) || (leadingLon > trailingLon + Math.PI);
	}
}

export function getHouseAngularities(zodiacPositions: ZodiacPositions, houseAngularityMode: HouseAngularityMode): (number | null)[] {
	// we could put a guard here that defaulted to the traditional angularities if the houseSystem was well-behaved (angles always @ 1-4-7-10)
	// but in retrospect I don't know that there are that many like this? most respect asc-dsc 1-7 but mc-ic is unclear. Porphyry always,
	// some time-based house systems also but i'm not too sure + may be undefined. So let's avoid hardcoding any of that, I suppose.
	
	// this (line) will error out if one tries to call it with a zodiacPositions with an undefined surfacepos
	const nHouses = zodiacPositions.getHouseCuspPositions().length;
	
	if (houseAngularityMode === HouseAngularityMode.TRADITIONAL) {
		return traditionalHouseAngularities.slice(0, nHouses); 
	} else if (houseAngularityMode === HouseAngularityMode.VERIFIED) {
		if (
			zodiacPositions.getHouseOfNode(Node.ASCENDANT) == 1
			&& zodiacPositions.getHouseOfNode(Node.IMUM_COELI) == 4
			&& zodiacPositions.getHouseOfNode(Node.DESCENDANT) == 7
			&& zodiacPositions.getHouseOfNode(Node.MIDHEAVEN) == 10
		) {
			return traditionalHouseAngularities.slice(0, nHouses); 
		} else {
			return new Array(nHouses).fill(null);
		}
	}
	// else, we're in the dynamic case
	const isHouseAngular = new Array(nHouses).fill(false);
	const isHouseSuccedent = new Array(nHouses).fill(false);
	const isHouseCadent = new Array(nHouses).fill(false);
	const housesOfAngles = [
		zodiacPositions.getHouseOfNode(Node.ASCENDANT),
		zodiacPositions.getHouseOfNode(Node.IMUM_COELI),
		zodiacPositions.getHouseOfNode(Node.DESCENDANT),
		zodiacPositions.getHouseOfNode(Node.MIDHEAVEN)
	];
	for (const houseOfAngle of housesOfAngles) {
		isHouseAngular[houseOfAngle-1] = true;
		isHouseSuccedent[houseOfAngle == nHouses ? 0 : houseOfAngle] = true;
		isHouseCadent[houseOfAngle == 1 ? nHouses - 1 : houseOfAngle - 2] = true;
	}
	return Array.from({length: nHouses}, (_, i) => {
		if (isHouseAngular[i]) {
			return HouseAngularity.ANGULAR;
		} else if (isHouseSuccedent[i] && isHouseCadent[i]) {
			return null;
		} else if (isHouseSuccedent[i]) {
			return HouseAngularity.SUCCEDENT;
		} else if (isHouseCadent[i]) {
			return HouseAngularity.CADENT;
		} else {
			return null;
		}
	})
}

export function getFixedStarsWithinLongitude(node: Node, zodiacPositions: ZodiacPositions, maximumDistance: number): Map<string, number> {
	const lon = zodiacPositions.getNodePosition(node);
	return new Map(Array.from( zodiacPositions.getFixedStarPositions() )
		.map(([starName, longitude]) => [ starName, angleShortDistance(lon, longitude)])
		.filter(([starName, distance]) => distance < maximumDistance)
	);
}