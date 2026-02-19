import { classicalRulerships, modernRulerships, Node, Zodiac, traditionalHouseAngularities, HouseAngularity, Sect, planetSects } from '../defs/astroDefs.ts';
import { DignityMode, HouseAngularityMode } from '../defs/settingsDefs.ts';
import { angleShortDistance } from '../util/util.ts';
import NodePositions from './nodePositions.ts';
import ZodiacSignPositions from './zodiacSignPositions.ts';
import HouseCuspPositions from './houseCuspPositions.ts';
import FixedStarPositions from './fixedStarPositions.ts';

// Will throw if no surface position (ASCENDANT/DESCENDANT absent from nodePositions)
export function isNodeAboveHorizon(node: Node, nodePositions: NodePositions): boolean {
	// TODO this and the function below are silly. You can do this in one line if you take advantage of the fact that asc/dsc (and mc/ic) are always 180º apart. dumbass.
	const lon = nodePositions.get(node);
	const asc = nodePositions.get(Node.ASCENDANT);
	const dsc = nodePositions.get(Node.DESCENDANT);
	if (asc < dsc) {
		return !((asc < lon) && (lon < dsc));
	} else {
		return ((dsc < lon) && (lon < asc));
	}
}

// Will throw if no surface position (MIDHEAVEN/IMUM_COELI absent from nodePositions)
export function isNodeEastern(node: Node, nodePositions: NodePositions): boolean {
	const lon = nodePositions.get(node);
	const mc = nodePositions.get(Node.MIDHEAVEN);
	const ic = nodePositions.get(Node.IMUM_COELI);
	if (mc < ic) {
		return ((mc < lon) && (lon < ic));
	} else {
		return !((ic < lon) && (lon < mc));
	}
}

// Will throw if no surface position (via isNodeAboveHorizon)
export function getChartSect(nodePositions: NodePositions): Sect {
	return isNodeAboveHorizon(Node.SUN, nodePositions) ? Sect.DIURNAL : Sect.NOCTURNAL;
}

// Will throw if no surface position (via getChartSect / isTrailing)
export function isInSect(node: Node, nodePositions: NodePositions): boolean | null {
	const nodeSect = planetSects[node];
	if (nodeSect === undefined) {
		return null;
	}
	const chartSect = getChartSect(nodePositions);
	if (nodeSect == Sect.VARIABLE) {
		const variableNodeSect = isTrailing(node, Node.SUN, nodePositions) ? Sect.NOCTURNAL : Sect.DIURNAL;
		return chartSect == variableNodeSect;
	} else {
		return chartSect == nodeSect;
	}
}

// Will throw if no surface position (ASCENDANT absent from nodePositions)
export function getChartRuler(nodePositions: NodePositions, zodiacSignPositions: ZodiacSignPositions, dignityMode: DignityMode): Node {
	const ascendantSign = getSignOfNode(Node.ASCENDANT, nodePositions, zodiacSignPositions);
	const rulerships = dignityMode === DignityMode.CLASSICAL ? classicalRulerships : modernRulerships;
	return rulerships[ascendantSign];
}

export interface AngleProximityInfo {
	closestAngle: Node;
	distance: number;
	passed: boolean;
}

// Will throw if no surface position (main angles absent from nodePositions)
export function getAngleProximity(node: Node, nodePositions: NodePositions): AngleProximityInfo {
	const lon = nodePositions.get(node);

	const asc = nodePositions.get(Node.ASCENDANT);
	const ic = nodePositions.get(Node.IMUM_COELI);
	const dsc = nodePositions.get(Node.DESCENDANT);
	const mc = nodePositions.get(Node.MIDHEAVEN);

	const dAsc = angleShortDistance(lon, asc);
	const dIc = angleShortDistance(lon, ic);
	const dDsc = angleShortDistance(lon, dsc);
	const dMc = angleShortDistance(lon, mc);

	const minD = Math.min(dAsc, dIc, dDsc, dMc);
	if (minD == dAsc) {
		return { closestAngle: Node.ASCENDANT, distance: minD, passed: isTrailing(Node.ASCENDANT, node, nodePositions)}
	} else if (minD == dIc) {
		return { closestAngle: Node.IMUM_COELI, distance: minD, passed: isTrailing(Node.IMUM_COELI, node, nodePositions)}
	} else if (minD == dDsc) {
		return { closestAngle: Node.DESCENDANT, distance: minD, passed: isTrailing(Node.DESCENDANT, node, nodePositions)}
	} else {
		return { closestAngle: Node.MIDHEAVEN, distance: minD, passed: isTrailing(Node.MIDHEAVEN, node, nodePositions)}
	}
}

