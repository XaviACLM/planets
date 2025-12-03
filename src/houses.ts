// definitions and systems largely sourced from
// swisseph docs: https://gitea.polonkai.eu/gergely/swe-glib/raw/commit/18b5390a33e7f3eeacf1d2dfc748dbc668414e56/swe/doc/swisseph.pdf
// astro.com overview: https://www.astro.com/faq/fq_fh_owhouse_i.htm
// originally - urania trust article: https://www.uraniatrust.org/astrology/astronomy-of-houses

import { normalizeAngleRad, interpolateAngles, interpolateShorterAngle, anglesLieInShortArc } from './util.ts'

import { Node, type SurfacePosition } from './astroDefs.ts'
import { computeAxialTilt, computeAscendantAndDescendant } from './astro.ts'

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

export const AyanamsaDependantHouseSystems: HouseSystem[] = [
	HouseSystem.WHOLE_SIGN,
	HouseSystem.WHOLE_SIGN_ARIES,
];

function computeWholeSignCuspPositions(angles: AxisAngles, siderealOffset: number){
	const idx = Math.floor((angles.asc - siderealOffset)/(Math.PI/6));
	return [
		normalizeAngleRad(idx*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+1)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+2)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+3)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+4)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+5)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+6)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+7)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+8)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+9)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+10)*Math.PI/6 + siderealOffset),
		normalizeAngleRad((idx+11)*Math.PI/6 + siderealOffset),
	];
}

function computeEqualHousesCuspPositions(angles: AxisAngles){
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

function computePorphyryCuspPositions(angles: AxisAngles){
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

function computeEqualHousesVehlowCuspPositions(angles: AxisAngles){
	return [
		angles.asc + (-1)*Math.PI/12,
		angles.asc + 1*Math.PI/12,
		angles.asc + 3*Math.PI/12,
		angles.asc + 5*Math.PI/12,
		angles.asc + 7*Math.PI/12,
		angles.asc + 9*Math.PI/12,
		angles.asc + 11*Math.PI/12,
		angles.asc + 13*Math.PI/12,
		angles.asc + 15*Math.PI/12,
		angles.asc + 17*Math.PI/12,
		angles.asc + 19*Math.PI/12,
		angles.asc + 21*Math.PI/12,
	];
}

function computeWholeSignAriesCuspPositions(angles: AxisAngles, siderealOffset: number){
	const idx = Math.floor((angles.asc - siderealOffset)/(Math.PI/6));
	return [
		normalizeAngleRad(siderealOffset),
		normalizeAngleRad(1*Math.PI/6 + siderealOffset),
		normalizeAngleRad(2*Math.PI/6 + siderealOffset),
		normalizeAngleRad(3*Math.PI/6 + siderealOffset),
		normalizeAngleRad(4*Math.PI/6 + siderealOffset),
		normalizeAngleRad(5*Math.PI/6 + siderealOffset),
		normalizeAngleRad(6*Math.PI/6 + siderealOffset),
		normalizeAngleRad(7*Math.PI/6 + siderealOffset),
		normalizeAngleRad(8*Math.PI/6 + siderealOffset),
		normalizeAngleRad(9*Math.PI/6 + siderealOffset),
		normalizeAngleRad(10*Math.PI/6 + siderealOffset),
		normalizeAngleRad(11*Math.PI/6 + siderealOffset),
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
function computeKrusinskyCuspPositions(date: Date, surfacePosition: SurfacePosition){
	const {asc, eqN, zenith} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const krusinskyCircle = normalize(cross(asc, zenith));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, krusinskyCircle, asc, eqN);
}

function computeRegiomontanusCuspPositions(date: Date, surfacePosition: SurfacePosition){
	const {N, meridian, equator} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator)); 
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, equator, intersection, N);
}

function computeMeridianCuspPositions(date: Date, surfacePosition: SurfacePosition){
	const {eqN, meridian, equator} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator)); 
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, equator, intersection, eqN);
}

function computeMorinusCuspPositions(date: Date, surfacePosition: SurfacePosition){
	const {ecN, meridian, equator} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, equator, intersection, ecN);
}

function computeCampanusCuspPositions(date: Date, surfacePosition: SurfacePosition){
	const {N, meridian, primeVertical} = cardinalsAndCirclesAndAscDsc(date, surfacePosition);
	const intersection = normalize(cross(meridian, primeVertical));
	return computeSpaceBasedSystemCuspPositions(date, surfacePosition, primeVertical, intersection, N);
}

