import { normalizeAngleRad, interpolateAngles } from './util.ts'

import { Node, type SurfacePosition } from './astroDefs.ts'
import { computeAxialTilt } from './astro.ts'

import { Vector, RotateVector, Rotation_HOR_EQJ, Rotation_ECL_EQJ, Rotation_EQJ_ECL, AstroTime, Observer, Rotation_EQD_EQJ } from "astronomy-engine";

interface AxisAngles {
	asc: number;
	dsc: number;
	mc: number;
	ic: number
}

export const HouseSystem = {
	WHOLE_SIGN: "Whole Sign",
	EQUAL_HOUSES: "Equal Houses",
	PORPHYRY: "Porphyry",
	
	KRUSINSKY: "Krusinsky",
	REGIOMONTANUS: "Regiomontanus",
	MERIDIAN: "Meridian",
	MORINUS: "Morinus",
	CAMPANUS: "Campanus",
	ZENITH_HORIZONTAL: "Zenith / Horizontal",
	
	PLACIDUS: "Placidus",
	TOPOCENTRIC: "Topocentric",
	KOCH: "Koch",
	ALCABITIUS: "Alcabitius",
} as const;
export type HouseSystem = typeof HouseSystem[keyof typeof HouseSystem];

function computeWholeSignCuspPositions(_date: Date, _surfacePosition: SurfacePosition, angles: AxisAngles){
	const idx = Math.floor(angles.asc/(Math.PI/6));
	return [
		normalizeAngleRad(idx*Math.PI/6),
		normalizeAngleRad((idx+1)*Math.PI/6),
		normalizeAngleRad((idx+2)*Math.PI/6),
		normalizeAngleRad((idx+3)*Math.PI/6),
		normalizeAngleRad((idx+4)*Math.PI/6),
		normalizeAngleRad((idx+5)*Math.PI/6),
		normalizeAngleRad((idx+6)*Math.PI/6),
		normalizeAngleRad((idx+7)*Math.PI/6),
		normalizeAngleRad((idx+8)*Math.PI/6),
		normalizeAngleRad((idx+9)*Math.PI/6),
		normalizeAngleRad((idx+10)*Math.PI/6),
		normalizeAngleRad((idx+11)*Math.PI/6),
	];
}

function computeEqualHousesCuspPositions(_date: Date, _surfacePosition: SurfacePosition, angles: AxisAngles){
	return [
		angles.asc,
		angles.asc + Math.PI/6,
		angles.asc + 2*Math.PI/6,
		angles.asc + 3*Math.PI/6,
		angles.asc + 4*Math.PI/6,
		angles.asc + 5*Math.PI/6,
		angles.asc + 6*Math.PI/6, //dsc
		angles.asc + 7*Math.PI/6,
		angles.asc + 8*Math.PI/6,
		angles.asc + 9*Math.PI/6,
		angles.asc + 10*Math.PI/6,
		angles.asc + 11*Math.PI/6,
	];
}

function computePorphyryCuspPositions(_date: Date, _surfacePosition: SurfacePosition, angles: AxisAngles){
	return [
		angles.asc,
		interpolateAngles(1/3, angles.asc, angles.ic),
		interpolateAngles(2/3, angles.asc, angles.ic),
		angles.ic,
		interpolateAngles(1/3, angles.ic, angles.dsc),
		interpolateAngles(2/3, angles.ic, angles.dsc),
		angles.dsc,
		interpolateAngles(1/3, angles.dsc, angles.mc),
		interpolateAngles(2/3, angles.dsc, angles.mc),
		angles.mc,
		interpolateAngles(1/3, angles.mc, angles.asc),
		interpolateAngles(2/3, angles.mc, angles.asc),
	];
}


// space-based


interface vec3 {
	x: number;
	y: number;
	z: number
}

function toAstronomyVector(v: vec3, time: Date = new Date()): Vector {
    return new Vector(v.x, v.y, v.z, new AstroTime(time));
}

function normVec(v: vec3): number {
	return Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
}

function normalize(v: vec3): vec3 {
	const r = normVec(v);
	return {x:v.x/r, y:v.y/r, z:v.z/r};
}

function flipVec(v: vec3): vec3 {
	return {x:-v.x, y:-v.y, z:-v.z};
}

function cross(v: vec3, w: vec3): vec3 {
	return {
		x: v.y*w.z - v.z*w.y,
		y: v.z*w.x - v.x*w.z,
		z: v.x*w.y - v.y*w.x
	}
}

