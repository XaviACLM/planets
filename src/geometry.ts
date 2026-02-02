import { type SurfacePosition } from './astroDefs.ts'

import { Vector, RotateVector, Rotation_HOR_EQJ, Rotation_ECT_EQJ, AstroTime, Observer, Rotation_EQD_EQJ } from "astronomy-engine";

export interface vec3 {
	x: number;
	y: number;
	z: number
}

export function toAstronomyVector(v: vec3, time: Date = new Date()): Vector {
	return new Vector(v.x, v.y, v.z, new AstroTime(time));
}

function normVec(v: vec3): number {
	return Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
}

function dot(v: vec3, w: vec3): number {
	return v.x*w.x+v.y*w.y+v.z*w.z;
}

export function normalize(v: vec3): vec3 {
	const r = normVec(v);
	return {x:v.x/r, y:v.y/r, z:v.z/r};
}

function flipVec(v: vec3): vec3 {
	return {x:-v.x, y:-v.y, z:-v.z};
}

export function cross(v: vec3, w: vec3): vec3 {
	return {
		x: v.y*w.z - v.z*w.y,
		y: v.z*w.x - v.x*w.z,
		z: v.x*w.y - v.y*w.x
	}
}

export function computeAllSignificantPoints(date: Date, surfacePosition: SurfacePosition) {
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
	
	let asc = normalize(cross(ecliptic, horizon));
	if ( dot(asc, E) > 0 ) { asc = flipVec(asc); }
	const dsc = flipVec(asc);
	
	let mc = normalize(cross(ecliptic, meridian));
	if (dot(mc, zenith) < 0) mc = flipVec(mc);
	const ic = flipVec(mc);
	
	let vx = normalize(cross(ecliptic, primeVertical));
	if (dot(vx, W) < 0) vx = flipVec(vx);
	let avx = flipVec(vx);
	
	return {N, S, E, W, zenith, nadir, ecliptic, equator, primeVertical, meridian, horizon, asc, dsc, mc, ic, vx, avx, eqN, ecN};
}