// returns true if trailingNode is trailing leadingNode (up to 180º)
// throws if either node is absent
export function isTrailing(trailingNode: Node, leadingNode: Node, nodePositions: NodePositions): boolean {
	const trailingLon = nodePositions.get(trailingNode);
	const leadingLon = nodePositions.get(leadingNode);
	if ( trailingLon > Math.PI ) {
		return (trailingLon > leadingLon) && (leadingLon > trailingLon - Math.PI);
	} else {
		return (trailingLon > leadingLon) || (leadingLon > trailingLon + Math.PI);
	}
}

export function getHouseAngularities(nodePositions: NodePositions, houseCuspPositions: HouseCuspPositions, houseAngularityMode: HouseAngularityMode): (HouseAngularity | null)[] {
	// we could put a guard here that defaulted to the traditional angularities if the houseSystem was well-behaved (angles always @ 1-4-7-10)
	// but in retrospect I don't know that there are that many like this? most respect asc-dsc 1-7 but mc-ic is unclear. Porphyry always,
	// some time-based house systems also but i'm not too sure + may be undefined. So let's avoid hardcoding any of that, I suppose.

	const nHouses = houseCuspPositions.getCuspPositions().length;

	if (houseAngularityMode === HouseAngularityMode.TRADITIONAL) {
		return traditionalHouseAngularities.slice(0, nHouses);
	} else if (houseAngularityMode === HouseAngularityMode.VERIFIED) {
		if (
			getHouseOfNode(Node.ASCENDANT, nodePositions, houseCuspPositions) == 1
			&& getHouseOfNode(Node.IMUM_COELI, nodePositions, houseCuspPositions) == 4
			&& getHouseOfNode(Node.DESCENDANT, nodePositions, houseCuspPositions) == 7
			&& getHouseOfNode(Node.MIDHEAVEN, nodePositions, houseCuspPositions) == 10
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
		getHouseOfNode(Node.ASCENDANT, nodePositions, houseCuspPositions),
		getHouseOfNode(Node.IMUM_COELI, nodePositions, houseCuspPositions),
		getHouseOfNode(Node.DESCENDANT, nodePositions, houseCuspPositions),
		getHouseOfNode(Node.MIDHEAVEN, nodePositions, houseCuspPositions)
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

export function getFixedStarsWithinLongitude(node: Node, nodePositions: NodePositions, fixedStarPositions: FixedStarPositions, maximumDistance: number): Map<string, number> {
	const lon = nodePositions.get(node);
	const result = new Map<string, number>();
	for (const [starName, longitude] of fixedStarPositions.getPositions()) {
		const distance = angleShortDistance(lon, longitude);
		if (distance < maximumDistance) {
			result.set(starName, distance);
		}
	}
	return result;
}

// Convenience functions

export function getHouseOfNode(node: Node, nodePositions: NodePositions, houseCuspPositions: HouseCuspPositions): number {
	const lon = nodePositions.get(node);
	return houseCuspPositions.getHouseAtLongitude(lon);
}

export function getSignOfNode(node: Node, nodePositions: NodePositions, zodiacSignPositions: ZodiacSignPositions): Zodiac {
	const lon = nodePositions.get(node);
	return zodiacSignPositions.getSignAtLongitude(lon);
}

export function getNodePositionWithinSign(node: Node, nodePositions: NodePositions, zodiacSignPositions: ZodiacSignPositions): number {
	const lon = nodePositions.get(node);
	return zodiacSignPositions.getPositionWithinSign(lon);
}