function cardinalsAndCirclesAndAscDsc(date: Date, surfacePosition: SurfacePosition) {
	const astroTime = new AstroTime(date);
	const obs = new Observer(surfacePosition.latitude, surfacePosition.longitude, 0); //height
	const rot = Rotation_HOR_EQJ(astroTime, obs);
	const N = normalize(RotateVector(rot, toAstronomyVector({x:1, y:0, z:0})));
	const E = normalize(RotateVector(rot, toAstronomyVector({x:0, y:1, z:0})));
	const zenith = normalize(RotateVector(rot, toAstronomyVector({x:0, y:0, z:1})));
	const S = flipVec(N);
	const W = flipVec(E);
	const nadir = flipVec(zenith);
	const ecliptic = normalize(RotateVector(Rotation_ECL_EQJ(), toAstronomyVector({x:0, y:0, z:1})));
	const ecN = ecliptic;
	const equator = normalize(RotateVector(Rotation_EQD_EQJ(astroTime),toAstronomyVector({x:0, y:0, z:1})));
	const eqN = equator;
	const primeVertical = N;
	const meridian = E;
	const horizon = zenith;
	const asc = normalize(cross(ecliptic, horizon));
	const dsc = flipVec(asc);
	return {N, S, E, W, zenith, nadir, ecliptic, equator, primeVertical, meridian, horizon, asc, dsc, eqN, ecN};
}

function advanceAlongCircle(p: vec3, circle: vec3, angle: number): vec3 {
	const q = normalize(cross(circle, p));
	return normalize({
		x: p.x*Math.cos(angle) + q.x*Math.sin(angle),
		y: p.y*Math.cos(angle) + q.y*Math.sin(angle),
		z: p.z*Math.cos(angle) + q.z*Math.sin(angle)
	});
}

function twelvePoints(circle: vec3, p: vec3): vec3[] {
	return Array.from({length:12}, (_,i) => advanceAlongCircle(p, circle, i*Math.PI/6));
}

function projectPoint(q: vec3, circle: vec3, center: vec3): vec3 {
	const qcCircle = normalize(cross(q, center));
	const intersection = normalize(cross(qcCircle, circle));
	return intersection;
}

function projectPoints(qs: vec3[], circle: vec3, center: vec3): vec3[] {
	return qs.map(q => projectPoint(q, circle, center));
}

function computeEclipticAngle(p: vec3): number {
	const rot = Rotation_EQJ_ECL();
	const v = RotateVector(rot, toAstronomyVector(p));
	const alpha = Math.atan2(v.y, v.x);
	return normalizeAngleRad(alpha);
}

function computeEclipticAngles(ps: vec3[]): number[] {
	return ps.map(p => computeEclipticAngle(p));
}

function cycleToStart(angles: number[], start: number): number[] {
    const sorted = [...angles].sort((a, b) => a - b);
    const i = sorted.findIndex((angle, idx) => angle < start && start < sorted[idx + 1]);
    return i === -1 ? sorted : [...sorted.slice(i), ...sorted.slice(0, i)];
}

function computeSpaceBasedSystemCuspPositions(
	date: Date,
	surfacePosition: SurfacePosition,
	startingCircle: vec3,
	startingPoint: vec3,
	projectionCenter: vec3
): number[] {
	const {ecliptic, asc} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const kpts = twelvePoints(startingCircle, startingPoint);
	const epts = projectPoints(kpts, ecliptic, projectionCenter);
	const angles = computeEclipticAngles(epts);
	return cycleToStart(angles, computeEclipticAngle(asc));
}

// I am not completely sure about all that follow
// descriptions for them are rather sparse, and i strongly suspect some secondary sources are inaccurate
// one day - maybe - i will look for primary sources on these
function computeKrusinskyCuspPositions(date: Date, surfacePosition: SurfacePosition, _angles: AxisAngles){
	const {asc, eqN, zenith} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const krusinskyCircle = normalize(cross(asc, zenith));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, krusinskyCircle, asc, eqN);
}

function computeRegiomontanusCuspPositions(date: Date, surfacePosition: SurfacePosition, _angles: AxisAngles){
	const {N, meridian, equator} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator)); 
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, equator, intersection, N);
}

function computeMeridianCuspPositions(date: Date, surfacePosition: SurfacePosition, _angles: AxisAngles){
	const {eqN, meridian, equator} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator)); 
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, equator, intersection, eqN);
}

function computeMorinusCuspPositions(date: Date, surfacePosition: SurfacePosition, _angles: AxisAngles){
	const {ecN, meridian, equator} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, equator, intersection, ecN);
}

function computeCampanusCuspPositions(date: Date, surfacePosition: SurfacePosition, _angles: AxisAngles){
	const {N, meridian, primeVertical} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, primeVertical));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, primeVertical, intersection, N);
}

function computeZenithHorizontalCuspPositions(date: Date, surfacePosition: SurfacePosition, _angles: AxisAngles){
	const {horizon, meridian, zenith} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, horizon));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, horizon, intersection, zenith);
}


// time-based