function computeZenithHorizontalCuspPositions(date: Date, surfacePosition: SurfacePosition){
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
				if ( tsh === null ) { return null; }
				ttm = timeToMeridian(RA, RAMC);
				return (1-c)*tsh - c*ttm;
			case MainAxisArc.DSC_TO_MC:
				tth = timeToHorizon(RA, declination, RAMC, obsLatitude);
				if ( tth === null ) { return null; }
				tsm = Math.PI-timeToMeridian(RA, RAMC);
				return (1-c)*tth - c*tsm;
			case MainAxisArc.ASC_TO_IC:	
				tth = timeToHorizon(RA, declination, RAMC, obsLatitude);
				if ( tth === null ) { return null; }
				tsm = Math.PI-timeToMeridian(RA, RAMC);
				return (1-c)*tth - c*tsm;
			case MainAxisArc.DSC_TO_IC:	
				tsh = timeSinceHorizon(RA, declination, RAMC, obsLatitude);
				if ( tsh === null ) { return null; }
				ttm = timeToMeridian(RA, RAMC);
				return (1-c)*tsh - c*ttm;
		}
	}
	var fx = f(x);
	var fy = f(y);
	if (fx === null || fy === null) { return null; }
	var z = 0;
	var fz = 0;
	var counter = 0;
	const max_iter = 100;
	while ( Math.abs(x - y) > 1e-10 ) {
		z = y - fy*(x-y)/(fx-fy); // secant
		fz = f(z);
		counter++;
		if ( fz === null || counter >= max_iter ) { return null; }
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
	// 12th cusp is the point along the ecliptic which is 1/3rd of the way, time-wise, from the ascendant to the mc
	
	// note: some people claim asc is midpoint, timewise, btw asc-dsc. This would simplify calculations but it is false
	const axialTilt = computeAxialTilt(date);
	const eps = 0.01;
	
	const houseCusps = [
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
	
	const containsNull = houseCusps.some(cusp => cusp === null);
	return containsNull ? null : houseCusps;
}

function computeKochCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	//consider the time it took the current mc to arrive there from the horizon. 12th house is the 1/3rd point (time-wise)
	
	// setup
	const axialTilt = computeAxialTilt(date);	
	const { asc, mc, dsc, ic } = angles;
	
	// first quadrant
	// how long did the current mc take to arrive from the horizon?
	const { RA: RAMC, declination: declinationMC } = eclipticLongitudeToRAAndDeclination(mc, axialTilt);
	const tshRadMC = timeSinceHorizon(RAMC, declinationMC, RAMC, surfacePosition.latitude);
	const tshHoursMC = tshRadMC * 12 / Math.PI;
	
	const date11th = new Date(date.getTime() - tshHoursMC*(2/3)*3600*1000)
	const date12th = new Date(date.getTime() - tshHoursMC*(1/3)*3600*1000)
	const cusp11 = computeAscendantAndDescendant(date11th, surfacePosition).get(Node.ASCENDANT)!;
	const cusp12 = computeAscendantAndDescendant(date12th, surfacePosition).get(Node.ASCENDANT)!;
	
	// second quadrant
	// how long will the current mc take to get to the horizon again?
	const tthRadMC = timeToHorizon(RAMC, declinationMC, RAMC, surfacePosition.latitude);
	const tthHoursMC = tthRadMC* 12 / Math.PI;
	
	const date8th = new Date(date.getTime() + tthHoursMC*(1/3)*3600*1000)
	const date9th = new Date(date.getTime() + tthHoursMC*(2/3)*3600*1000)
	const cusp8 = computeAscendantAndDescendant(date8th, surfacePosition).get(Node.DESCENDANT)!;
	const cusp9 = computeAscendantAndDescendant(date9th, surfacePosition).get(Node.DESCENDANT)!;
	
	// third quadrant
	// how long did the current ic take to arrive from the horizon?
	const { RA: RAIC, declination: declinationIC } = eclipticLongitudeToRAAndDeclination(ic, axialTilt);
	const tshRadIC = timeSinceHorizon(RAIC, declinationIC, RAMC, surfacePosition.latitude);
	const tshHoursIC = tshRadIC* 12 / Math.PI;
	
	const date5th = new Date(date.getTime() - tshHoursIC*(2/3)*3600*1000)
	const date6th = new Date(date.getTime() - tshHoursIC*(1/3)*3600*1000)
	const cusp5 = computeAscendantAndDescendant(date5th, surfacePosition).get(Node.DESCENDANT)!;
	const cusp6 = computeAscendantAndDescendant(date6th, surfacePosition).get(Node.DESCENDANT)!;
	
	// fourth quadrant
	// how long will the current ic take to get to the horizon again?
	const tthRadIC = timeToHorizon(RAIC, declinationIC, RAMC, surfacePosition.latitude);
	const tthHoursIC = tthRadIC* 12 / Math.PI;
	
	const date2nd = new Date(date.getTime() + tthHoursIC*(1/3)*3600*1000)
	const date3rd = new Date(date.getTime() + tthHoursIC*(2/3)*3600*1000)
	const cusp2 = computeAscendantAndDescendant(date2nd, surfacePosition).get(Node.ASCENDANT)!;
	const cusp3 = computeAscendantAndDescendant(date3rd, surfacePosition).get(Node.ASCENDANT)!;
				
	return [asc, cusp2, cusp3, ic, cusp5, cusp6, dsc, cusp8, cusp9, mc, cusp11, cusp12];
}

