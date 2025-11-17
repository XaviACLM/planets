import { normalizeAngleRad, interpolateAngles } from './util.ts'

import { Node, type SurfacePosition } from './astro.ts'

import { RotateVector, Rotation_HOR_EQJ, Rotation_ECL_EQJ, Rotation_EQJ_ECL } from "astronomy-engine";

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
	
	PLACIDUS = "Placidus",
	TOPOCENTRIC = "Topocentric",
	KOCH = "Koch",
	CAMPANUS = "Campanus",
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

function normalize(v: vec3): vec3 {
	const r = Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
	return {x:v.x/r, y:v.y/r, z:v.y/r};
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
		z: v.z*w.y - v.y*w.x
	}
}

function cardinals(date: Date, surfacePosition: SurfacePosition) {
	const rot = Rotation_HOR_EQJ(date, surfacePosition);
	const N = normalize(RotateVector(rot, {x:1, y:0, z:0}));
	const W = normalize(RotateVector(rot, {x:0, y:1, z:0}));
	const zenith = normalize(RotateVector(rot, {x:0, y:0, z:1}));
	const S = flipVec(N);
	const E = flipVec(W);
	const nadir = flipVec(zenith);
	return {N, S, E, W, zenith, nadir};
}

function greatCircles(date: Date, surfacePosition: SurfacePosition) {
	const ecliptic = normalize(RotateVector(Rotation_ECL_EQJ(), {x:0, y:0, z:1}));
	const equator = {x:0, y:0, z:1};
	const {N, E, zenith} = cardinals(date, surfacePosition);
	const primeVertical = normalize(cross(zenith,E));
	const meridian = normalize(cross(zenith,N));
	const horizon = normalize(cross(N, E));
	return {ecliptic, equator, primeVertical, meridian, horizon};
}

function ascendantDescendant(date: Date, surfacePosition: SurfacePosition) {
	// this is not the same as the axisAngles: this is full position in the celestial sphere, that is just angle along the ecliptic
	const {ecliptic, horizon} = greatCircles(date, surfacePosition);
	const asc = normalize(cross(horizon, ecliptic));
	console.log("ecliptic", ecliptic);
	console.log("horizon", horizon);
	console.log("asc", asc);
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
	//const f = dot(circle, q);
	//const pq = {
	//	x: q.x - circle.x*f,
	//	y: q.y - circle.y*f,
	//	z: q.z - circle.z*f
	//};
	//const p = normalize(pq);
	//return dot(p, center) >= 0 ? p : flipVec(p);
	const lambda = dot(center, circle)/dot(q, circle);
	return normalize({
		x:q.x + lambda*center.x,
		y:q.y + lambda*center.y,
		z:q.z + lambda*center.z,
	});
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
	console.log("asc",asc);
	console.log("kpts",kpts);
	console.log("ecliptic",ecliptic);
	console.log("equator",equator);
	console.log("epts",epts);
	return computeEclipticAngles(epts);
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
		default:
			console.log("something wrong with house computation dispatch:", houseSystem);
	}
}
