import { normalizeAngleRad, interpolateAngles } from './util.ts'

import { Node, type SurfacePosition } from './astro.ts'

import { RotateVector, Rotation_HOR_EQJ, Rotation_ECL_EQJ, Rotation_EQJ_ECL, AstroTime, Observer, Rotation_EQD_EQJ } from "astronomy-engine";

export interface AxisAngles {
	asc: number;
	dsc: number;
	mc: number;
	ic: number
}

export enum HouseSystem {
	WHOLE_SIGN = "Whole Sign",
	EQUAL_HOUSES = "Equal Houses",
	PORPHYRY = "Porphyry",
	
	KRUSINSKY = "Krusinsky",
	REGIOMONTANUS = "Regiomontanus",
	MERIDIAN = "Meridian",
	MORINUS = "Morinus",
	CAMPANUS = "Campanus",
	ZENITH_HORIZONTAL = "Zenith / Horizontal",
	
	PLACIDUS = "Placidus",
	TOPOCENTRIC = "Topocentric",
	KOCH = "Koch",
	ALCABITIUS = "Alcabitius",
}

function computeWholeSignCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
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

function computeEqualHousesCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
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

function computePorphyryCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
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

interface vec3 {
	x: number;
	y: number;
	z: numer
}

function normVec(v: vec3): number {
	return Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
}

function normalize(v: vec3): vec3 {
	const r = normVec(v);
	return {x:v.x/r, y:v.y/r, z:v.z/r};
}

function dot(v: vec3, w: vec3): number {
	return v.x*w.x + v.y*w.y + v.z*w.z;
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

function cardinals(date: Date, surfacePosition: SurfacePosition) {
	const astroTime = new AstroTime(date);
	const obs = new Observer(surfacePosition.latitude, surfacePosition.longitude, 0); //height
	const rot = Rotation_HOR_EQJ(astroTime, obs);
	const N = normalize(RotateVector(rot, {x:1, y:0, z:0}));
	const E = normalize(RotateVector(rot, {x:0, y:1, z:0}));
	const zenith = normalize(RotateVector(rot, {x:0, y:0, z:1}));
	const S = flipVec(N);
	const W = flipVec(E);
	const nadir = flipVec(zenith);
	return {N, S, E, W, zenith, nadir};
}

function greatCircles(date: Date, surfacePosition: SurfacePosition) {
	const astroTime = new AstroTime(date);
	const ecliptic = normalize(RotateVector(Rotation_ECL_EQJ(), {x:0, y:0, z:1}));
	const equator = normalize(RotateVector(Rotation_EQD_EQJ(astroTime),{x:0, y:0, z:1}));
	const {N, E, zenith} = cardinals(date, surfacePosition);
	const primeVertical = N;
	const meridian = E;
	const horizon = zenith;
	return {ecliptic, equator, primeVertical, meridian, horizon};
}

function ascendantDescendant(date: Date, surfacePosition: SurfacePosition) {
	// this is not the same as the axisAngles: this is full position in the celestial sphere, that is just angle along the ecliptic
	const {ecliptic, horizon} = greatCircles(date, surfacePosition);
	const asc = normalize(cross(horizon, ecliptic));
	const dsc = flipVec(asc);
	return {asc, dsc};
}

function krusinskyCircle(date: Date, surfacePosition: SurfacePosition): vec3 {
	const {asc} = ascendantDescendant(date, surfacePosition);
	const {zenith} = cardinals(date, surfacePosition);
	return normalize(cross(asc, zenith));
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

function projectPoints(qs: Vec3[], circle: vec3, center: vec3): vec3[] {
	return qs.map(q => projectPoint(q, circle, center));
}

function computeEclipticAngle(p: vec3): number {
	const rot = Rotation_EQJ_ECL();
	const v = RotateVector(rot, p);
	const alpha = Math.atan2(v.y, v.x);
	return normalizeAngleRad(alpha);
}

function computeEclipticAngles(ps: vec3[]): number[] {
	return ps.map(p => computeEclipticAngle(p));
}

function computeKrusinskyCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	const {asc} = ascendantDescendant(date, surfacePosition);
	const kCircle = krusinskyCircle(date, surfacePosition);
	const kpts = twelvePoints(kCircle, asc);
	const {ecliptic, equator} = greatCircles(date, surfacePosition);
	const epts = projectPoints(kpts, ecliptic, equator); //project from equatorial poles to ecliptic
	//console.log("asc_json ='", JSON.stringify(asc),"'");
	//console.log("kpts_json ='", JSON.stringify(kpts),"'");
	//console.log("ecliptic_json ='", JSON.stringify(ecliptic),"'");
	//console.log("equator_json ='", JSON.stringify(equator),"'");
	//console.log("epts_json ='", JSON.stringify(epts),"'");
	return computeEclipticAngles(epts);
}

function computeRegiomontanusCuspPositions(date: Date, surfacePosition: SurfacePosition, angles: AxisAngles){
	const {N} = cardinals(date, surfacePosition);
	const {meridian, equator, ecliptic} = greatCircles(date, surfacePosition);
	const intersection = normalize(cross(meridian, equator));
	const kpts = twelvePoints(equator, intersection);
	const epts = projectPoints(kpts, ecliptic, N);
	const a = computeEclipticAngles(epts);
	console.log(a.slice(3).concat(a.slice(0,3)));
	return a.slice(3).concat(a.slice(0,3));
}

export function computeHouseCuspPositions(date: Date, surfacePosition: SurfacePosition, houseSystem: HouseSystem, knownNodes: Map<Node, number>): number[12]{
	const angles = {
		asc: knownNodes.get(Node.ASCENDANT),
		dsc: knownNodes.get(Node.DESCENDANT),
		mc: knownNodes.get(Node.MIDHEAVEN),
		ic: knownNodes.get(Node.IMUM_COELI)
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
		default:
			console.log("something wrong with house computation dispatch:", houseSystem);
	}
}