function computePolichPageCusp(c: number, p1: number, p2: number, tp1: number, tp2: number, axialTilt: number): number {
	const cuspDecl = Math.atan(c * tp1 + (1-c) * tp2);
	const cuspLongOpt1 = Math.asin(Math.sin(cuspDecl)/Math.sin(axialTilt));
	const cuspLongOpt2 = (cuspLongOpt1 > 0 ? Math.PI : -Math.PI) - cuspLongOpt1;
	if ( anglesLieInShortArc(p1, cuspLongOpt1, p2) ) {
		return cuspLongOpt1;
	} else {
		return cuspLongOpt2;
	}
}

// TODO works, but is not close to placidus. Are some of the calculations wrong?
// ugh... another serious release blocker
// tried three other ways, none worked. see scripts/discarded.ts
// we'll just remove this from the options for now.
function computeTopocentricCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	// polich - page. Consider the "polar elevation" of the asc-mc, i.e. its geographic latitude
	// consider tangents, trisect interval, invert over the ecliptic.
	
	const axialTilt = computeAxialTilt(date);	
	const { asc, mc, dsc, ic } = angles;
	
	const { RA: RAMC, declination: declinationMC } = eclipticLongitudeToRAAndDeclination(mc, axialTilt);
	const { RA: RAASC, declination: declinationASC } = eclipticLongitudeToRAAndDeclination(asc, axialTilt);
	const { RA: RAIC, declination: declinationIC } = eclipticLongitudeToRAAndDeclination(ic, axialTilt);
	const { RA: RADSC, declination: declinationDSC } = eclipticLongitudeToRAAndDeclination(dsc, axialTilt);
	
	const tAsc = Math.tan(declinationASC);
	const tMc = Math.tan(declinationMC);
	const tDsc = Math.tan(declinationDSC);
	const tIc = Math.tan(declinationIC);
	
	return [
		asc,
		computePolichPageCusp(2/3, asc, ic, tAsc, tIc, axialTilt),
		computePolichPageCusp(1/3, asc, ic, tAsc, tIc, axialTilt),
		ic,
		computePolichPageCusp(2/3, ic, dsc, tIc, tDsc, axialTilt),
		computePolichPageCusp(1/3, ic, dsc, tIc, tDsc, axialTilt),
		dsc,
		computePolichPageCusp(2/3, dsc, mc, tDsc, tMc, axialTilt),
		computePolichPageCusp(1/3, dsc, mc, tDsc, tMc, axialTilt),
		mc,
		computePolichPageCusp(2/3, mc, asc, tMc, tAsc, axialTilt),
		computePolichPageCusp(1/3, mc, asc, tMc, tAsc, axialTilt)
	]
}

export function computeHouseCuspPositions(date: Date, surfacePosition: SurfacePosition, houseSystem: HouseSystem, knownNodes: Map<Node, number>, siderealOffset: number): number[]{
	const angles = {
		asc: knownNodes.get(Node.ASCENDANT)!,
		dsc: knownNodes.get(Node.DESCENDANT)!,
		mc: knownNodes.get(Node.MIDHEAVEN)!,
		ic: knownNodes.get(Node.IMUM_COELI)!
	}
	switch (houseSystem) {
		case HouseSystem.WHOLE_SIGN:
			return computeWholeSignCuspPositions(angles, siderealOffset);
		case HouseSystem.EQUAL_HOUSES:
			return computeEqualHousesCuspPositions(angles);
		case HouseSystem.PORPHYRY:
			return computePorphyryCuspPositions(angles);
		case HouseSystem.EQUAL_HOUSES_VEHLOW:
			return computeEqualHousesVehlowCuspPositions(angles);
		case HouseSystem.WHOLE_SIGN_ARIES:
			return computeWholeSignAriesCuspPositions(angles, siderealOffset);
		case HouseSystem.KRUSINSKY:
			return computeKrusinskyCuspPositions(date, surfacePosition);
		case HouseSystem.REGIOMONTANUS:
			return computeRegiomontanusCuspPositions(date, surfacePosition);
		case HouseSystem.MERIDIAN:
			return computeMeridianCuspPositions(date, surfacePosition);
		case HouseSystem.MORINUS:
			return computeMorinusCuspPositions(date, surfacePosition);
		case HouseSystem.CAMPANUS:
			return computeCampanusCuspPositions(date, surfacePosition);
		case HouseSystem.ZENITH_HORIZONTAL:
			return computeZenithHorizontalCuspPositions(date, surfacePosition);
		case HouseSystem.PLACIDUS:
			return computePlacidusCuspPositions(date, surfacePosition, angles);
		case HouseSystem.KOCH:
			return computeKochCuspPositions(date, surfacePosition, angles);
		default:
			throw new Error("something wrong with house computation dispatch:", houseSystem);
	}
}
