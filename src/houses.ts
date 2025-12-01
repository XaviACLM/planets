import { normalizeAngleRad, interpolateAngles, interpolateShorterAngle } from './util.ts'

import { Node, type SurfacePosition } from './astroDefs.ts'
import { computeAxialTilt } from './astro.ts'

import { Vector, RotateVector, Rotation_HOR_EQJ, Rotation_ECL_EQJ, Rotation_EQJ_ECL, Rotation_EQJ_ECT, Rotation_ECT_EQJ, AstroTime, SiderealTime, Observer, Rotation_EQD_EQJ } from "astronomy-engine";

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
	//const ecliptic = normalize(RotateVector(Rotation_ECL_EQJ(), toAstronomyVector({x:0, y:0, z:1})));
	const ecliptic = normalize(RotateVector(Rotation_ECT_EQJ(astroTime), toAstronomyVector({x:0, y:0, z:1})));
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
function eclipticLongitudeToRAAndDeclination(longitude: number, axialTilt: number){
	// formula transparent, makes sense
	const RA = Math.atan2(Math.sin(longitude)*Math.cos(axialTilt), Math.cos(longitude));
	const declination = Math.asin(Math.sin(axialTilt)*Math.sin(longitude));
	return {RA, declination}
}

// returns radians as a unit of time (2pi = 24hr)
function timeToHorizon(pointRA: number, pointDeclination: number, RAMC: number, observerLatitude: number): number | null{
	
	const cosAD = -Math.tan(observerLatitude * Math.PI / 180)*Math.tan(pointDeclination);
	if ( Math.abs(cosAD) > 1 ) {
		return null;
	}
	const TAU = 2*Math.PI;
	const AD = Math.acos(cosAD); //hour angle btw observer (=MC=meridian) and (point-on-the-same-latitude-as-point)-on-the-horizon
	const H = RAMC - pointRA; // point H off the meridian (=observer)
	const adjH = ((H + AD)%TAU+TAU)%TAU - AD; // mod 2pi conjugated by -AD -> mod but maps to (-AD, TAU-AD)
	if (adjH <= AD) {
		return AD - adjH;
	} else {
		return TAU - AD - adjH;
	}
}

// returns radians as a unit of time (2pi = 24hr)
function timeSinceHorizon(pointRA: number, pointDeclination: number, RAMC: number, observerLatitude: number): number | null{
	
	const cosAD = -Math.tan(observerLatitude * Math.PI / 180)*Math.tan(pointDeclination);
	if ( Math.abs(cosAD) > 1 ) {
		return null;
	}
	const TAU = 2*Math.PI;
	const AD = Math.acos(cosAD); //hour angle btw observer (=MC=meridian) and (point-on-the-same-latitude-as-point)-on-the-horizon
	const H = RAMC - pointRA; // point H off the meridian (=observer)
	const adjH = ((H + AD)%TAU+TAU)%TAU - AD; // mod 2pi conjugated by -AD -> mod but maps to (-AD, TAU-AD)
	if (adjH <= AD) {
		return AD + adjH;
	} else {
		return adjH - AD;
	}
}

// returns radians as a unit of time (2pi = 24hr)
function timeToMeridian(pointRA: number, RAMC: number): number{
	const H = RAMC - pointRA;
	return Math.PI-((H)%Math.PI+Math.PI)%Math.PI // pi - (h mod pi)
}

export const MainAxisArc = {
	ASC_TO_MC: "Asc to MC",
	DSC_TO_MC: "Dsc to MC",
	ASC_TO_IC: "Asc to IC",
	DSC_TO_IC: "Dsc to IC",
} as const;
export type MainAxisArc = typeof MainAxisArc[keyof typeof MainAxisArc];

function placidusCuspSearch(obsLatitude: number, axialTilt: number, eps: number, angles: AxisAngles, mode: MainAxisArc, c: number): number { 
	const { asc, mc, dsc, ic } = angles;
	const { RA: RAASC, declination: declinationASC } = eclipticLongitudeToRAAndDeclination(asc, axialTilt);
	const { RA: RAMC, declination: declinationMC } = eclipticLongitudeToRAAndDeclination(mc, axialTilt);
	const start = [MainAxisArc.ASC_TO_IC, MainAxisArc.ASC_TO_MC].includes(mode) ? asc : dsc;
	const end = [MainAxisArc.ASC_TO_MC, MainAxisArc.DSC_TO_MC].includes(mode) ? mc : ic;
	var x = interpolateShorterAngle(c, start, end);
	var y = x - 2*eps;
	function f(eclLon: number): number{
		const { RA, declination } = eclipticLongitudeToRAAndDeclination(eclLon, axialTilt);
		var tsh, tth, ttm, tsm;
		switch (mode){
			case MainAxisArc.ASC_TO_MC:	
				tsh = timeSinceHorizon(RA, declination, RAMC, obsLatitude);
				ttm = timeToMeridian(RA, RAMC);
				return (1-c)*tsh - c*ttm;
			case MainAxisArc.DSC_TO_MC:
				tth = timeToHorizon(RA, declination, RAMC, obsLatitude);
				tsm = Math.PI-timeToMeridian(RA, RAMC);
				return (1-c)*tth - c*tsm;
			case MainAxisArc.ASC_TO_IC:	
				tth = timeToHorizon(RA, declination, RAMC, obsLatitude);
				tsm = Math.PI-timeToMeridian(RA, RAMC);
				return (1-c)*tth - c*tsm;
			case MainAxisArc.DSC_TO_IC:	
				tsh = timeSinceHorizon(RA, declination, RAMC, obsLatitude);
				ttm = timeToMeridian(RA, RAMC);
				return (1-c)*tsh - c*ttm;
		}
	}
	var fx = f(x);
	var fy = f(y);
	var z = 0;
	var fz = 0;
	// TODO exit if null or takes too many iterations
	// + update the logic all the way up the chain st house system can be null
	while ( Math.abs(x - y) > 1e-10 ) {
		z = y - fy*(x-y)/(fx-fy); // secant
		fz = f(z);
		//console.log(z, fz);
		if ( Math.abs(fz) < 1e-10 ) {
			x = y;//exit
		} else if ( Math.abs(fx) > Math.abs(fy) ) {
			x = z;
			fx = fz;
		} else {
			y = z;
			fy = fz;
		}
	}
	return z;
}

function computePlacidusCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles): number[] {
	// note: some people claim asc is midpoint, timewise, btw asc-dsc. This would simplify calculations but it's false
	const axialTilt = computeAxialTilt(date);
	const eps = 0.01;
	
	return [
		angles.asc,
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.ASC_TO_IC, 1/3),
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.ASC_TO_IC, 2/3),
		angles.ic,
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.DSC_TO_IC, 2/3),
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.DSC_TO_IC, 1/3),
		angles.dsc,
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.DSC_TO_MC, 1/3),
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.DSC_TO_MC, 2/3),
		angles.mc,
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.ASC_TO_MC, 2/3),
		placidusCuspSearch(surfacePosition.latitude, axialTilt, eps, angles, MainAxisArc.ASC_TO_MC, 1/3)
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