function eclipticToRA(eclipticLongitude: number, date: Date): number {
	const epsilon = computeAxialTilt(date);
    return Math.atan2(Math.sin(eclipticLongitude) * Math.cos(epsilon), Math.cos(eclipticLongitude));
}

function raToEcliptic(ra: number, date: Date): number {
    const epsilon = computeAxialTilt(date);
    return Math.atan2( Math.sin(ra) / Math.cos(epsilon), Math.cos(ra));
}

function interpolateRAByTime(f: number, raStart: number, raEnd: number, _latitude: number, _date: Date): number {
	//TODO this is unfinished, currently equiv to porphyrius. Need to finish this function (the hard part) for time-based
    let delta = raEnd - raStart;
    delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
    return raStart + f * delta;
}

function computePlacidusCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles): number[] {
	const { asc, mc, dsc, ic } = angles;

	const raAsc = eclipticToRA(asc, date);
	const raMC = eclipticToRA(mc, date);
	const raIC = eclipticToRA(ic, date);
	const raDsc = eclipticToRA(dsc, date);

	return [
		asc,
		raToEcliptic(interpolateRAByTime(2/3, raIC, raAsc, surfacePosition.latitude, date), date),
		raToEcliptic(interpolateRAByTime(1/3, raIC, raAsc, surfacePosition.latitude, date), date),
		ic,
		raToEcliptic(interpolateRAByTime(2/3, raDsc, raIC, surfacePosition.latitude, date), date),
		raToEcliptic(interpolateRAByTime(1/3, raDsc, raIC, surfacePosition.latitude, date), date),
		dsc,
		raToEcliptic(interpolateRAByTime(2/3, raMC, raDsc, surfacePosition.latitude, date), date),
		raToEcliptic(interpolateRAByTime(1/3, raMC, raDsc, surfacePosition.latitude, date), date),
		mc,
		raToEcliptic(interpolateRAByTime(2/3, raAsc, raMC, surfacePosition.latitude, date), date),
		raToEcliptic(interpolateRAByTime(1/3, raAsc, raMC, surfacePosition.latitude, date), date),
	];
}


function computeTopocentricCuspPositions(_date: Date, _surfacePosition: SurfacePosition, _angles: AxisAngles){
	return [1,2,3,4,5,6,7,8,9,10,11,12];
}

function computeKochCuspPositions(_date: Date, _surfacePosition: SurfacePosition, _angles: AxisAngles){
	return [1,2,3,4,5,6,7,8,9,10,11,12];
}

function computeAlcabitiusCuspPositions(_date: Date, _surfacePosition: SurfacePosition, _angles: AxisAngles){
	return [1,2,3,4,5,6,7,8,9,10,11,12];
}

export function computeHouseCuspPositions(date: Date, surfacePosition: SurfacePosition, houseSystem: HouseSystem, knownNodes: Map<Node, number>): number[]{
	const angles = {
		asc: knownNodes.get(Node.ASCENDANT)!,
		dsc: knownNodes.get(Node.DESCENDANT)!,
		mc: knownNodes.get(Node.MIDHEAVEN)!,
		ic: knownNodes.get(Node.IMUM_COELI)!
	}
	switch (houseSystem) {
		case HouseSystem.WHOLE_SIGN:
			return computeWholeSignCuspPositions(date, surfacePosition, angles);
		case HouseSystem.EQUAL_HOUSES:
			return computeEqualHousesCuspPositions(date, surfacePosition, angles);
		case HouseSystem.PORPHYRY:
			return computePorphyryCuspPositions(date, surfacePosition, angles);
		case HouseSystem.KRUSINSKY:
			return computeKrusinskyCuspPositions(date, surfacePosition, angles);
		case HouseSystem.REGIOMONTANUS:
			return computeRegiomontanusCuspPositions(date, surfacePosition, angles);
		case HouseSystem.MERIDIAN:
			return computeMeridianCuspPositions(date, surfacePosition, angles);
		case HouseSystem.MORINUS:
			return computeMorinusCuspPositions(date, surfacePosition, angles);
		case HouseSystem.CAMPANUS:
			return computeCampanusCuspPositions(date, surfacePosition, angles);
		case HouseSystem.ZENITH_HORIZONTAL:
			return computeZenithHorizontalCuspPositions(date, surfacePosition, angles);
		case HouseSystem.PLACIDUS:
			return computePlacidusCuspPositions(date, surfacePosition, angles);
		case HouseSystem.TOPOCENTRIC:
			return computeTopocentricCuspPositions(date, surfacePosition, angles);
		case HouseSystem.KOCH:
			return computeKochCuspPositions(date, surfacePosition, angles);
		case HouseSystem.ALCABITIUS:
			return computeAlcabitiusCuspPositions(date, surfacePosition, angles);
		default:
			throw new Error("something wrong with house computation dispatch:", houseSystem);
	}
}
